"use client";

import { useState } from "react";
import { TruckloadEditModal } from "./TruckloadEditModal";
import { updateTruckload } from "./truckloadActions";

type DeliveryHeaderProps = {
  delivery: {
    id: string;
    truckNumber?: string | null;
    trailerNumber?: string | null;
    sealNumber?: string | null;
    bolNumber?: string | null;
    easleyProNumber?: string | null;
    notes?: string | null;
    status: string;
    pallets: Array<{ id: string; status: string }>;
  };
};

export function DeliveryHeader({ delivery }: DeliveryHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const palletCount = delivery.pallets.length;
  const receivedCount = delivery.pallets.filter(p => p.status === "RECEIVED").length;

  const handleSave = async (formData: any) => {
    await updateTruckload(delivery.id, formData);
    window.location.reload();
  };

  const handleMarkComplete = async () => {
    await updateTruckload(delivery.id, { status: "COMPLETED" });
    window.location.reload();
  };
  
  return (
    <>
      <div style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        {/* Top row - Order name and Edit Details button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {delivery.easleyProNumber ? `Order #${delivery.easleyProNumber}` : 'New Truckload'}
          </div>
          
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: '8px 16px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f0f0f0';
            }}
          >
            Edit Details
          </button>
        </div>
        
        {/* Bottom row - Status info and Mark Complete button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            color: '#2196F3',
            fontWeight: 'bold'
          }}>
            {palletCount} pallets received
          </div>
          
          {delivery.status === 'ACTIVE' && (
            <button
              onClick={handleMarkComplete}
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#45a049';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#4CAF50';
              }}
            >
              Mark Complete
            </button>
          )}
        </div>
        
        {/* Show status if not active */}
        {delivery.status !== 'ACTIVE' && (
          <div style={{
            fontSize: '14px',
            color: '#4CAF50',
            marginTop: '4px',
            fontWeight: '600'
          }}>
            ✓ {delivery.status}
          </div>
        )}
      </div>

      {showEditModal && (
        <TruckloadEditModal 
          delivery={delivery}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}