import type { FindingSeverity, ReviewResult } from "@/types/compliance"

export type RiskDisplay = { label: string; badgeClass: string }

export function populationCategory(channel: string): string {
	const ch = String(channel || "").toLowerCase()
	if (ch === "call") return "Voice"
	if (ch === "chat") return "Digital chat"
	if (ch === "email") return "Email"
	return channel ? String(channel) : "—"
}

export function riskFromResult(result: ReviewResult): RiskDisplay {
	if (result.error) {
		return {
			label: "Error",
			badgeClass:
				"bg-red-50 text-red-700 ring-red-600/25 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-500/30",
		}
	}
	if (result.overallStatus === "compliant") {
		return {
			label: "Low",
			badgeClass:
				"bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30",
		}
	}
	const order: Record<FindingSeverity, number> = {
		low: 0,
		medium: 1,
		high: 2,
		critical: 3,
	}
	const severities = (result.findings ?? [])
		.map((f) => f.severity)
		.filter((s): s is FindingSeverity => Boolean(s))
	if (severities.length === 0) {
		return {
			label: "Medium",
			badgeClass:
				"bg-amber-50 text-amber-900 ring-amber-600/25 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-500/30",
		}
	}
	let worst: FindingSeverity = "low"
	for (const s of severities) {
		if (order[s] > order[worst]) worst = s
	}
	const labelMap: Record<FindingSeverity, string> = {
		low: "Low",
		medium: "Medium",
		high: "High",
		critical: "Critical",
	}
	if (worst === "critical") {
		return {
			label: "Critical",
			badgeClass:
				"bg-red-50 text-red-800 ring-red-600/25 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-500/30",
		}
	}
	if (worst === "high") {
		return {
			label: "High",
			badgeClass:
				"bg-orange-50 text-orange-900 ring-orange-600/25 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-500/30",
		}
	}
	return {
		label: labelMap[worst] ?? "Medium",
		badgeClass:
			"bg-amber-50 text-amber-900 ring-amber-600/25 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-500/30",
	}
}
