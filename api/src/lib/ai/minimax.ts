import OpenAI from 'openai'
import {
  buildComplianceActionSystemPrompt,
  buildComplianceActionUserPrompt,
  buildComplianceSystemPrompt,
  buildComplianceUserPrompt,
} from '../compliance/prompt'
import { BASE_COMPLIANCE_RULES } from '../compliance/rules'
import type {
  ComplianceRule,
  InteractionRow,
  ReviewOverallStatus,
  RuleFinding,
} from '../compliance/types'

type ParsedComplianceOutput = {
  overallStatus: ReviewOverallStatus
  findings: RuleFinding[]
}

const DEFAULT_BASE_URL = 'https://api.minimax.io/v1'
const DEFAULT_MODEL = 'MiniMax-M2.7'

const getClientConfig = () => {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is missing.')
  }

  return {
    apiKey,
    baseUrl: process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL,
    model: process.env.MINIMAX_MODEL ?? DEFAULT_MODEL,
  }
}

const extractJsonPayload = (content: string) => {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain JSON payload.')
  }

  return content.slice(start, end + 1)
}

const normalizeStatus = (value: string): ReviewOverallStatus =>
  value === 'compliant' ? 'compliant' : 'flagged'

const normalizeFindingStatus = (value: string): RuleFinding['status'] => {
  if (value === 'compliant' || value === 'warning' || value === 'flagged') {
    return value
  }
  return 'warning'
}

const normalizeSeverity = (value: string): RuleFinding['severity'] => {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
    return value
  }
  return 'medium'
}

const normalizeFindings = (findings: unknown): RuleFinding[] => {
  if (!Array.isArray(findings)) {
    return []
  }

  return findings
    .map((finding) => {
      const item = finding as Partial<RuleFinding>
      return {
        ruleId: item.ruleId ?? 'unknown-rule',
        ruleTitle: item.ruleTitle ?? 'Unspecified Rule',
        status: normalizeFindingStatus(item.status ?? 'warning'),
        severity: normalizeSeverity(item.severity ?? 'medium'),
        rationale: item.rationale ?? 'No rationale returned.',
        evidence: item.evidence ?? 'No evidence returned.',
        suggestedRewrite: item.suggestedRewrite ?? 'No rewrite suggestion returned.',
      } satisfies RuleFinding
    })
    .filter((finding) => Boolean(finding.ruleId && finding.ruleTitle))
}

export const evaluateInteractionWithMinimax = async (
  interaction: InteractionRow,
  rules: ComplianceRule[] = BASE_COMPLIANCE_RULES,
): Promise<ParsedComplianceOutput> => {
  const { apiKey, baseUrl, model } = getClientConfig()

  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
  })

  let content: string
  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: buildComplianceSystemPrompt(rules),
        },
        {
          role: 'user',
          content: buildComplianceUserPrompt(interaction),
        },
      ],
    })

    const messageContent = completion.choices?.[0]?.message?.content
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error('Minimax response content was empty.')
    }
    content = messageContent
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Minimax API error.'
    throw new Error(`Minimax request failed: ${message}`)
  }

  const parsed = JSON.parse(extractJsonPayload(content)) as Partial<ParsedComplianceOutput>
  const findings = normalizeFindings(parsed.findings)

  return {
    overallStatus: normalizeStatus(parsed.overallStatus ?? 'flagged'),
    findings,
  }
}

export const runComplianceActionWithMinimax = async (
  interactions: InteractionRow[],
  instruction: string,
): Promise<string> => {
  const { apiKey, baseUrl, model } = getClientConfig()

  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl,
  })

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: buildComplianceActionSystemPrompt(),
        },
        {
          role: 'user',
          content: buildComplianceActionUserPrompt(interactions, instruction),
        },
      ],
    })

    const messageContent = completion.choices?.[0]?.message?.content
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error('Minimax response content was empty.')
    }

    return messageContent.trim()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Minimax API error.'
    throw new Error(`Minimax request failed: ${message}`)
  }
}
