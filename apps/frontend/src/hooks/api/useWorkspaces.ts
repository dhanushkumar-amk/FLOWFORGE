'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  ownerId: string;
  members: Array<{ userId: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Fetch all workspaces for the current user ───────────────────────────────

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Workspace[] }>(
        '/api/workspaces',
      );
      return res.data.data;
    },
  });
}

// ─── Fetch a single workspace ─────────────────────────────────────────────────

export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Workspace }>(
        `/api/workspaces/${id}`,
      );
      return res.data.data;
    },
    enabled: !!id,
  });
}

// ─── Create workspace ─────────────────────────────────────────────────────────

interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  const setActiveWorkspace = useAuthStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: async (data: CreateWorkspaceInput) => {
      const res = await apiClient.post<{ success: boolean; data: Workspace }>(
        '/api/workspaces',
        data,
      );
      return res.data.data;
    },
    onSuccess: (workspace) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspace(workspace);
      toast.success(`Workspace "${workspace.name}" created!`);
    },
  });
}
