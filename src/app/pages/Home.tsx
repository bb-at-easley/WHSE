import { RequestInfo } from "rwsdk/worker";

export function Home({ ctx }: RequestInfo) {
  return (
    <div>
      <p>
        {ctx.user?.email
          ? `You are logged in as user ${ctx.user.email}`
          : "You are not logged in"}
      </p>
    </div>
  );
}
