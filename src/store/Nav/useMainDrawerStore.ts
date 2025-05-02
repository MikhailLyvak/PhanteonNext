import { create } from "zustand";

type MainDrawerStore = {
  isMainDrawerOpen: boolean;
  toggleMainDrawer: () => void;
  closeMainDrawer: () => void;
};

export const useMainDrawerStore = create<MainDrawerStore>((set) => ({
  isMainDrawerOpen: false,
  toggleMainDrawer: () => set((state) => ({ isMainDrawerOpen: !state.isMainDrawerOpen })),
  closeMainDrawer: () => set({ isMainDrawerOpen: false }),
}));
