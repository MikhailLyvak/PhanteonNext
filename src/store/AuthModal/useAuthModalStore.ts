import { create } from "zustand";

interface AuthModalState {
	isOpen: boolean;
	activeTab: "login" | "register"; // ✅ Store which tab is active
	referral_id: string | null;
	toggleModal: () => void;
	closeModal: () => void;
	setActiveTab: (tab: "login" | "register") => void;
	setReferralId: (id: string | null) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
	isOpen: false,
	referral_id: null,
	activeTab: "login", // ✅ Default to login tab
	toggleModal: () => set((state) => ({isOpen: !state.isOpen})),
	closeModal: () => set({isOpen: false}),
	setActiveTab: (tab) => set({activeTab: tab}), // ✅ Function to switch tabs
	setReferralId: (id) => set({referral_id: id}),
}));
