"use client";

// TODO: Fix desktop layout - currently too narrow/mobile-only
// - Use full width on desktop (breakpoints)
// - Better spacing and proportions for larger screens
// - Maybe sidebar or multi-column layout for desktop
// - Keep mobile-first but enhance for desktop

import { useState } from "react";

export function WarehouseDashboard({ user }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Mock data for now - will come from database later
  const activeDeliveries = [
    {
      id: "12345",
      startTime: "2:30 PM",
      scanned: 12,
      stored: 3,
      isActive: true
    },
    {
      id: "12346", 
      startTime: "1:15 PM",
      scanned: 8,
      stored: 8,
      isActive: false
    },
    {
      id: "12347",
      startTime: "12:45 PM", 
      scanned: 25,
      stored: 18,
      isActive: false
    }
  ];

  // Mock sync status - will be real connectivity check later
  const syncStatus = {
    isOnline: true,
    lastSync: "2 min ago",
    pendingCount: 0
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header with sync status */}
      <div style={{
        textAlign: 'center',
        padding: '30px 20px',
        background: 'white',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px',
          margin: 0
        }}>
          Active Deliveries
        </h1>
        <div style={{
          fontSize: '14px',
          color: syncStatus.isOnline ? '#4CAF50' : '#FF9800',
          fontWeight: '500'
        }}>
          {syncStatus.isOnline ? 
            `✓ Synced ${syncStatus.lastSync}` : 
            `⚠️ Offline - ${syncStatus.pendingCount} pending`
          }
        </div>
      </div>

      {/* Active Deliveries List */}
      <div style={{ marginBottom: '100px' }}>
        {activeDeliveries.length > 0 ? (
          activeDeliveries.map((delivery) => (
            <div 
              key={delivery.id}
              style={{
                background: delivery.isActive ? '#e8f5e8' : '#f8f9fa',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: delivery.isActive ? '4px solid #4CAF50' : 'none'
              }}
              onClick={() => {
                // TODO: Navigate to delivery detail screen
                alert(`Navigate to delivery ${delivery.id}`);
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
                  color: '#333'
                }}>
                  Delivery #{delivery.id}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Started {delivery.startTime}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                fontSize: '14px'
              }}>
                <div style={{ color: '#666' }}>
                  <strong style={{ color: '#333' }}>{delivery.scanned}</strong> scanned
                </div>
                <div style={{ color: '#666' }}>
                  <strong style={{ color: '#333' }}>{delivery.stored}</strong> stored
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontStyle: 'italic',
            margin: '40px 0'
          }}>
            No active deliveries
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions - Thumb Zone */}
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
          onClick={() => {
            // TODO: Navigate to new delivery flow
            alert('Start new delivery flow');
          }}
        >
          📦 Start New Delivery
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
    </div>
  );
}