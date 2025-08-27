import { route } from "rwsdk/router";
import { Login } from "./Login";
import { sessions } from "@/session/store";
import { db } from "@/db";

// Organization-aware user routes (nested under /org/:orgSlug/user)
export const userRoutes = [
  route("/login", function ({ ctx }) {
    const LoginWithProps = () => Login({ organization: ctx.organization });
    return LoginWithProps();
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
