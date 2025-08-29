/**
 * useBarcodeScanner - React Hook
 * Main React hook for integrating barcode scanning into components
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BarcodeScanner } from '../BarcodeScanner';
import type { 
  ScanOptions, 
  ScanResult, 
  ScanError, 
  ScannerState 
} from '../utils/scanTypes';

export interface UseBarcodeScanner {
  /** Start a scan operation with optional configuration */
  scan: (options?: ScanOptions) => Promise<ScanResult>;
  /** Check if scanning is currently in progress */
  isScanning: boolean;
  /** Check if scanner is initializing */
  isInitializing: boolean;
  /** Current error state, null if no error */
  error: ScanError | null;
  /** Last successful scan result */
  lastResult: ScanResult | null;
  /** Check if barcode scanning is supported on this device */
  isSupported: boolean;
  /** Check camera permission status */
  hasPermission: boolean | null;
  /** Request camera permissions from user */
  requestPermissions: () => Promise<boolean>;
  /** Stop current scanning operation */
  stopScanning: () => void;
  /** Cancel current scan (rejects the scan promise) */
  cancelScan: () => void;
  /** Clear error state */
  clearError: () => void;
  /** Clear last result */
  clearResult: () => void;
}

/**
 * Main barcode scanner hook
 * 
 * @example
 * ```tsx
 * function PalletModal() {
 *   const { scan, isScanning, error, lastResult } = useBarcodeScanner();
 * 
 *   const handleScanLP = async () => {
 *     try {
 *       const result = await scan({
 *         formats: ['CODE_128'],
 *         timeout: 15000,
 *         hapticFeedback: true
 *       });
 *       setLicensePlate(result.data);
 *     } catch (scanError) {
 *       console.log('Scan failed:', scanError.message);
 *     }
 *   };
 * 
 *   return (
 *     <button onClick={handleScanLP} disabled={isScanning}>
 *       {isScanning ? 'Scanning...' : 'Scan License Plate'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useBarcodeScanner(): UseBarcodeScanner {
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    isInitializing: false,
    hasPermission: null,
    lastResult: null,
    error: null
  });

  // Initialize scanner instance
  useEffect(() => {
    scannerRef.current = new BarcodeScanner();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  // Update state when scanner state changes
  const updateState = useCallback(() => {
    if (scannerRef.current) {
      setState(scannerRef.current.getState());
    }
  }, []);

  // Polling for state updates (TODO: could be optimized with events)
  useEffect(() => {
    const interval = setInterval(updateState, 100);
    return () => clearInterval(interval);
  }, [updateState]);

  const scan = useCallback(async (options?: ScanOptions): Promise<ScanResult> => {
    if (!scannerRef.current) {
      throw new Error('Scanner not initialized');
    }

    try {
      const result = await scannerRef.current.scan(options);
      updateState();
      return result;
    } catch (error) {
      updateState();
      throw error;
    }
  }, [updateState]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!scannerRef.current) {
      return false;
    }

    const hasPermission = await scannerRef.current.requestPermissions();
    updateState();
    return hasPermission;
  }, [updateState]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stopScanning();
      updateState();
    }
  }, [updateState]);

  const cancelScan = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.cancelScan();
      updateState();
    }
  }, [updateState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, lastResult: null }));
  }, []);

  return {
    scan,
    isScanning: state.isScanning,
    isInitializing: state.isInitializing,
    error: state.error,
    lastResult: state.lastResult,
    isSupported: BarcodeScanner.isSupported(),
    hasPermission: state.hasPermission,
    requestPermissions,
    stopScanning,
    cancelScan,
    clearError,
    clearResult
  };
}

/**
 * Hook for camera permissions management
 */
export function usePermissions() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<ScanError | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setIsRequesting(true);
    setError(null);

    try {
      const scanner = new BarcodeScanner();
      const granted = await scanner.requestPermissions();
      setHasPermission(granted);
      
      if (granted) {
        scanner.destroy();
      } else {
        setError(scanner.getState().error);
      }
      
      return granted;
    } catch (err) {
      const scanError = err as ScanError;
      setError(scanError);
      setHasPermission(false);
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const granted = result.state === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      // Fallback to testing camera access
      return requestPermissions();
    }
  }, [requestPermissions]);

  useEffect(() => {
    // Check permissions on mount
    checkPermissions();
  }, [checkPermissions]);

  return {
    hasPermission,
    isRequesting,
    error,
    requestPermissions,
    checkPermissions
  };
}