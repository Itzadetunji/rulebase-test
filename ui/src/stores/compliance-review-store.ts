import axios from "axios";
import { create } from "zustand";
import { apiClient, REVIEW_ACTION_URL, REVIEW_URL } from "@/lib/api";
import type { ComplianceActionPayload, ReviewPayload } from "@/types/compliance";

type ErrorBody = { error?: string };
type StatusKind = "idle" | "success" | "error";

type ComplianceReviewStore = {
	file: File | null;
	activeTab: string;
	reviewLoading: boolean;
	reviewStatusMessage: string;
	reviewStatusKind: StatusKind;
	reviewPayload: ReviewPayload | null;
	actionPrompt: string;
	actionLoading: boolean;
	actionStatusMessage: string;
	actionStatusKind: StatusKind;
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
		reviewStatusKind: "idle",
		reviewPayload: null,
		actionPrompt: "",
		actionLoading: false,
		actionStatusMessage: "",
		actionStatusKind: "idle",
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
				set({
					reviewStatusMessage: "Please choose a CSV file.",
					reviewStatusKind: "error",
				});
				return;
			}
			set({
				reviewLoading: true,
				reviewStatusMessage: "",
				reviewStatusKind: "idle",
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
					reviewStatusKind: "success",
				});
			} catch (error) {
				let message = "Unexpected error.";
				if (axios.isAxiosError(error)) {
					const body = error.response?.data as ErrorBody | undefined;
					message = body?.error ?? error.response?.statusText ?? error.message;
				}
				set({
					reviewStatusMessage: message,
					reviewStatusKind: "error",
					reviewPayload: null,
				});
			} finally {
				set({ reviewLoading: false });
			}
		},
		runComplianceAction: async () => {
			const { file, actionPrompt } = get();
			if (!file) {
				set({
					actionStatusMessage: "Please choose a CSV file.",
					actionStatusKind: "error",
				});
				return;
			}
			if (!actionPrompt.trim()) {
				set({
					actionStatusMessage: "Please enter a compliance action prompt.",
					actionStatusKind: "error",
				});
				return;
			}
			set({
				actionLoading: true,
				actionStatusMessage: "",
				actionStatusKind: "idle",
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
					actionStatusKind: "success",
				});
			} catch (error) {
				let message = "Unexpected error.";
				if (axios.isAxiosError(error)) {
					const body = error.response?.data as ErrorBody | undefined;
					message = body?.error ?? error.response?.statusText ?? error.message;
				}
				set({
					actionStatusMessage: message,
					actionStatusKind: "error",
					actionPayload: null,
				});
			} finally {
				set({ actionLoading: false });
			}
		},
	}),
);
