import { route } from "rwsdk/router";
// PLACEHOLDER imports - these will be actual npm packages when addons are published
import { BarcodeScanner } from "../../../addons/barcode-scanner/index";
import { OfflineSync } from "../../../addons/offline-sync/index";
// TODO: Replace with actual DesignPrototype addon when ready
function serveHtml(template: string, data: any = {}) {
  let html = template;
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}

export const warehouseRoutes = [
  // Serve delivery screen 
  route("/delivery/:id", async function ({ params }) {
    const deliveryScreenHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            background: #2c2826;
            height: 100vh;
            overflow: hidden;
        }
        .app-container {
            max-width: 400px;
            margin: 0 auto;
            height: 100vh;
            background: #f7f6f4;
            display: flex;
            flex-direction: column;
            border-left: 3px solid #1c1917;
            border-right: 3px solid #1c1917;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
        .sync-indicator {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #047857;
            border: 2px solid #1c1917;
            z-index: 10;
        }
        .header {
            background: #1c1917;
            color: #fefefe;
            padding: 24px;
            border-bottom: 4px solid #b45309;
            position: relative;
        }
        .delivery-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .delivery-status {
            font-size: 18px;
            color: #b45309;
            font-weight: 600;
            margin: 0;
        }
        .main-content {
            flex: 1;
            background: #fefefe;
            margin: 16px;
            border-radius: 8px;
            border: 2px solid #e8e6e2;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .scan-zone {
            width: 200px;
            height: 200px;
            border: 3px dashed #b45309;
            border-radius: 16px;
            background: #fef3c7;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            position: relative;
        }
        .scan-icon {
            font-size: 48px;
            color: #b45309;
        }
        .scan-instruction {
            text-align: center;
            color: #374151;
            font-weight: 500;
            margin-bottom: 24px;
        }
        .bottom-actions {
            padding: 20px;
            background: #f9f8f6;
            border-top: 2px solid #e8e6e2;
        }
        .scan-button {
            width: 100%;
            background: #b45309;
            color: white;
            border: 3px solid #92400e;
            border-radius: 12px;
            padding: 18px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transition: all 0.2s;
        }
        .scan-button:hover {
            background: #92400e;
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
        .scan-button:active {
            transform: translateY(0);
        }
        .back-button {
            width: 100%;
            background: #6b7280;
            color: white;
            border: 2px solid #4b5563;
            border-radius: 8px;
            padding: 16px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .back-button:hover {
            background: #4b5563;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="sync-indicator"></div>
        <header class="header">
            <h1 class="delivery-title">{{deliveryId}}</h1>
            <div class="delivery-status">{{status}}</div>
        </header>
        
        <div class="main-content">
            <div class="scan-zone">
                <div class="scan-icon">📦</div>
            </div>
            <div class="scan-instruction">
                Position barcode within scan area
            </div>
        </div>
        
        <div class="bottom-actions">
            <button class="scan-button">📷 Scan Pallet</button>
            <button class="back-button" onclick="window.location.href='/warehouse/dashboard'">← Dashboard</button>
        </div>
    </div>
</body>
</html>`;
    
    return serveHtml(deliveryScreenHtml, {
      deliveryId: `Delivery #${params.id}`,
      status: "12 scanned, 3 stored",
      title: "Warehouse Delivery Screen"
    });
  }),

  // Simple dashboard route (keeping existing HTML for now)
  route("/dashboard", function () {
    return new Response(`
      <html>
        <head>
          <title>Warehouse Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background: #fefefe;
              color: #2c2826;
              padding: 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .header {
              background: #f7f6f4;
              padding: 24px;
              border-radius: 12px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1c1917;
              margin-bottom: 8px;
            }
            .subtitle {
              color: #b45309;
              font-weight: 500;
            }
            .delivery-list {
              list-style: none;
              margin-bottom: 24px;
              flex: 1;
              padding: 0;
            }
            .delivery-item {
              background: #f9f8f6;
              border-radius: 12px;
              margin-bottom: 12px;
              padding: 20px;
              transition: all 0.3s ease;
            }
            .delivery-item:hover {
              background: #f5f4f1;
              transform: translateY(-2px);
            }
            .delivery-link {
              text-decoration: none;
              color: inherit;
              display: block;
            }
            .delivery-title {
              font-size: 18px;
              font-weight: 600;
              color: #1c1917;
              margin-bottom: 6px;
            }
            .delivery-status {
              font-size: 14px;
              color: #b45309;
              font-weight: 500;
            }
            .add-delivery-btn {
              background: #b45309;
              color: white;
              border: none;
              border-radius: 12px;
              padding: 16px 24px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              display: inline-block;
              margin-bottom: 24px;
            }
            .back-link {
              background: transparent;
              color: #6b7280;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 12px 20px;
              text-decoration: none;
              font-size: 14px;
              text-align: center;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">Warehouse Dashboard</h1>
              <p class="subtitle">Active delivery management</p>
            </div>
            
            <ul class="delivery-list">
              <li class="delivery-item">
                <a href="/warehouse/delivery/12345" class="delivery-link">
                  <div class="delivery-title">Delivery #12345</div>
                  <div class="delivery-status">12 scanned, 3 stored</div>
                </a>
              </li>
              <li class="delivery-item">
                <a href="/warehouse/delivery/12346" class="delivery-link">
                  <div class="delivery-title">Delivery #12346</div>
                  <div class="delivery-status">8 scanned, 8 stored</div>
                </a>
              </li>
            </ul>
            
            <div style="margin-top: auto; padding-top: 32px;">
              <a href="#" class="add-delivery-btn">+ Start New Delivery</a>
              <a href="/" class="back-link">← Back to Home</a>
            </div>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  }),
  
  // Future React components (commented out for now)
  /*
  route("/dashboard", async function ({ ctx }) {
    // Check authentication
    if (!ctx.user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/user/login" },
      });
    }
    
    // Load active deliveries
    const deliveries = await db.delivery.findMany({
      where: { status: 'active' },
      include: { pallets: true }
    });
    
    return <WarehouseDashboard deliveries={deliveries} user={ctx.user} />;
  }),
  
  route("/delivery/:id", [
    // Require authentication
    async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/user/login" },
        });
      }
    },
    
    async function ({ params, ctx }) {
      const delivery = await db.delivery.findUnique({
        where: { id: params.id },
        include: { 
          pallets: {
            orderBy: { scannedAt: 'desc' }
          }
        }
      });
      
      if (!delivery) {
        return new Response("Delivery not found", { status: 404 });
      }
      
      return <DeliveryScreen delivery={delivery} user={ctx.user} />;
    }
  ]),
  
  route("/find", [
    async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/user/login" },
        });
      }
    },
    
    function ({ ctx }) {
      return <FindFreight user={ctx.user} />;
    }
  ]),
  
  route("/location/scan", [
    async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/user/login" },
        });
      }
    },
    
    function ({ ctx }) {
      return <LocationScan user={ctx.user} />;
    }
  ])
  */
];

/*
COLOCATION NOTES:
This warehouse feature should include all related files in this directory:

warehouse/
├── routes.ts                 (this file)
├── DeliveryScreen.html       (temporary prototype)
├── DeliveryScreen.tsx        (React component - to be created)
├── WarehouseDashboard.tsx    (React component - to be created)  
├── FindFreight.tsx           (React component - to be created)
├── LocationScan.tsx          (React component - to be created)
├── components/               (shared warehouse components)
│   ├── ScanButton.tsx
│   ├── ActivityFeed.tsx
│   ├── SyncIndicator.tsx
│   └── WarehouseMap.tsx
├── functions.ts              (server functions)
├── types.ts                  (TypeScript interfaces)
├── hooks/                    (custom React hooks)
│   ├── useBarcodeScan.ts
│   ├── useOfflineSync.ts
│   └── useDeliveryState.ts
└── utils.ts                  (utility functions)

ADDON vs APP DECISION:
- Core warehouse logic (models, database schema) → APP
- Barcode scanning library/wrapper → Could be ADDON
- Offline sync utilities → Could be ADDON  
- UI components specific to warehouse → APP
- Generic mobile UI patterns → Could be ADDON
*/