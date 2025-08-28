import { getAllDeliveries } from "./actions";
import { DashboardActions } from "./DashboardActions";
import { TruckloadCard } from "./TruckloadCard";

// TODO: Fix desktop layout - currently too narrow/mobile-only
// - Use full width on desktop (breakpoints)
// - Better spacing and proportions for larger screens
// - Maybe sidebar or multi-column layout for desktop
// - Keep mobile-first but enhance for desktop

type WarehouseDashboardProps = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export async function WarehouseDashboard({ user }: WarehouseDashboardProps) {
  const allDeliveries = await getAllDeliveries();
  const activeDeliveries = allDeliveries.filter(d => d.status === "ACTIVE");
  const completedDeliveries = allDeliveries.filter(d => d.status === "COMPLETED");

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
          Truckloads
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

      {/* All Truckloads List */}
      <div style={{ marginBottom: '100px' }}>
        {allDeliveries.length > 0 ? (
          allDeliveries.map((delivery) => (
            <TruckloadCard key={delivery.id} delivery={delivery} />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontStyle: 'italic',
            margin: '40px 0'
          }}>
            No truckloads in the last 30 days
          </div>
        )}
      </div>

      <DashboardActions user={user} />
    </div>
  );
}