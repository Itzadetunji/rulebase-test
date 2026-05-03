import { create } from "zustand";

type ComplianceReviewStore = {
	file: File | null;
	activeTab: string;
	actionPrompt: string;
	openIndex: number | null;
	setFile: (file: File | null) => void;
	setActiveTab: (tab: string) => void;
	setActionPrompt: (value: string) => void;
	toggleRow: (index: number) => void;
};

export const useComplianceReviewStore = create<ComplianceReviewStore>(
	(set) => ({
		file: null,
		activeTab: "review",
		actionPrompt: "",
		openIndex: null,
		setFile: (file) => set({ file }),
		setActiveTab: (tab) => set({ activeTab: tab }),
		setActionPrompt: (value) => set({ actionPrompt: value }),
		toggleRow: (index) =>
			set((state) => ({ openIndex: state.openIndex === index ? null : index })),
	}),
);
