import { route, render } from "rwsdk/router";
import { Login } from "./Login";
import { sessions } from "@/session/store";
import { db } from "@/db";

// Organization-aware user routes (nested under /org/:orgSlug/user)
export const userRoutes = [
  route("/login", async function ({ ctx, params }) {
    // Load organization context 
    const { loadOrganizationContext } = await import("@/worker");
    const orgResult = await loadOrganizationContext(params.orgSlug, ctx);
    if (orgResult) return orgResult; // Return error if org loading failed
    
    return render(Login, { organization: ctx.organization });
  }), // Now /org/:orgSlug/user/login
  
  route("/logout", async function ({ request }) {
    const headers = new Headers();
    await sessions.remove(request, headers);
    headers.set("Location", "/org/easley"); // Redirect to default org

    return new Response(null, {
      status: 302,
      headers,
    });
  }),
];
