export type FindingStatus = "compliant" | "flagged" | "warning"
export type FindingSeverity = "low" | "medium" | "high" | "critical"
export type OverallStatus = "compliant" | "flagged"

export type RuleFinding = {
	ruleId: string
	ruleTitle: string
	status: FindingStatus
	severity: FindingSeverity
	rationale: string
	evidence: string
	suggestedRewrite: string
}

export type ReviewResult = {
	interactionId: string
	timestamp: string
	channel: string
	agentId?: string
	customerId?: string
	overallStatus: OverallStatus
	findings: RuleFinding[]
	error?: string
}

export type ReviewSummary = {
	totalRows: number
	compliantRows: number
	flaggedRows: number
}

export type ReviewPayload = {
	summary: ReviewSummary
	results: ReviewResult[]
}

export type ComplianceActionPayload = {
	prompt: string
	output: string
}

export type CustomRuleMode = "default" | "custom" | "combined"

export type ComplianceRule = {
	id: string
	title: string
	description: string
}

export type CustomRulesPayload = {
	mode: CustomRuleMode
	rules: ComplianceRule[]
}
