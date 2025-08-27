import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { Landing } from "@/app/pages/Landing";
import { Signup } from "@/app/pages/Signup";
import { LoginSimple } from "@/app/pages/LoginSimple";
import { Login } from "@/app/pages/user/Login";
import { setCommonHeaders } from "@/app/headers";
import { userRoutes } from "@/app/pages/user/routes";
import { warehouseRoutes } from "@/app/pages/warehouse/routes";
import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";
import { type User, type Organization, type Membership, db, setupDb } from "@/db";
import { env } from "cloudflare:workers";
export { SessionDurableObject } from "./session/durableObject";

export type AppContext = {
  session: Session | null;
  user: User | null;
  organization: Organization | null;
  membership: Membership | null;
};

// Helper function to load organization context
export async function loadOrganizationContext(orgSlug: string, ctx: AppContext): Promise<Response | void> {
  if (!orgSlug) {
    return new Response("Missing organization slug", { status: 400 });
  }
  
  const org = await db.organization.findUnique({
    where: { slug: orgSlug }
  });
  
  if (!org) {
    return new Response("Organization not found", { status: 404 });
  }
  
  ctx.organization = org;
  
  // Load membership if user is logged in
  if (ctx.user) {
    ctx.membership = await db.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: ctx.user.id,
          organizationId: org.id
        }
      }
    });
  }
}

// Import types for organization and membership
type Organization = {
  id: string;
  name: string;
  slug: string;
  settings: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Membership = {
  id: string;
  role: string;
  userId: string;
  organizationId: string;
  invitedById: string | null;
  createdAt: Date;
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
        headers.set("Location", "/");

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
    // Root landing page with choice
    route("/", Landing),
    
    // New simplified auth flow
    route("/signup", Signup),
    route("/login", LoginSimple),
    
    // Simple warehouse dashboard (protected)
    route("/warehouse/dashboard", async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/" }
        });
      }
      
      return (
        <div style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px',
          background: '#f5f5f5',
          minHeight: '100vh'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px 20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h1 style={{ color: '#333', marginBottom: '20px' }}>Warehouse Dashboard</h1>
            <p style={{ color: '#666' }}>Welcome, {ctx.user.fullName}!</p>
            <p style={{ color: '#666' }}>Email: {ctx.user.email}</p>
            
            <div style={{ marginTop: '32px' }}>
              <a 
                href="/logout"
                style={{
                  background: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      );
    }),
    
    // Logout route
    route("/logout", async ({ request }) => {
      const headers = new Headers();
      await sessions.remove(request, headers);
      headers.set("Location", "/");
      
      return new Response(null, {
        status: 302,
        headers,
      });
    }),

    // Keep old passkey login for transition
    route("/org/easley/user/login", async ({ ctx }) => {
      const { loadOrganizationContext } = await import("@/worker");
      const orgResult = await loadOrganizationContext("easley", ctx);
      if (orgResult) return orgResult;
      
      return <Login organization={ctx.organization} />;
    }),
  ]),
]);
