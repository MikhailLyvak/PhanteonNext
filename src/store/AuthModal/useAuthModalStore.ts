import { create } from "zustand";

interface AuthModalState {
	isOpen: boolean;
	activeTab: "login" | "register"; // ✅ Store which tab is active
	toggleModal: () => void;
	setActiveTab: (tab: "login" | "register") => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
	isOpen: false,
	activeTab: "login", // ✅ Default to login tab
	toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),
	setActiveTab: (tab) => set({ activeTab: tab }), // ✅ Function to switch tabs
}));
