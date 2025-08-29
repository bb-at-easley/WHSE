"use client";

// Client component - renders list of pallets with click handling

type Pallet = {
  id: string;
  licensePlate: string;
  status: "RECEIVED" | "STAGED" | "STORED";
  scannedAt: Date;
  location?: string | null;
  pieceCount?: number | null;
  pieces?: Array<{
    partNumber: string;
    description: string;
  }>;
};

type PalletListProps = {
  pallets: Pallet[];
  onPalletClick?: (pallet: Pallet) => void;
  onDuplicatePallet?: (pallet: Pallet) => void;
};

export function PalletList({ pallets, onPalletClick, onDuplicatePallet }: PalletListProps) {
  if (pallets.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#999',
        padding: '40px 20px',
        fontStyle: 'italic'
      }}>
        Start adding pallets to track this truckload
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0 100px 0' }}>
      {pallets.map((pallet, index) => (
        <div
          key={pallet.id}
          style={{
            padding: '12px 16px',
            background: index === 0 ? '#e8f5e8' : '#f8f9fa', // Highlight most recent
            borderRadius: '6px',
            marginBottom: '6px',
            fontSize: '14px',
            cursor: onPalletClick ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}
          onClick={() => onPalletClick?.(pallet)}
          onMouseEnter={(e) => {
            if (onPalletClick) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (onPalletClick) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {/* Top row - LP and status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: pallet.pieces?.length || pallet.pieceCount ? '6px' : '0'
          }}>
            <span style={{ fontWeight: '600' }}>{pallet.licensePlate}</span>
            <span style={{ 
              color: getStatusColor(pallet.status) 
            }}>
              {getStatusText(pallet.status)}
            </span>
          </div>
          
          {/* Bottom row - piece info and actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            {/* Piece info or spacer */}
            <div style={{
              fontSize: '12px',
              color: '#666',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flex: 1
            }}>
              {pallet.pieceCount && (
                <span>{pallet.pieceCount} pieces</span>
              )}
              {pallet.pieces?.[0] && (
                <span>{pallet.pieces[0].partNumber} - {pallet.pieces[0].description}</span>
              )}
            </div>
            
            {/* Duplicate button - always on the right */}
            {onDuplicatePallet && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering pallet click
                  onDuplicatePallet(pallet);
                }}
                style={{
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1976D2';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2196F3';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📋 Duplicate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "RECEIVED": return '#4CAF50';
    case "STAGED": return '#FF9800';
    case "STORED": return '#4CAF50';
    default: return '#666';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "RECEIVED": return '✓ Received';
    case "STAGED": return 'Staged';
    case "STORED": return '✓ Stored';
    default: return status;
  }
}