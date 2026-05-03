import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { apiClient, REVIEW_ACTION_URL, REVIEW_URL } from "@/lib/api";
import type { ComplianceActionPayload, ReviewPayload } from "@/types/compliance";

type ErrorBody = { error?: string };

export type RunReviewInput = {
	file: File | null;
};

export type RunActionInput = {
	file: File | null;
	prompt: string;
};

const extractAxiosErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const body = error.response?.data as ErrorBody | undefined;
		return body?.error ?? error.response?.statusText ?? error.message;
	}

	return error instanceof Error ? error.message : "Unexpected error.";
};

export const useRunReviewMutation = () => {
	return useMutation<ReviewPayload, Error, RunReviewInput>({
		mutationFn: async (input) => {
			if (!input.file) {
				throw new Error("Please choose a CSV file.");
			}

			const formData = new FormData();
			formData.append("file", input.file);
			const response = await apiClient.post<ReviewPayload>(REVIEW_URL, formData);
			return response.data;
		},
	});
};

export const useRunComplianceActionMutation = () => {
	return useMutation<ComplianceActionPayload, Error, RunActionInput>({
		mutationFn: async (input) => {
			if (!input.file) {
				throw new Error("Please choose a CSV file.");
			}
			if (!input.prompt.trim()) {
				throw new Error("Please enter a compliance action prompt.");
			}

			const formData = new FormData();
			formData.append("file", input.file);
			formData.append("prompt", input.prompt.trim());
			const response = await apiClient.post<ComplianceActionPayload>(
				REVIEW_ACTION_URL,
				formData,
			);
			return response.data;
		},
	});
};

export const getMutationErrorMessage = (error: unknown): string => {
	return extractAxiosErrorMessage(error);
};
