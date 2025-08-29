"use client";

import { useState } from "react";
import { PalletModal } from "./PalletModal";

type ActionButtonsProps = {
  deliveryId: string;
};

export function ActionButtons({ deliveryId }: ActionButtonsProps) {
  const [showModal, setShowModal] = useState(false);

  const handleBack = () => {
    window.location.href = '/warehouse/dashboard';
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s',
            height: '60px',
            width: '100%'
          }}
        >
          📦 ADD PALLET
        </button>
        <button
          onClick={handleBack}
          style={{
            background: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
        >
          ← Dashboard
        </button>
      </div>

      <PalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deliveryId={deliveryId}
        mode="add"
      />
    </>
  );
}