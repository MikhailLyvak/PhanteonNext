import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: any | null;
  loading: boolean;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "user-store" }
  )
);
