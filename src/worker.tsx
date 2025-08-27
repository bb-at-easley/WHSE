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
  organization: Organization | null;
  membership: Membership | null;
};

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
        headers.set("Location", "/org/easley/login");

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
    // Root redirect to default org
    route("/", () => new Response(null, {
      status: 302,
      headers: { Location: "/org/easley" }
    })),
    
    // Organization-specific routes
    prefix("/org/:orgSlug", [
      // Middleware to load organization context for all org routes
      async ({ params, ctx }) => {
        const org = await db.organization.findUnique({
          where: { slug: params.orgSlug }
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
      },
      
      // User routes (login/logout)
      prefix("/user", userRoutes),
      
      // Warehouse routes (require membership)
      prefix("/warehouse", [
        // Require membership for warehouse access
        ({ ctx }) => {
          if (!ctx.user || !ctx.membership) {
            return new Response(null, {
              status: 302,
              headers: { Location: `/org/${ctx.organization?.slug}/user/login` }
            });
          }
        },
        ...warehouseRoutes
      ]),
      
      // Default org route - redirect to warehouse dashboard
      route("/", ({ ctx }) => {
        if (!ctx.user || !ctx.membership) {
          return new Response(null, {
            status: 302,
            headers: { Location: `/org/${ctx.organization?.slug}/user/login` }
          });
        }
        
        return new Response(null, {
          status: 302,
          headers: { Location: `/org/${ctx.organization?.slug}/warehouse/dashboard` }
        });
      })
    ]),
  ]),
]);
