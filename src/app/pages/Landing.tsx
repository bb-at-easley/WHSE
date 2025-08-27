export function Landing() {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      padding: '20px',
      background: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 8px 0'
        }}>
          WHSE
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 32px 0'
        }}>
          Warehouse Operations
        </p>
        
        <div style={{
          fontSize: '18px',
          color: '#333',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          Are you new to WHSE?
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <a 
            href="/signup"
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Yes, I'm new here
          </a>
          
          <a 
            href="/login"
            style={{
              background: '#f8f9fa',
              color: '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            No, I have an account
          </a>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <span style={{
            color: '#666',
            fontSize: '14px'
          }}>
            Need help? Contact your supervisor
          </span>
        </div>
      </div>
    </div>
  );
}