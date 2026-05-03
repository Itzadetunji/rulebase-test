import axios from "axios";
import { create } from "zustand";
import { apiClient, REVIEW_ACTION_URL, REVIEW_URL } from "@/lib/api";
import type { ComplianceActionPayload, ReviewPayload } from "@/types/compliance";

type ErrorBody = { error?: string };

type ComplianceReviewStore = {
	file: File | null;
	activeTab: string;
	reviewLoading: boolean;
	reviewStatusMessage: string;
	reviewPayload: ReviewPayload | null;
	actionPrompt: string;
	actionLoading: boolean;
	actionStatusMessage: string;
	actionPayload: ComplianceActionPayload | null;
	openIndex: number | null;
	setFile: (file: File | null) => void;
	setActiveTab: (tab: string) => void;
	setActionPrompt: (value: string) => void;
	toggleRow: (index: number) => void;
	runReview: () => Promise<void>;
	runComplianceAction: () => Promise<void>;
};

export const useComplianceReviewStore = create<ComplianceReviewStore>(
	(set, get) => ({
		file: null,
		activeTab: "review",
		reviewLoading: false,
		reviewStatusMessage: "",
		reviewPayload: null,
		actionPrompt: "",
		actionLoading: false,
		actionStatusMessage: "",
		actionPayload: null,
		openIndex: null,
		setFile: (file) => set({ file }),
		setActiveTab: (tab) => set({ activeTab: tab }),
		setActionPrompt: (value) => set({ actionPrompt: value }),
		toggleRow: (index) =>
			set((state) => ({ openIndex: state.openIndex === index ? null : index })),
		runReview: async () => {
			const { file } = get();
			if (!file) {
				set({ reviewStatusMessage: "Please choose a CSV file." });
				return;
			}
			set({
				reviewLoading: true,
				reviewStatusMessage: "Running compliance review…",
				reviewPayload: null,
				openIndex: null,
			});
			try {
				const formData = new FormData();
				formData.append("file", file);
				const { data } = await apiClient.post<ReviewPayload>(REVIEW_URL, formData);
				set({
					reviewPayload: data,
					reviewStatusMessage: "Review completed.",
				});
			} catch (error) {
				let message = "Unexpected error.";
				if (axios.isAxiosError(error)) {
					const body = error.response?.data as ErrorBody | undefined;
					message = body?.error ?? error.response?.statusText ?? error.message;
				}
				set({
					reviewStatusMessage: message,
					reviewPayload: null,
				});
			} finally {
				set({ reviewLoading: false });
			}
		},
		runComplianceAction: async () => {
			const { file, actionPrompt } = get();
			if (!file) {
				set({ actionStatusMessage: "Please choose a CSV file." });
				return;
			}
			if (!actionPrompt.trim()) {
				set({ actionStatusMessage: "Please enter a compliance action prompt." });
				return;
			}
			set({
				actionLoading: true,
				actionStatusMessage: "Running compliance action…",
				actionPayload: null,
			});
			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("prompt", actionPrompt.trim());
				const { data } = await apiClient.post<ComplianceActionPayload>(
					REVIEW_ACTION_URL,
					formData,
				);
				set({
					actionPayload: data,
					actionStatusMessage: "Compliance action completed.",
				});
			} catch (error) {
				let message = "Unexpected error.";
				if (axios.isAxiosError(error)) {
					const body = error.response?.data as ErrorBody | undefined;
					message = body?.error ?? error.response?.statusText ?? error.message;
				}
				set({
					actionStatusMessage: message,
					actionPayload: null,
				});
			} finally {
				set({ actionLoading: false });
			}
		},
	}),
);
