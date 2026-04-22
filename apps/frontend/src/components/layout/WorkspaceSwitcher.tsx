'use client';

import { Check, ChevronDown, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaces } from '@/hooks/api/useWorkspaces';
import { useUIStore } from '@/stores/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function WorkspaceSwitcher() {
  const { data: workspaces = [] } = useWorkspaces();
  const { activeWorkspace, setActiveWorkspace } = useAuthStore();
  const openModal = useUIStore((s) => s.openModal);

  const current = activeWorkspace ?? workspaces[0] ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-accent transition-colors text-left">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
            {current?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {current?.name ?? 'Select workspace'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {current?.plan ?? '—'} plan
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start" side="right">
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws._id}
            onClick={() => setActiveWorkspace(ws)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/20 text-primary text-xs font-bold">
              {ws.name[0].toUpperCase()}
            </div>
            <span className="flex-1 text-sm">{ws.name}</span>
            {ws._id === current?._id && (
              <Check className="w-3.5 h-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-muted-foreground cursor-pointer"
          onClick={() => openModal('createWorkspace')}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-sm">New workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
