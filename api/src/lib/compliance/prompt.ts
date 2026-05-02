import type { ComplianceRule, InteractionRow } from './types'

export const buildComplianceSystemPrompt = (rules: ComplianceRule[]) => {
  const ruleLines = rules
    .map((rule) => `- ${rule.id}: ${rule.title}. ${rule.description}`)
    .join('\n')

  return `
You are a financial compliance reviewer.
Evaluate customer-facing communication for policy and regulatory risk.

Core rules:
${ruleLines}

Output requirements:
- Return JSON only (no markdown, no code fence).
- Keep findings grounded in transcript evidence.
- Each finding must include: ruleId, ruleTitle, status, severity, rationale, evidence, suggestedRewrite.
- status values: compliant, warning, flagged
- severity values: low, medium, high, critical
- overallStatus values: compliant, flagged
- If a rule is clearly violated, mark it flagged.
- If uncertain but potentially risky, mark it warning.
- suggestedRewrite should be concise and compliant.
`.trim()
}

export const buildComplianceUserPrompt = (interaction: InteractionRow) => {
  return `
Review this interaction for compliance risk.

interactionId: ${interaction.interactionId}
timestamp: ${interaction.timestamp}
channel: ${interaction.channel}
agentId: ${interaction.agentId}
customerId: ${interaction.customerId}

transcript:
${interaction.transcript}

Return JSON with this exact shape:
{
  "overallStatus": "compliant" | "flagged",
  "findings": [
    {
      "ruleId": "string",
      "ruleTitle": "string",
      "status": "compliant" | "warning" | "flagged",
      "severity": "low" | "medium" | "high" | "critical",
      "rationale": "string",
      "evidence": "string",
      "suggestedRewrite": "string"
    }
  ]
}
`.trim()
}

export const buildComplianceActionSystemPrompt = () =>
  `
You are a UDAAP compliance analyst.
You receive a set of customer interaction rows and a user instruction.
Complete only compliance-related actions based on the provided data.

Output requirements:
- Return plain text only.
- Be concise, accurate, and evidence-based.
- If the instruction is unclear, state what is missing.
- If the request asks for unsupported guarantees or legal advice, decline and offer a safer alternative.
`.trim()

export const buildComplianceActionUserPrompt = (
  interactions: InteractionRow[],
  instruction: string,
) => {
  const serializedRows = JSON.stringify(interactions, null, 2)

  return `
User instruction:
${instruction}

CSV interactions as JSON:
${serializedRows}

Follow the instruction using only this dataset and UDAAP context.
`.trim()
}
