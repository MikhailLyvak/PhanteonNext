"use client";

/**
 * Persisted Algonix session slice.
 *
 * Stores ONLY the Algonix token. Email is sourced from `useUserStore` (the
 * platform's existing auth store) so we never hold two copies that can drift.
 *
 * Persisted to localStorage like the project's existing convention
 * (`useUserStore`).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AlgonixSessionState {
  token: string | null;
  setToken: (t: string | null) => void;
  clearSession: () => void;
}

export const useAlgonixSessionStore = create<AlgonixSessionState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
      clearSession: () => set({ token: null }),
    }),
    { name: "algonix-session-store" }
  )
);
