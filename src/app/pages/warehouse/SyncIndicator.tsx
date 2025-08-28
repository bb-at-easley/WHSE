"use client";

// Client component for real-time sync status
export function SyncIndicator() {
  // TODO: Implement real online/offline detection
  // For now, show online status
  const isOnline = true;
  
  return (
    <div style={{
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: isOnline ? '#4CAF50' : '#FF9800'
    }} />
  );
}