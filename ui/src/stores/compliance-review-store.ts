import { create } from "zustand";
import type { CustomRuleMode } from "@/types/compliance";

type ComplianceReviewStore = {
	file: File | null;
	activeTab: string;
	customRulesMode: CustomRuleMode;
	actionPrompt: string;
	openIndex: number | null;
	setFile: (file: File | null) => void;
	setActiveTab: (tab: string) => void;
	setCustomRulesMode: (mode: CustomRuleMode) => void;
	setActionPrompt: (value: string) => void;
	toggleRow: (index: number) => void;
};

export const useComplianceReviewStore = create<ComplianceReviewStore>(
	(set) => ({
		file: null,
		activeTab: "review",
		customRulesMode: "default",
		actionPrompt: "",
		openIndex: null,
		setFile: (file) => set({ file }),
		setActiveTab: (tab) => set({ activeTab: tab }),
		setCustomRulesMode: (mode) => set({ customRulesMode: mode }),
		setActionPrompt: (value) => set({ actionPrompt: value }),
		toggleRow: (index) =>
			set((state) => ({ openIndex: state.openIndex === index ? null : index })),
	}),
);
