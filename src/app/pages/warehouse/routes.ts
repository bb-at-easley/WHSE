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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .phone {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        .sync-indicator {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #FF9800;
        }
        .header {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            text-align: center;
        }
        .delivery-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .edit-delivery-button {
            background: none;
            border: none;
            color: #2196F3;
            font-size: 14px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            transition: all 0.2s;
            font-weight: 600;
        }
        .edit-delivery-button:hover {
            background: #e3f2fd;
            color: #1976D2;
        }
        .delivery-status {
            font-size: 16px;
            color: #2196F3;
        }
        .recent-scans {
            flex: 1;
            overflow-y: auto;
            margin: 16px 0 100px 0;
        }
        .scan-item {
            padding: 12px 16px;
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 8px;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .scan-item:nth-child(1) {
            background: #e8f5e8;
        }
        .pallet-id {
            font-weight: 600;
            color: #333;
        }
        .status-stored {
            color: #4CAF50;
            font-weight: 600;
        }
        .status-staged {
            color: #FF9800;
            font-weight: 600;
        }
        .bottom-actions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .scan-button {
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
            height: 60px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .scan-button:hover {
            background: #1976D2;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        .scan-button:active {
            background: #1565C0;
            transform: translateY(0);
        }
        .back-button {
            background: #666;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            margin: 0;
        }
        .back-button:hover {
            background: #555;
        }
    </style>
</head>
<body>
    <div class="phone">
        <div class="sync-indicator"></div>
        <div style="text-align: center; margin-bottom: 20px; color: #333; font-size: 14px;">Inbound Check In</div>
        
        <div class="header">
            <div class="delivery-title">
                <span>{{deliveryId}}</span>
                <button class="edit-delivery-button" onclick="editDelivery()">Edit</button>
            </div>
            <div class="delivery-status">
                <strong>{{status}}</strong>
            </div>
        </div>
        
        <div class="recent-scans">
            <div class="scan-item">
                <span class="pallet-id">PAL-001234</span>
                <span class="status-stored">✓ Stored</span>
            </div>
            <div class="scan-item">
                <span class="pallet-id">PAL-001233</span>
                <span class="status-staged">Staged</span>
            </div>
            <div class="scan-item">
                <span class="pallet-id">PAL-001232</span>
                <span class="status-stored">✓ Stored</span>
            </div>
        </div>
        
        <div class="bottom-actions">
            <button class="scan-button">📦 ADD PALLET</button>
            <button class="back-button" onclick="window.location.href='/org/easley/warehouse/dashboard'">← Dashboard</button>
        </div>
    </div>
    
    <script>
        function editDelivery() {
            alert('Edit delivery details - would open modal or navigate to edit form');
        }
        
        document.querySelector('.scan-button').addEventListener('click', () => {
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
    </script>
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
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              padding: 20px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              min-height: 80vh;
              display: flex;
              flex-direction: column;
            }
            .sync-indicator {
              position: absolute;
              top: 15px;
              right: 15px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #FF9800;
            }
            .header {
              background: #f8f9fa;
              padding: 16px;
              border-radius: 12px;
              margin-bottom: 20px;
              position: relative;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              margin: 0 0 8px 0;
            }
            .subtitle {
              color: #2196F3;
              font-size: 16px;
              margin: 0;
            }
            .delivery-list {
              list-style: none;
              margin: 0;
              padding: 0;
              flex: 1;
            }
            .delivery-item {
              padding: 12px 16px;
              background: #f8f9fa;
              border-radius: 8px;
              margin-bottom: 8px;
              transition: all 0.2s;
            }
            .delivery-item:hover {
              background: #e3f2fd;
            }
            .delivery-link {
              text-decoration: none;
              color: inherit;
              display: block;
            }
            .delivery-title {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }
            .delivery-status {
              font-size: 14px;
              color: #2196F3;
              font-weight: 600;
            }
            .bottom-actions {
              margin-top: 20px;
              display: flex;
              flex-direction: column;
              gap: 10px;
            }
            .add-delivery-btn {
              background: #2196F3;
              color: white;
              border: none;
              border-radius: 16px;
              padding: 18px;
              font-size: 18px;
              font-weight: bold;
              text-decoration: none;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.2s;
              cursor: pointer;
            }
            .add-delivery-btn:hover {
              background: #1976D2;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            .back-link {
              background: #666;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px;
              text-decoration: none;
              text-align: center;
              font-size: 14px;
            }
            .back-link:hover {
              background: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="sync-indicator"></div>
            <div class="header">
              <h1 class="title">Warehouse Dashboard</h1>
              <div class="subtitle">Active delivery management</div>
            </div>
            
            <ul class="delivery-list">
              <li class="delivery-item">
                <a href="/org/easley/warehouse/delivery/12345" class="delivery-link">
                  <div class="delivery-title">Delivery #12345</div>
                  <div class="delivery-status">12 scanned, 3 stored</div>
                </a>
              </li>
              <li class="delivery-item">
                <a href="/org/easley/warehouse/delivery/12346" class="delivery-link">
                  <div class="delivery-title">Delivery #12346</div>
                  <div class="delivery-status">8 scanned, 8 stored</div>
                </a>
              </li>
              <li class="delivery-item">
                <a href="/org/easley/warehouse/delivery/12347" class="delivery-link">
                  <div class="delivery-title">Delivery #12347</div>
                  <div class="delivery-status">5 scanned, 2 stored</div>
                </a>
              </li>
            </ul>
            
            <div class="bottom-actions">
              <a href="#" class="add-delivery-btn">📦 START NEW DELIVERY</a>
              <a href="/org/easley" class="back-link">← Back to Home</a>
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