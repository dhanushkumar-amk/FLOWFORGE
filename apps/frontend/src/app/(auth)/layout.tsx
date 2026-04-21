export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-foreground px-6 py-12 text-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_30rem),radial-gradient(circle_at_bottom_right,var(--accent),transparent_28rem)] opacity-35" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-background/60">FlowForge</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Secure workflow access</h1>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </main>
  );
}
