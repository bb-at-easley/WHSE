# Barcode Scanner Addon - Development Plan

## Project Overview
RWSDK addon for mobile-first barcode/QR code scanning in warehouse environments. Integrates with existing PalletModal and provides reusable scanning functionality across the application.

## Current Integration Points
- **PalletModal.tsx**: Lines 50-71 have placeholder `handleScanLP()` and `handleScanLocation()` functions
- **Existing UI**: Camera buttons (📷) already in place with proper styling
- **Expected formats**: License Plates (CODE_128), Locations (QR_CODE), Part Numbers (EAN_13/CODE_128)

## Technical Architecture

### Library Choice: nimiq/qr-scanner
**Rationale**: Best performance-to-size ratio for mobile
- 2-3x better detection rate than competitors
- Lightweight: ~16.3 kB gzipped  
- WebWorker support (non-blocking UI)
- Native BarcodeDetector API fallback
- Active maintenance, mobile-first design

### Addon Structure (RWSDK Pattern)
```
addons/barcode-scanner/
├── DEVELOPMENT_PLAN.md     # This file
├── package.json            # NPM package config
├── index.ts               # Main exports & API
├── src/
│   ├── BarcodeScanner.ts   # Core scanner class
│   ├── hooks/
│   │   ├── useBarcodeScanner.ts  # Main React hook
│   │   └── usePermissions.ts     # Camera permission handling
│   ├── components/
│   │   ├── ScanButton.tsx        # Industrial UI scan button
│   │   ├── ScanModal.tsx         # Full-screen scanner modal
│   │   └── ContinuousScanner.tsx # Live scanning component
│   ├── utils/
│   │   ├── formatValidation.ts   # Barcode format validation
│   │   ├── scanTypes.ts          # TypeScript definitions
│   │   └── errorHandling.ts      # Error management
│   └── styles/
│       └── scanner.css           # Warm Nordic design system
└── README.md              # Usage documentation
```

## Implementation Phases

### Phase 1: Core Infrastructure ✅ COMPLETED
- [x] Set up package.json with qr-scanner dependency
- [x] Implement base BarcodeScanner class with error handling
- [x] Create useBarcodeScanner React hook
- [x] Basic TypeScript interfaces and error types
- [x] Format validation utilities and warehouse-specific validators

### Phase 2: PalletModal Integration 
- [x] Replace handleScanLP placeholder with real scanning
- [ ] Replace handleScanLocation placeholder with real scanning
- [x] Add format-specific validation (LP, locations)
- [x] Implement proper error handling and user feedback
- [ ] Test on mobile devices for camera access

### Phase 3: UI Components
- [ ] ScanButton component with Warm Nordic styling
- [ ] Loading states and scanning indicators
- [ ] Permission request UI flow
- [ ] Error message components

### Phase 4: Advanced Features
- [ ] Continuous scanning mode for bulk operations
- [ ] File upload scanning capability
- [ ] Audio feedback options
- [ ] Performance optimizations

### Phase 5: Extended Integration
- [ ] Part number scanning with validation
- [ ] Future: Divco order number support  
- [ ] Future: Pro number sticker support

## Integration Example

### Current Placeholder (PalletModal.tsx:50-58)
```typescript
const handleScanLP = () => {
  // Generate LP for demo - TODO: integrate with barcode scanner
  const scannedLP = String(Math.floor(Math.random() * 999999) + 100000);
  setLicensePlate(scannedLP);
  
  if ('vibrate' in navigator) {
    navigator.vibrate(30);
  }
};
```

### After Integration
```typescript
import { useBarcodeScanner } from "../../../addons/barcode-scanner";

const { scan, isScanning, error } = useBarcodeScanner();

const handleScanLP = async () => {
  try {
    const result = await scan({ 
      formats: ['CODE_128', 'QR_CODE'],
      timeout: 15000,
      hapticFeedback: true,
      camera: { facingMode: 'environment' }
    });
    
    setLicensePlate(result.data);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  } catch (scanError) {
    console.log('Scan cancelled or failed:', scanError.message);
    // Could show alert or fallback to manual entry
  }
};
```

## API Design

### Core Types
```typescript
interface ScanOptions {
  formats?: ('QR_CODE' | 'CODE_128' | 'EAN_13' | 'EAN_8' | 'UPC_A' | 'UPC_E')[];
  timeout?: number;
  hapticFeedback?: boolean;
  audioFeedback?: boolean;
  camera?: { facingMode?: 'environment' | 'user' };
}

interface ScanResult {
  data: string;
  format: string;
  timestamp: Date;
  bounds?: { x: number; y: number; width: number; height: number };
}

interface ScanError {
  code: 'PERMISSION_DENIED' | 'CAMERA_ERROR' | 'TIMEOUT' | 'SCAN_CANCELLED';
  message: string;
  originalError?: Error;
}
```

### Hook API
```typescript
interface UseBarcodeScanner {
  scan: (options?: ScanOptions) => Promise<ScanResult>;
  isScanning: boolean;
  error: ScanError | null;
  lastResult: ScanResult | null;
  isSupported: boolean;
  requestPermissions: () => Promise<boolean>;
}
```

## Error Handling Strategy
- **Permission denied**: Clear instructions to enable camera
- **Scan timeout**: Option to retry or enter manually
- **Invalid format**: Show expected format guidance  
- **Poor lighting**: Tips for better scanning conditions
- **No camera**: Graceful fallback to manual entry
- **Network issues**: Offline validation when possible

## Mobile Optimization
- **Touch-friendly**: Large, thumb-zone optimized buttons
- **Orientation**: Works in portrait/landscape  
- **Performance**: Web Worker prevents UI blocking
- **Battery**: Efficient camera usage with timeouts
- **Accessibility**: Screen reader support, high contrast

## Warehouse-Specific Features
- **Industrial UI**: Warm Nordic design system compatibility
- **Haptic feedback**: Vibration on successful scans
- **Multiple formats**: QR codes, Code 128, EAN-13, UPC
- **Validation**: Format-specific validation rules
- **Retry logic**: Handle damaged/poor quality codes
- **Bulk scanning**: Continuous mode for inventory tasks

## Testing Requirements
- **Device testing**: iOS Safari, Android Chrome, various screen sizes
- **Format testing**: All supported barcode/QR types
- **Edge cases**: Poor lighting, damaged codes, no permissions
- **Performance**: Memory usage, battery impact, camera startup time
- **Integration**: Seamless replacement of existing placeholders

## Future Expansion
- **Order number scanning**: Divco integration
- **Pro number stickers**: TMS integration
- **Inventory management**: Product validation
- **Location mapping**: Warehouse layout integration
- **Analytics**: Scan success rates, performance metrics

## RWSDK Patterns to Follow
- **Colocation**: Keep related functionality together
- **Self-contained**: No glue code required for integration  
- **TypeScript-first**: Full type safety
- **Mobile-optimized**: Touch-friendly, responsive design
- **Server-side compatible**: Works with RWSDK's SSR approach
- **Minimal dependencies**: Lightweight, focused functionality

## Dependencies
```json
{
  "dependencies": {
    "nimiq-qr-scanner": "^1.8.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "rwsdk": ">=0.1.0"
  }
}
```

## Success Criteria
- [ ] Drop-in replacement for existing placeholder functions
- [ ] Works on iOS/Android mobile browsers
- [ ] Scans License Plates, Locations, Part Numbers reliably
- [ ] Proper error handling with user-friendly messages
- [ ] Performance: <500ms camera startup, <2s scan detection
- [ ] Battery efficient with proper cleanup
- [ ] Follows Warm Nordic design system
- [ ] Zero breaking changes to existing PalletModal UI

## Session Recovery Notes
- Current session working on: Phase 2 PalletModal Integration - LP Scanning ✅ COMPLETED
- Last completed: Integrated real barcode scanning into PalletModal handleScanLP function with proper error handling, validation, and UI feedback
- Next steps: Complete Phase 2 with handleScanLocation integration, then test on mobile devices
- Blockers/Issues: None - LP scanning integration successful, ready for location scanning

---

This plan serves as the single source of truth for the barcode scanner addon development. Update as we progress through implementation phases.