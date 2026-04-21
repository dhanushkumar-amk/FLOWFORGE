import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Start building</span>
          <h1>Create your FlowForge workspace.</h1>
          <p>
            New users can sign up here and land directly inside the protected dashboard
            flow once Clerk finishes authentication.
          </p>
        </div>
        <div className="auth-form">
          <SignUp
            forceRedirectUrl="/dashboard"
            signInForceRedirectUrl="/dashboard"
            path="/sign-up"
            routing="path"
          />
        </div>
      </section>
    </main>
  );
}
