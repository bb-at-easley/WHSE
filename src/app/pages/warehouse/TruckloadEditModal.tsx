"use client";

import { useState } from "react";

type TruckloadEditModalProps = {
  delivery: {
    id: string;
    truckNumber?: string | null;
    trailerNumber?: string | null;
    sealNumber?: string | null;
    bolNumber?: string | null;
    easleyProNumber?: string | null;
    notes?: string | null;
    status: string;
  };
  onClose: () => void;
  onSave: (data: any) => void;
};

export function TruckloadEditModal({ delivery, onClose, onSave }: TruckloadEditModalProps) {
  const [formData, setFormData] = useState({
    easleyProNumber: delivery.easleyProNumber || "",
    truckNumber: delivery.truckNumber || "",
    trailerNumber: delivery.trailerNumber || "",
    sealNumber: delivery.sealNumber || "",
    bolNumber: delivery.bolNumber || "",
    notes: delivery.notes || "",
    status: delivery.status
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      alert(`Error updating truckload: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleMarkComplete = async () => {
    setIsLoading(true);
    try {
      await onSave({ ...formData, status: "COMPLETED" });
      onClose();
    } catch (error) {
      alert(`Error marking complete: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid #eee',
          position: 'relative'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
            textAlign: 'center'
          }}>
            Edit Truckload
          </h2>
          <button 
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#666',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Order Number (Easley Pro #)
            </label>
            <input 
              type="text"
              value={formData.easleyProNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, easleyProNumber: e.target.value }))}
              placeholder="Enter order number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Truck Number
            </label>
            <input 
              type="text"
              value={formData.truckNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, truckNumber: e.target.value }))}
              placeholder="Enter truck number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Trailer Number
            </label>
            <input 
              type="text"
              value={formData.trailerNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, trailerNumber: e.target.value }))}
              placeholder="Enter trailer number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Seal Number
            </label>
            <input 
              type="text"
              value={formData.sealNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, sealNumber: e.target.value }))}
              placeholder="Enter seal number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              BOL Number
            </label>
            <input 
              type="text"
              value={formData.bolNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, bolNumber: e.target.value }))}
              placeholder="Enter BOL number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Notes
            </label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="General notes about this truckload"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px 20px 20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                flex: 1,
                height: '48px',
                background: isLoading ? '#90CAF9' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            
            {delivery.status === 'ACTIVE' && (
              <button 
                onClick={handleMarkComplete}
                disabled={isLoading}
                style={{
                  height: '48px',
                  padding: '0 16px',
                  background: isLoading ? '#C8E6C9' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ✓ Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}