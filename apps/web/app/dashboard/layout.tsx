import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return (
    <main className="shell">
      <div className="frame dashboard-shell">
        <header className="dashboard-navbar">
          <div>
            <div className="brand">
              <span className="brand-mark">F</span>
              <span>FlowForge Dashboard</span>
            </div>
            <nav className="dashboard-navlinks">
              <Link href="/dashboard">Overview</Link>
              <Link href="/">Marketing</Link>
            </nav>
          </div>
          <div className="clerk-controls">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              afterSelectOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
            />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
