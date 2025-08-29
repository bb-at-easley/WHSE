/**
 * Barcode Scanner Types
 * Core TypeScript definitions for the barcode scanner addon
 */

export type BarcodeFormat = 
  | 'QR_CODE'
  | 'CODE_128' 
  | 'EAN_13'
  | 'EAN_8'
  | 'UPC_A'
  | 'UPC_E'
  | 'CODE_39'
  | 'DATA_MATRIX';

export interface ScanOptions {
  /** Barcode formats to accept. If not specified, accepts all supported formats */
  formats?: BarcodeFormat[];
  /** Timeout for scan operation in milliseconds. Default: 15000 (15s) */
  timeout?: number;
  /** Enable haptic feedback on successful scan. Default: true */
  hapticFeedback?: boolean;
  /** Enable audio feedback on successful scan. Default: false */
  audioFeedback?: boolean;
  /** Camera configuration */
  camera?: {
    /** Camera facing mode. Default: 'environment' (rear camera) */
    facingMode?: 'environment' | 'user';
  };
  /** Custom validation function for scanned data */
  validator?: (data: string, format: BarcodeFormat) => boolean;
}

export interface ScanResult {
  /** The decoded barcode data */
  data: string;
  /** The detected barcode format */
  format: BarcodeFormat;
  /** Timestamp when the scan was completed */
  timestamp: Date;
  /** Bounding box of the detected code (if available) */
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type ScanErrorCode = 
  | 'PERMISSION_DENIED'
  | 'CAMERA_ERROR'
  | 'TIMEOUT'
  | 'SCAN_CANCELLED'
  | 'INVALID_FORMAT'
  | 'UNSUPPORTED_DEVICE'
  | 'NETWORK_ERROR';

export interface ScanError {
  code: ScanErrorCode;
  message: string;
  originalError?: Error;
  /** User-friendly message for display */
  userMessage?: string;
  /** Suggested recovery actions */
  recoveryActions?: string[];
}

export interface ScannerState {
  isScanning: boolean;
  isInitializing: boolean;
  hasPermission: boolean | null;
  lastResult: ScanResult | null;
  error: ScanError | null;
}

/**
 * Warehouse-specific barcode format validation
 */
export interface FormatValidation {
  /** License Plate patterns (typically CODE_128) */
  licensePlate: RegExp;
  /** Location/bin patterns (typically QR_CODE) */
  location: RegExp;
  /** Part number patterns (EAN_13, CODE_128) */
  partNumber: RegExp;
}

export const DEFAULT_FORMAT_VALIDATION: FormatValidation = {
  // License plates: 6-8 alphanumeric characters
  licensePlate: /^[A-Z0-9]{6,8}$/,
  // Locations: LOC- prefix followed by alphanumeric
  location: /^LOC-[A-Z0-9]{2,10}$/,
  // Part numbers: Various formats, 8-14 digits/chars
  partNumber: /^[A-Z0-9]{8,14}$/
};