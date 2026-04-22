import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Workspace {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
}

interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro';
}

interface AuthState {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  // Actions
  setUser: (user: User | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspaces: [],
      activeWorkspace: null,
      setUser: (user) => set({ user }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
      reset: () => set({ user: null, workspaces: [], activeWorkspace: null }),
    }),
    {
      name: 'flowforge-auth',
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace,
      }),
    },
  ),
);
