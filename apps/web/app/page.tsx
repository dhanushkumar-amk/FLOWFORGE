import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <div className="frame">
        <header className="topbar">
          <Link className="brand" href="/">
            <span className="brand-mark">F</span>
            <span>FlowForge</span>
          </Link>
          <nav className="topnav">
            <Link href="/sign-in">Sign in</Link>
            <Link href="/sign-up">Sign up</Link>
            <Link className="primary-link" href="/dashboard">
              Open dashboard
            </Link>
          </nav>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">Phase 6 frontend auth</span>
            <h1>Clerk-secured workflow rooms for modern teams.</h1>
            <p>
              The FlowForge frontend now runs on Next.js App Router with Clerk session
              handling, dedicated sign-in and sign-up screens, and a protected dashboard
              shell that can show the active user and organization context.
            </p>
            <div className="hero-actions">
              <Link className="primary-link" href="/sign-up">
                Create account
              </Link>
              <Link className="ghost-link" href="/sign-in">
                I already have an account
              </Link>
            </div>
          </div>

          <div className="feature-grid">
            <article className="card">
              <strong>App Router protection</strong>
              <p>Dashboard routes gate access with Clerk auth on the server.</p>
            </article>
            <article className="card">
              <strong>Clerk UI screens</strong>
              <p>Prebuilt sign-in and sign-up routes are mounted in Next.js.</p>
            </article>
            <article className="card">
              <strong>Org-aware navbar</strong>
              <p>Organization switching and user controls are available in the dashboard.</p>
            </article>
            <article className="card">
              <strong>Backend ready</strong>
              <p>The frontend can pair with the Clerk-enabled Express API from Phase 5.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
