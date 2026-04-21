import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in to FlowForge.</h1>
          <p>
            Access your workflows, switch organizations, and return straight to the
            dashboard after authentication.
          </p>
        </div>
        <div className="auth-form">
          <SignIn
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
            path="/sign-in"
            routing="path"
          />
        </div>
      </section>
    </main>
  );
}
