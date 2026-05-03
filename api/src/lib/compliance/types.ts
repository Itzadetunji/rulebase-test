export type ComplianceRule = {
  id: string
  title: string
  description: string
}

export type RuleSetMode = 'default' | 'custom' | 'combined'

export type InteractionRow = {
  interactionId: string
  timestamp: string
  channel: string
  agentId: string
  customerId: string
  transcript: string
}

export type FindingStatus = 'compliant' | 'flagged' | 'warning'
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ReviewOverallStatus = 'compliant' | 'flagged'

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
  agentId: string
  customerId: string
  overallStatus: ReviewOverallStatus
  findings: RuleFinding[]
  error?: string
}

export type ReviewSummary = {
  totalRows: number
  compliantRows: number
  flaggedRows: number
}

export type ReviewResponse = {
  summary: ReviewSummary
  results: ReviewResult[]
}

export type ComplianceActionResponse = {
  prompt: string
  output: string
}
