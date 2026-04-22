import { create } from 'zustand';

type ModalType =
  | 'createWorkspace'
  | 'createWorkflow'
  | 'inviteMember'
  | 'deleteWorkflow'
  | null;

interface UIState {
  sidebarOpen: boolean;
  activeModal: ModalType;
  loading: boolean;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  loading: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setLoading: (loading) => set({ loading }),
}));
