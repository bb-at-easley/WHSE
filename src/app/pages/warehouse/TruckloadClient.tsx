"use client";

import { useState } from "react";
import { DeliveryHeader } from "./DeliveryHeader";
import { SyncIndicator } from "./SyncIndicator";
import { PalletList } from "./PalletList";
import { ActionButtons } from "./ActionButtons";
import { PalletModal } from "./PalletModal";

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

type PalletType = TruckloadClientProps['delivery']['pallets'][0];

export function TruckloadClient({ delivery }: TruckloadClientProps) {
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [editingPallet, setEditingPallet] = useState<PalletType | null>(null);

  const handlePalletClick = (pallet: PalletType) => {
    console.log("Pallet data:", pallet);
    console.log("Pieces:", pallet.pieces);
    setEditingPallet(pallet);
    setShowPalletModal(true);
  };

  const handleAddPallet = () => {
    setEditingPallet(null);
    setShowPalletModal(true);
  };

  const handleDuplicatePallet = (pallet: PalletType) => {
    console.log("Duplicating pallet:", pallet);
    // Set the pallet as template but clear ID and LP for new pallet
    setEditingPallet({
      ...pallet,
      id: undefined, // Clear ID so it creates new pallet
      licensePlate: "" // Clear LP - user must enter new unique LP
    });
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
      <PalletList 
        pallets={delivery.pallets} 
        onPalletClick={handlePalletClick}
        onDuplicatePallet={handleDuplicatePallet}
      />
      <ActionButtons deliveryId={delivery.id} />
      
      <PalletModal
        isOpen={showPalletModal}
        onClose={handleModalClose}
        deliveryId={delivery.id}
        mode={editingPallet?.id ? "edit" : "add"}
        initialData={editingPallet ? {
          id: editingPallet.id,
          licensePlate: editingPallet.licensePlate,
          location: editingPallet.location || undefined,
          pieceCount: editingPallet.pieceCount || undefined,
          partNumber: editingPallet.pieces?.[0]?.partNumber,
          partDescription: editingPallet.pieces?.[0]?.description
        } : undefined}
      />
    </div>
  );
}