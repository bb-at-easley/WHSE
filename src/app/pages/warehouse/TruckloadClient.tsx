"use client";

import { useState } from "react";
import { DeliveryHeader } from "./DeliveryHeader";
import { SyncIndicator } from "./SyncIndicator";
import { PalletList } from "./PalletList";
import { ActionButtons } from "./ActionButtons";

type TruckloadClientProps = {
  delivery: {
    id: string;
    truckNumber?: string | null;
    trailerNumber?: string | null;
    sealNumber?: string | null;
    easleyProNumber?: string | null;
    notes?: string | null;
    status: string;
    pallets: Array<{
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
    }>;
  };
};

export function TruckloadClient({ delivery }: TruckloadClientProps) {
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [editingPallet, setEditingPallet] = useState(null);

  const handlePalletClick = (pallet) => {
    setEditingPallet(pallet);
    setShowPalletModal(true);
  };

  const handleAddPallet = () => {
    setEditingPallet(null);
    setShowPalletModal(true);
  };

  const handleModalClose = () => {
    setShowPalletModal(false);
    setEditingPallet(null);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative'
    }}>
      <SyncIndicator />
      
      <h3 style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
        fontSize: '14px'
      }}>
        {delivery.pallets.length > 0 ? 'Truckload in Progress' : 'New Truckload'}
      </h3>
      
      <DeliveryHeader delivery={delivery} />
      <PalletList pallets={delivery.pallets} onPalletClick={handlePalletClick} />
      <ActionButtons 
        deliveryId={delivery.id} 
        showModal={showPalletModal}
        editingPallet={editingPallet}
        onShowModal={handleAddPallet}
        onCloseModal={handleModalClose}
      />
    </div>
  );
}