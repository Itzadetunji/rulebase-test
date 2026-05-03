import axios from "axios"

export const REVIEW_URL = apiBase() + "/api/v1/review"
export const REVIEW_ACTION_URL = apiBase() + "/api/v1/review/action"
export const CUSTOM_RULES_URL = apiBase() + "/api/v1/custom-rules"
export const CUSTOM_RULES_MODE_URL = apiBase() + "/api/v1/custom-rules/mode"

export function apiBase(): string {
	return import.meta.env.VITE_API_BASE_URL ?? ""
}

export function customRuleByIdUrl(ruleId: string): string {
	return `${CUSTOM_RULES_URL}/${encodeURIComponent(ruleId.trim())}`
}

export const apiClient = axios.create({
	baseURL: apiBase(),
	timeout: 300_000,
})
