/**
 * Format Validation Utilities
 * Warehouse-specific barcode format validation and recognition
 */

import type { BarcodeFormat, FormatValidation } from './scanTypes';
import { DEFAULT_FORMAT_VALIDATION } from './scanTypes';

/**
 * Validate scanned data against warehouse-specific patterns
 */
export function validateScannedData(
  data: string, 
  format: BarcodeFormat, 
  validation: FormatValidation = DEFAULT_FORMAT_VALIDATION
): { isValid: boolean; type?: 'licensePlate' | 'location' | 'partNumber'; reason?: string } {
  const cleanData = data.trim().toUpperCase();

  // Check license plate pattern
  if (validation.licensePlate.test(cleanData)) {
    return {
      isValid: true,
      type: 'licensePlate'
    };
  }

  // Check location pattern
  if (validation.location.test(cleanData)) {
    return {
      isValid: true,
      type: 'location'
    };
  }

  // Check part number pattern
  if (validation.partNumber.test(cleanData)) {
    return {
      isValid: true,
      type: 'partNumber'
    };
  }

  // Determine why validation failed
  let reason = 'Unknown format';
  
  if (cleanData.length < 6) {
    reason = 'Code too short (minimum 6 characters)';
  } else if (cleanData.length > 14) {
    reason = 'Code too long (maximum 14 characters)';
  } else if (!/^[A-Z0-9-]+$/.test(cleanData)) {
    reason = 'Contains invalid characters (only letters, numbers, and dashes allowed)';
  }

  return {
    isValid: false,
    reason
  };
}

/**
 * Get suggested format based on data patterns
 */
export function suggestBarcodeFormat(data: string): BarcodeFormat[] {
  const cleanData = data.trim().toUpperCase();
  const suggestions: BarcodeFormat[] = [];

  // QR codes often contain structured data or prefixes
  if (cleanData.includes('-') || cleanData.includes('://') || cleanData.length > 50) {
    suggestions.push('QR_CODE');
  }

  // EAN-13: exactly 13 digits
  if (/^\d{13}$/.test(cleanData)) {
    suggestions.push('EAN_13');
  }

  // EAN-8: exactly 8 digits
  if (/^\d{8}$/.test(cleanData)) {
    suggestions.push('EAN_8');
  }

  // UPC-A: 12 digits
  if (/^\d{12}$/.test(cleanData)) {
    suggestions.push('UPC_A');
  }

  // UPC-E: 6-8 digits
  if (/^\d{6,8}$/.test(cleanData)) {
    suggestions.push('UPC_E');
  }

  // CODE_128: alphanumeric, often used for license plates
  if (/^[A-Z0-9]{6,12}$/.test(cleanData)) {
    suggestions.push('CODE_128');
  }

  // CODE_39: alphanumeric with specific character set
  if (/^[A-Z0-9\-. $/+%]+$/.test(cleanData)) {
    suggestions.push('CODE_39');
  }

  // Default to QR_CODE if no specific pattern matches
  if (suggestions.length === 0) {
    suggestions.push('QR_CODE');
  }

  return suggestions;
}

/**
 * Create warehouse-specific validation rules
 */
export function createCustomValidation(rules: Partial<FormatValidation>): FormatValidation {
  return {
    ...DEFAULT_FORMAT_VALIDATION,
    ...rules
  };
}

/**
 * Validate specific warehouse entity types
 */
export const warehouseValidators = {
  /**
   * Validate license plate format
   */
  licensePlate: (data: string): boolean => {
    const clean = data.trim().toUpperCase();
    // License plates: 6-8 alphanumeric, may include PAL- prefix
    return /^(PAL-)?[A-Z0-9]{6,8}$/.test(clean);
  },

  /**
   * Validate location/bin format
   */
  location: (data: string): boolean => {
    const clean = data.trim().toUpperCase();
    // Locations: LOC- prefix or zone-aisle-level format
    return /^(LOC-[A-Z0-9]{2,10}|[A-Z]\d{2}-\d{2})$/.test(clean);
  },

  /**
   * Validate part number format
   */
  partNumber: (data: string): boolean => {
    const clean = data.trim().toUpperCase();
    // Part numbers: various manufacturer formats
    return /^[A-Z0-9]{8,14}$/.test(clean);
  },

  /**
   * Validate pro number (shipping)
   */
  proNumber: (data: string): boolean => {
    const clean = data.trim();
    // Pro numbers: typically 8-11 digits
    return /^\d{8,11}$/.test(clean);
  },

  /**
   * Validate order number
   */
  orderNumber: (data: string): boolean => {
    const clean = data.trim().toUpperCase();
    // Order numbers: may have prefixes like ORD-, SO-, etc.
    return /^(ORD-|SO-|PO-)?[A-Z0-9]{6,12}$/.test(clean);
  }
};

/**
 * Format scanned data for display
 */
export function formatScannedData(data: string, type?: string): string {
  const clean = data.trim().toUpperCase();

  switch (type) {
    case 'licensePlate':
      // Format license plate with dashes for readability
      if (clean.length === 6) {
        return `${clean.slice(0, 3)}-${clean.slice(3)}`;
      }
      return clean;

    case 'location':
      // Ensure location has proper prefix
      if (!clean.startsWith('LOC-') && /^[A-Z0-9]{2,10}$/.test(clean)) {
        return `LOC-${clean}`;
      }
      return clean;

    case 'partNumber':
      // Format part number with dashes every 4 characters for readability
      if (clean.length >= 8 && clean.length <= 12) {
        return clean.replace(/(.{4})/g, '$1-').replace(/-$/, '');
      }
      return clean;

    default:
      return clean;
  }
}