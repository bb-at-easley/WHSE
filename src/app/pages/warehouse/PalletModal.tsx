"use client";

import { useState, useEffect } from "react";
import { addPallet, updatePallet } from "./actions";

type PalletData = {
  id?: string;
  licensePlate: string;
  location?: string;
  partNumber?: string;
  partDescription?: string;
  pieceCount?: number;
};

type PalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  mode: "add" | "edit";
  initialData?: PalletData;
};

export function PalletModal({ isOpen, onClose, deliveryId, mode, initialData }: PalletModalProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [location, setLocation] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [partDescription, setPartDescription] = useState("");
  const [pieceCount, setPieceCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form when editing or duplicating
  useEffect(() => {
    if (initialData) {
      // Pre-fill with initial data (for both edit and duplicate)
      setLicensePlate(initialData.licensePlate || "");
      setLocation(initialData.location || "");
      setPartNumber(initialData.partNumber || "");
      setPartDescription(initialData.partDescription || "");
      setPieceCount(initialData.pieceCount ? String(initialData.pieceCount) : "");
    } else {
      // Clear form when no initial data (new pallet)
      setLicensePlate("");
      setLocation("");
      setPartNumber("");
      setPartDescription("");
      setPieceCount("");
    }
  }, [mode, initialData, isOpen]);

  const handleScanLP = () => {
    // Generate LP for demo - TODO: integrate with barcode scanner
    const scannedLP = String(Math.floor(Math.random() * 999999) + 100000);
    setLicensePlate(scannedLP);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleScanLocation = () => {
    // Generate location for demo - TODO: integrate with location selector
    const zone = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    const aisle = String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
    const position = Math.floor(Math.random() * 8) + 1;
    const scannedLocation = `${zone}-${aisle}-${position}`;
    setLocation(scannedLocation);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      alert("Please enter a License Plate (LP)");
      return;
    }

    setIsLoading(true);
    try {
      const pieceData = {
        partNumber: partNumber.trim() || undefined,
        partDescription: partDescription.trim() || undefined,
        pieceCount: pieceCount.trim() ? parseInt(pieceCount) : undefined
      };
      
      let result;
      if (mode === "add") {
        result = await addPallet(deliveryId, licensePlate, location || undefined, pieceData);
      } else {
        result = await updatePallet(initialData!.id!, {
          licensePlate,
          location: location || undefined,
          partNumber: pieceData.partNumber,
          partDescription: pieceData.partDescription,
          pieceCount: pieceData.pieceCount
        });
      }

      // Check if server returned an error response
      if (result instanceof Response && !result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      onClose();
      window.location.reload();
    } catch (error) {
      alert(`Error ${mode === "add" ? "adding" : "updating"} pallet: ${error.message}`);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const title = mode === "add" ? "Add Pallet" : "Edit Pallet";
  const submitText = mode === "add" ? "📦 ADD PALLET" : "✓ UPDATE PALLET";
  const loadingText = mode === "add" ? "ADDING..." : "UPDATING...";

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
          maxWidth: '320px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          transform: 'scale(1)',
          transition: 'transform 0.2s ease'
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
            {title}
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
              borderRadius: '50%',
              transition: 'all 0.2s'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* License Plate field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              License Plate (LP)
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input 
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="123456"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: 'white'
                }}
              />
              <button 
                onClick={handleScanLP}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  minWidth: '48px',
                  fontWeight: 'bold'
                }}
              >
                📷
              </button>
            </div>
          </div>

          {/* Part Number field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Part Number (Optional)
            </label>
            <input 
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="2912-20"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                background: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Part Description field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Part Description (Optional)
            </label>
            <input 
              type="text"
              value={partDescription}
              onChange={(e) => setPartDescription(e.target.value)}
              placeholder="Mitre saws"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                background: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Piece Count field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Piece Count (Optional)
            </label>
            <input 
              type="number"
              value={pieceCount}
              onChange={(e) => setPieceCount(e.target.value)}
              placeholder="12"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                background: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Storage Location field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333'
            }}>
              Storage Location (Optional)
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: 'white'
                }}
              />
              <button 
                onClick={handleScanLocation}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  background: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  minWidth: '48px',
                  fontWeight: 'bold'
                }}
              >
                📍
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px 20px 20px' }}>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              height: '56px',
              background: isLoading ? '#90CAF9' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {isLoading ? loadingText : submitText}
          </button>
        </div>
        
        {/* Backdrop hint */}
        <div style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          padding: '10px 20px',
          borderTop: '1px solid #eee'
        }}>
          Tap outside to close
        </div>
      </div>
    </div>
  );
}