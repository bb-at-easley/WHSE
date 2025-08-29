/**
 * Error Handling Utilities
 * Comprehensive error management for barcode scanning operations
 */

import type { ScanError, ScanErrorCode } from './scanTypes.ts';

/**
 * Creates a standardized ScanError with user-friendly messages and recovery actions
 */
export function createScanError(
  code: ScanErrorCode,
  message: string,
  originalError?: Error
): ScanError {
  const error: ScanError = {
    code,
    message,
    originalError,
    userMessage: getUserMessage(code),
    recoveryActions: getRecoveryActions(code)
  };

  return error;
}

/**
 * Converts native errors to ScanError instances
 */
export function handleNativeError(error: Error): ScanError {
  const errorName = error?.name || '';
  const errorMessage = error?.message || 'Unknown error';

  // Camera permission errors
  if (errorName === 'NotAllowedError' || errorMessage.includes('permission')) {
    return createScanError(
      'PERMISSION_DENIED',
      'Camera permission was denied',
      error
    );
  }

  // Camera not available errors
  if (errorName === 'NotFoundError' || errorMessage.includes('camera')) {
    return createScanError(
      'CAMERA_ERROR',
      'Camera is not available or in use',
      error
    );
  }

  // Generic camera errors
  if (errorName === 'NotReadableError' || errorName === 'AbortError') {
    return createScanError(
      'CAMERA_ERROR',
      'Unable to access camera hardware',
      error
    );
  }

  // Network/loading errors
  if (errorMessage.includes('network') || errorMessage.includes('load')) {
    return createScanError(
      'NETWORK_ERROR',
      'Failed to load scanner resources',
      error
    );
  }

  // Content Security Policy errors
  if (errorMessage.includes('Content Security Policy') || errorMessage.includes('worker')) {
    return createScanError(
      'NETWORK_ERROR',
      'Scanner blocked by security policy',
      error
    );
  }

  // HTTPS/secure context errors
  if (errorMessage.includes('https') || errorMessage.includes('secure')) {
    return createScanError(
      'PERMISSION_DENIED',
      'Camera requires HTTPS connection',
      error
    );
  }

  // Fallback for unknown errors
  return createScanError(
    'CAMERA_ERROR',
    errorMessage || 'Unknown scanner error',
    error
  );
}

/**
 * Get user-friendly error messages
 */
function getUserMessage(code: ScanErrorCode): string {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'Camera access is required for barcode scanning. Note: Camera access requires HTTPS in production. For local development, you can use localhost or enable camera permissions manually.';
      
    case 'CAMERA_ERROR':
      return 'Unable to access camera. Please check if camera is available and not being used by another app.';
      
    case 'TIMEOUT':
      return 'Scan timed out. Please try again or enter the code manually.';
      
    case 'SCAN_CANCELLED':
      return 'Scan was cancelled. You can try again or enter the code manually.';
      
    case 'INVALID_FORMAT':
      return 'The scanned code format is not supported. Please try a different barcode or QR code.';
      
    case 'UNSUPPORTED_DEVICE':
      return 'Barcode scanning is not supported on this device. Please enter codes manually.';
      
    case 'NETWORK_ERROR':
      return 'Unable to load scanner due to security policy or network issues. For local development, this may be due to Content Security Policy restrictions.';
      
    default:
      return 'An unexpected error occurred while scanning. Please try again.';
  }
}

/**
 * Get suggested recovery actions for each error type
 */
function getRecoveryActions(code: ScanErrorCode): string[] {
  switch (code) {
    case 'PERMISSION_DENIED':
      return [
        'Enable camera permissions in browser settings',
        'Reload the page and allow camera access',
        'Check device camera permissions'
      ];
      
    case 'CAMERA_ERROR':
      return [
        'Close other apps using the camera',
        'Check camera hardware connection',
        'Try refreshing the page',
        'Use manual entry as alternative'
      ];
      
    case 'TIMEOUT':
      return [
        'Ensure good lighting conditions',
        'Hold barcode steady and in focus',
        'Try moving closer or further from code',
        'Use manual entry if scanning continues to fail'
      ];
      
    case 'SCAN_CANCELLED':
      return [
        'Tap the scan button to try again',
        'Use manual entry if needed'
      ];
      
    case 'INVALID_FORMAT':
      return [
        'Try scanning a QR code or standard barcode',
        'Check if the code is damaged or unclear',
        'Use manual entry for unsupported formats'
      ];
      
    case 'UNSUPPORTED_DEVICE':
      return [
        'Use manual entry on this device',
        'Try using a different device with camera support'
      ];
      
    case 'NETWORK_ERROR':
      return [
        'Check internet connection',
        'Try refreshing the page',
        'Use manual entry if offline'
      ];
      
    default:
      return [
        'Try scanning again',
        'Refresh the page',
        'Use manual entry as alternative'
      ];
  }
}

/**
 * Check if an error is recoverable (user can retry)
 */
export function isRecoverableError(error: ScanError): boolean {
  const recoverableCodes: ScanErrorCode[] = [
    'TIMEOUT',
    'SCAN_CANCELLED',
    'CAMERA_ERROR',
    'NETWORK_ERROR'
  ];
  
  return recoverableCodes.includes(error.code);
}

/**
 * Check if device supports barcode scanning
 */
export function isScanningSupported(): boolean {
  // Return false during SSR (server-side rendering)
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check for required APIs
  const hasGetUserMedia = !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );
  
  const hasCanvas = !!(
    window.CanvasRenderingContext2D ||
    window.OffscreenCanvasRenderingContext2D
  );

  // Check if we're in a secure context (required for camera access)
  const isSecureContext = window.isSecureContext || location.protocol === 'https:';
  
  return hasGetUserMedia && hasCanvas && isSecureContext;
}