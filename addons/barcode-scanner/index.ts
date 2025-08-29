/**
 * @rwsdk/barcode-scanner
 * 
 * Mobile-first barcode scanning addon for warehouse environments.
 * Integrates with PalletModal and provides reusable scanning functionality.
 */

// Export main scanner class
export { BarcodeScanner } from './src/BarcodeScanner';

// Export React hooks
export { useBarcodeScanner, usePermissions } from './src/hooks/useBarcodeScanner';

// Export TypeScript types
export type {
  BarcodeFormat,
  ScanOptions,
  ScanResult,
  ScanError,
  ScanErrorCode,
  ScannerState,
  FormatValidation
} from './src/utils/scanTypes';

// Export UseBarcodeScanner type from the hooks file
export type { UseBarcodeScanner } from './src/hooks/useBarcodeScanner';

// Export utilities
export {
  createScanError,
  handleNativeError,
  isScanningSupported,
  isRecoverableError
} from './src/utils/errorHandling';

export { DEFAULT_FORMAT_VALIDATION } from './src/utils/scanTypes';

export {
  validateScannedData,
  suggestBarcodeFormat,
  createCustomValidation,
  warehouseValidators,
  formatScannedData
} from './src/utils/formatValidation';

// Re-export the main class as default
export { BarcodeScanner as default } from './src/BarcodeScanner';