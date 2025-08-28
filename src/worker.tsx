import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { Landing } from "@/app/pages/Landing";
import { Signup } from "@/app/pages/Signup";
import { LoginSimple } from "@/app/pages/LoginSimple";
import { Login } from "@/app/pages/user/Login";
import { WarehouseDashboard } from "@/app/pages/warehouse/WarehouseDashboardServer";
import { DeliveryScreen } from "@/app/pages/warehouse/DeliveryScreen";
import { createDelivery } from "@/app/pages/warehouse/actions";
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
    
    // Warehouse dashboard (protected)
    route("/warehouse/dashboard", async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/" }
        });
      }
      
      return <WarehouseDashboard user={ctx.user} />;
    }),
    
    // New truckload route - creates delivery and redirects to truckload screen
    route("/warehouse/delivery/new", async ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/" }
        });
      }
      
      const delivery = await createDelivery();
      
      return new Response(null, {
        status: 302,
        headers: { Location: `/warehouse/delivery/${delivery.id}` }
      });
    }),
    
    // Truckload detail screen
    route("/warehouse/delivery/:id", async ({ ctx, params }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/" }
        });
      }
      
      return <DeliveryScreen deliveryId={params.id} />;
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
