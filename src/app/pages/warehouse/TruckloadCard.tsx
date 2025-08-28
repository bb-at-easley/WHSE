"use client";

type TruckloadCardProps = {
  delivery: {
    id: string;
    truckNumber?: string | null;
    easleyProNumber?: string | null;
    status: string;
    createdAt: Date;
    pallets: Array<{ status: string }>;
  };
};

export function TruckloadCard({ delivery }: TruckloadCardProps) {
  const palletCount = delivery.pallets.length;
  const receivedCount = delivery.pallets.filter(p => p.status === "RECEIVED").length;
  const startTime = new Date(delivery.createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div 
      style={{
        background: delivery.status === 'ACTIVE' ? '#e8f5e8' : '#f8f9fa',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${delivery.status === 'ACTIVE' ? '#4CAF50' : '#666'}`,
        opacity: delivery.status === 'ACTIVE' ? 1 : 0.8
      }}
      onClick={() => {
        window.location.href = `/warehouse/delivery/${delivery.id}`;
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {delivery.easleyProNumber ? `Order #${delivery.easleyProNumber}` : 'New Truckload'}
          {delivery.status === 'COMPLETED' && (
            <span style={{
              fontSize: '12px',
              color: '#4CAF50',
              fontWeight: '600'
            }}>
              ✓ COMPLETED
            </span>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666'
        }}>
          Started {startTime}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '14px'
      }}>
        <div style={{ color: '#666' }}>
          <strong style={{ color: '#333' }}>{palletCount}</strong> scanned
        </div>
        <div style={{ color: '#666' }}>
          <strong style={{ color: '#333' }}>{receivedCount}</strong> received
        </div>
      </div>
    </div>
  );
}