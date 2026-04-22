'use client';

import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Build a breadcrumb from the pathname segments
function buildBreadcrumb(pathname: string): string[] {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((seg) =>
      seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    );
}

export function TopBar() {
  const pathname = usePathname();
  const crumbs = buildBreadcrumb(pathname);

  return (
    <header className="flex items-center gap-4 px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <span
              className={
                i === crumbs.length - 1
                  ? 'text-foreground font-medium truncate'
                  : 'text-muted-foreground'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search…"
          className="pl-8 h-8 w-52 text-sm bg-muted/50"
        />
      </div>

      {/* Notification bell */}
      <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
        <Bell className="w-4 h-4" />
      </Button>

      {/* Clerk user button */}
      <UserButton />
    </header>
  );
}
