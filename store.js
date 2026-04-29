import { create } from 'zustand';

export const useAionStore = create((set) => ({
  activeModule: 'dashboard',
  activeView: 'overview',
  isAutonomousMode: false,
  theme: 'light',
  notifications: [],
  modal: null,
  sidebarCollapsed: false,
  
  setModule: (module) => set({ activeModule: module }),
  setView: (view) => set({ activeView: view }),
  toggleAutonomous: () => set((state) => ({ isAutonomousMode: !state.isAutonomousMode })),
  setTheme: (theme) => set({ theme }),
  addNotification: (note) => set((state) => ({ notifications: [note, ...state.notifications] })),
  setModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));