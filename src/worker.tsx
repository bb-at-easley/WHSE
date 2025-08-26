import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { warehouseRoutes } from "@/app/pages/warehouse/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    await setupDb(env);
    setupSessionStore(env);

    try {
      ctx.session = await sessions.load(request);
    } catch (error) {
      if (error instanceof ErrorResponse && error.code === 401) {
        await sessions.remove(request, headers);
        headers.set("Location", "/user/login");

        return new Response(null, {
          status: 302,
          headers,
        });
      }

      throw error;
    }

    if (ctx.session?.userId) {
      ctx.user = await db.user.findUnique({
        where: {
          id: ctx.session.userId,
        },
      });
    }
  },
  render(Document, [
    route("/", () => new Response(`
      <html>
        <head>
          <title>Warehouse Management System</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              background: #2c2826;
              color: #fefefe;
              line-height: 1.6;
              padding: 0;
              margin: 0;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              min-height: 100vh;
              background: #f7f6f4;
              border-left: 4px solid #1c1917;
              border-right: 4px solid #1c1917;
              box-shadow: 0 0 30px rgba(0,0,0,0.3);
            }
            
            .hero {
              background: #1c1917;
              color: #fefefe;
              padding: 48px 32px;
              border-bottom: 6px solid #b45309;
              text-align: center;
              position: relative;
            }
            
            .hero::after {
              content: '';
              position: absolute;
              bottom: -6px;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, #92400e 0%, #b45309 50%, #92400e 100%);
            }
            
            .hero h1 {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .hero p {
              color: #b45309;
              font-size: 18px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .section {
              padding: 32px;
              margin-bottom: 0;
              background: #fefefe;
            }
            
            .section h2 {
              font-size: 24px;
              font-weight: 700;
              color: #1c1917;
              margin-bottom: 24px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 3px solid #b45309;
              padding-bottom: 8px;
            }
            
            .links-grid {
              display: grid;
              gap: 20px;
              margin-bottom: 0;
            }
            
            .link-card {
              background: #f9f8f6;
              border: 3px solid #e8e6e2;
              border-radius: 8px;
              padding: 24px;
              text-decoration: none;
              color: inherit;
              transition: all 0.3s ease;
              display: block;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .link-card:hover {
              background: #f5f4f1;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(0,0,0,0.15);
              border-color: #b45309;
            }
            
            .link-title {
              font-size: 20px;
              font-weight: 700;
              color: #1c1917;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            
            .link-description {
              font-size: 16px;
              color: #4b5563;
              font-weight: 500;
            }
            
            .demo-badge {
              display: inline-block;
              background: #b45309;
              color: white;
              font-size: 12px;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-left: 8px;
              border: 2px solid #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="hero">
              <h1>Warehouse Management System</h1>
              <p>Mobile-first inventory management built with industrial design principles</p>
            </div>
            
            <div class="section">
              <h2>Quick Access</h2>
              <div class="links-grid">
                <a href="/warehouse/dashboard" class="link-card">
                  <div class="link-title">📦 Warehouse Dashboard</div>
                  <div class="link-description">Manage active deliveries and track progress</div>
                </a>
                
                <a href="/warehouse/delivery/12345" class="link-card">
                  <div class="link-title">📱 Delivery Screen <span class="demo-badge">Live Demo</span></div>
                  <div class="link-description">Mobile-optimized pallet scanning interface</div>
                </a>
                
                <a href="/user/login" class="link-card">
                  <div class="link-title">🔐 User Authentication</div>
                  <div class="link-description">WebAuthn passkey-based security</div>
                </a>
              </div>
            </div>
            
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    })),
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          });
        }
      },
      Home,
    ]),
    prefix("/user", userRoutes),
    prefix("/warehouse", warehouseRoutes),
  ]),
]);
