import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { isAuthenticated, orgId, userId, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return (
    <>
      <section className="dashboard-copy">
        <span className="eyebrow">Protected route</span>
        <h1>Signed-in workflow control center.</h1>
        <p>
          This dashboard route is protected with Clerk’s server-side `auth()` helper in
          the App Router. Once signed in, the user can see their Clerk identity and
          active organization context directly in the UI.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="metric">
          <span>Authenticated user</span>
          <strong>{userId}</strong>
        </article>
        <article className="metric">
          <span>Active organization</span>
          <strong>{orgId ?? "No org selected"}</strong>
        </article>
        <article className="metric">
          <span>Frontend auth mode</span>
          <strong>Clerk + App Router</strong>
        </article>
      </section>
    </>
  );
}
