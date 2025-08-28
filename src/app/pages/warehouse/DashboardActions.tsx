"use client";

import { useState } from "react";

type DashboardActionsProps = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export function DashboardActions({ user }: DashboardActionsProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleStartNewDelivery = () => {
    window.location.href = '/warehouse/delivery/new';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <button 
        style={{
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          height: '60px'
        }}
        onClick={handleStartNewDelivery}
      >
        📦 Start New Truckload
      </button>
      
      {/* Secondary actions */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button 
          style={{
            flex: 1,
            background: '#f8f9fa',
            color: '#666',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Find freight')}
        >
          🔍 Find
        </button>
        <div style={{ flex: 1, position: 'relative' }}>
          <button 
            style={{
              width: '100%',
              background: '#f8f9fa',
              color: '#666', 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            👤 {user.fullName.split(' ')[0]}
          </button>
          
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              bottom: '60px',
              right: '0',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: '150px',
              zIndex: 1000
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '14px',
                color: '#333'
              }}>
                {user.fullName}
              </div>
              <button 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '14px',
                  color: '#666',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowUserMenu(false);
                  window.location.href = '/logout';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}