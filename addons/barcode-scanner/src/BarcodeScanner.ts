/**
 * BarcodeScanner - Core scanning functionality
 * Mobile-optimized barcode scanning with qr-scanner library
 */

import QrScanner from 'qr-scanner';
import type { 
  BarcodeFormat, 
  ScanOptions, 
  ScanResult, 
  ScanError,
  ScannerState 
} from './utils/scanTypes';
import { 
  createScanError, 
  handleNativeError, 
  isScanningSupported 
} from './utils/errorHandling';

export class BarcodeScanner {
  private scanner: QrScanner | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isInitialized = false;
  private currentScanPromise: Promise<ScanResult> | null = null;
  private scanTimeout: NodeJS.Timeout | null = null;
  private state: ScannerState = {
    isScanning: false,
    isInitializing: false,
    hasPermission: null,
    lastResult: null,
    error: null
  };

  constructor() {
    // Skip device support check during SSR
    if (typeof window !== 'undefined' && !isScanningSupported()) {
      this.state.error = createScanError(
        'UNSUPPORTED_DEVICE',
        'Device does not support barcode scanning'
      );
    }
  }

  /**
   * Get current scanner state
   */
  public getState(): ScannerState {
    return { ...this.state };
  }

  /**
   * Check if scanner is supported on current device
   */
  public static isSupported(): boolean {
    // Return false during SSR
    if (typeof window === 'undefined') {
      return false;
    }
    return isScanningSupported();
  }

  /**
   * Request camera permissions
   */
  public async requestPermissions(): Promise<boolean> {
    // Return false during SSR
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.state.hasPermission = false;
      return false;
    }

    try {
      // Test camera access with minimal constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      this.state.hasPermission = true;
      this.state.error = null;
      
      return true;
    } catch (error) {
      const scanError = handleNativeError(error as Error);
      this.state.hasPermission = false;
      this.state.error = scanError;
      
      return false;
    }
  }

  /**
   * Initialize the scanner with video element
   */
  private async initialize(options: ScanOptions = {}): Promise<void> {
    if (this.isInitialized && this.scanner) {
      return;
    }

    this.state.isInitializing = true;
    this.state.error = null;

    try {
      // Create video element for scanning
      this.videoElement = document.createElement('video');
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = '100%';
      this.videoElement.style.objectFit = 'cover';

      // Initialize QR Scanner with warehouse-optimized settings
      this.scanner = new QrScanner(
        this.videoElement,
        (result) => this.handleScanSuccess(result),
        {
          // Prefer back camera for warehouse use
          preferredCamera: options.camera?.facingMode === 'user' ? 'user' : 'environment',
          // High frequency scanning for mobile
          highlightScanRegion: true,
          highlightCodeOutline: true,
          // Optimize for various formats
          maxScansPerSecond: 5,
          // Return detailed scan info
          returnDetailedScanResult: true,
        }
      );

      this.isInitialized = true;
      this.state.isInitializing = false;

    } catch (error) {
      this.state.error = handleNativeError(error as Error);
      this.state.isInitializing = false;
      throw this.state.error;
    }
  }

  /**
   * Start scanning with options
   */
  public async scan(options: ScanOptions = {}): Promise<ScanResult> {
    // Return existing scan if already in progress
    if (this.currentScanPromise) {
      return this.currentScanPromise;
    }

    // Check device support
    if (!isScanningSupported()) {
      throw createScanError(
        'UNSUPPORTED_DEVICE',
        'Barcode scanning not supported on this device'
      );
    }

    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize(options);
    }

    if (!this.scanner || !this.videoElement) {
      throw createScanError(
        'CAMERA_ERROR',
        'Scanner initialization failed'
      );
    }

    // Create scan promise
    this.currentScanPromise = this.performScan(options);
    
    try {
      return await this.currentScanPromise;
    } finally {
      this.currentScanPromise = null;
    }
  }

  /**
   * Perform the actual scan operation
   */
  private async performScan(options: ScanOptions): Promise<ScanResult> {
    return new Promise(async (resolve, reject) => {
      if (!this.scanner || !this.videoElement) {
        reject(createScanError('CAMERA_ERROR', 'Scanner not initialized'));
        return;
      }

      // Set up timeout
      const timeout = options.timeout || 15000;
      this.scanTimeout = setTimeout(() => {
        this.stopScanning();
        reject(createScanError('TIMEOUT', `Scan timed out after ${timeout}ms`));
      }, timeout);

      // Store resolve/reject for success handler
      (this.scanner as any)._resolvePromise = resolve;
      (this.scanner as any)._rejectPromise = reject;
      (this.scanner as any)._scanOptions = options;

      try {
        this.state.isScanning = true;
        this.state.error = null;

        // Start camera and scanning
        await this.scanner.start();

      } catch (error) {
        this.stopScanning();
        const scanError = handleNativeError(error as Error);
        reject(scanError);
      }
    });
  }

  /**
   * Handle successful scan result
   */
  private handleScanSuccess(result: any): void {
    if (!this.scanner) return;

    const scanOptions = (this.scanner as any)._scanOptions as ScanOptions;
    const resolvePromise = (this.scanner as any)._resolvePromise;

    if (!resolvePromise) return;

    try {
      // Extract data and format from qr-scanner result
      const data = typeof result === 'string' ? result : result.data;
      const format = this.detectBarcodeFormat(data);

      // Validate format if specified
      if (scanOptions.formats && !scanOptions.formats.includes(format)) {
        return; // Continue scanning for valid format
      }

      // Apply custom validation if provided
      if (scanOptions.validator && !scanOptions.validator(data, format)) {
        return; // Continue scanning for valid data
      }

      const scanResult: ScanResult = {
        data,
        format,
        timestamp: new Date(),
        bounds: result.bounds || result.cornerPoints ? {
          x: result.bounds?.x || 0,
          y: result.bounds?.y || 0,
          width: result.bounds?.width || 0,
          height: result.bounds?.height || 0
        } : undefined
      };

      // Provide haptic feedback
      if (scanOptions.hapticFeedback !== false && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }

      // Provide audio feedback
      if (scanOptions.audioFeedback) {
        this.playSuccessSound();
      }

      this.state.lastResult = scanResult;
      this.stopScanning();
      resolvePromise(scanResult);

    } catch (error) {
      // Continue scanning on processing error
      console.warn('Error processing scan result:', error);
    }
  }

  /**
   * Detect barcode format from scanned data
   * TODO: Integrate with actual format detection from qr-scanner
   */
  private detectBarcodeFormat(data: string): BarcodeFormat {
    // Simple heuristic-based format detection
    // In production, this would use the format info from the scanner
    
    if (data.startsWith('LOC-')) return 'QR_CODE';
    if (data.length >= 12 && /^\d+$/.test(data)) return 'EAN_13';
    if (data.length >= 6 && /^[A-Z0-9]+$/.test(data)) return 'CODE_128';
    
    return 'QR_CODE'; // Default fallback
  }

  /**
   * Play success sound for audio feedback
   */
  private playSuccessSound(): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Ignore audio errors
    }
  }

  /**
   * Stop scanning and cleanup
   */
  public stopScanning(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.scanner) {
      this.scanner.stop();
    }

    this.state.isScanning = false;
  }

  /**
   * Cancel current scan operation
   */
  public cancelScan(): void {
    if (this.scanner && (this.scanner as any)._rejectPromise) {
      const rejectPromise = (this.scanner as any)._rejectPromise;
      this.stopScanning();
      rejectPromise(createScanError('SCAN_CANCELLED', 'Scan was cancelled by user'));
    }
  }

  /**
   * Cleanup and destroy scanner
   */
  public destroy(): void {
    this.stopScanning();
    
    if (this.scanner) {
      this.scanner.destroy();
      this.scanner = null;
    }
    
    if (this.videoElement) {
      this.videoElement.remove();
      this.videoElement = null;
    }
    
    this.isInitialized = false;
    this.currentScanPromise = null;
  }
}