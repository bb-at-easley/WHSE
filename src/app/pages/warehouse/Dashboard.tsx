export function Dashboard({ organization, user, membership }) {
  return (
    <div>
      <h1>Warehouse Dashboard</h1>
      <div>
        <p><strong>Organization:</strong> {organization?.name || 'Unknown Org'}</p>
        <p><strong>User:</strong> {user?.username || 'Not logged in'}</p>
        <p><strong>Membership role:</strong> {membership?.role || 'No membership'}</p>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Actions</h2>
        <nav>
          <a href={`/org/${organization?.slug}/warehouse/delivery/test-123`} 
             style={{ 
               display: 'inline-block', 
               padding: '10px 20px', 
               backgroundColor: '#2196F3', 
               color: 'white', 
               textDecoration: 'none', 
               borderRadius: '8px',
               marginRight: '10px'
             }}>
            View Delivery Screen (Test)
          </a>
        </nav>
      </div>
    </div>
  );
}