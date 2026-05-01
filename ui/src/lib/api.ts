import axios from "axios"

export const REVIEW_URL = "/api/v1/review"

export function apiBase(): string {
	return import.meta.env.VITE_API_BASE_URL ?? ""
}

export const apiClient = axios.create({
	baseURL: apiBase(),
	timeout: 300_000,
})
