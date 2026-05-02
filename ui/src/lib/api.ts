import axios from "axios"

export const REVIEW_URL = apiBase() + "/api/v1/review"
export const REVIEW_ACTION_URL = apiBase() + "/api/v1/review/action"

export function apiBase(): string {
	return import.meta.env.VITE_API_BASE_URL ?? ""
}

export const apiClient = axios.create({
	baseURL: apiBase(),
	timeout: 300_000,
})
