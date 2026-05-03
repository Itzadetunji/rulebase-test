import type { ComplianceRule, RuleSetMode } from '../compliance/types'

declare const Bun: {
  redis: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<unknown>
  }
}

const DEFAULT_MODE: RuleSetMode = 'default'

const RULES_KEY = 'rules:items'
const MODE_KEY = 'rules:mode'

const parseRules = (value: string | null): ComplianceRule[] => {
  if (!value) return []
  const parsed = JSON.parse(value) as unknown
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((rule) => {
      const item = rule as Partial<ComplianceRule>
      if (!item.id || !item.title || !item.description) return null
      return {
        id: item.id,
        title: item.title,
        description: item.description,
      } satisfies ComplianceRule
    })
    .filter((rule): rule is ComplianceRule => Boolean(rule))
}

const parseMode = (value: string | null): RuleSetMode => {
  if (value === 'default' || value === 'custom' || value === 'combined') {
    return value
  }
  return DEFAULT_MODE
}

export const getRules = async (): Promise<ComplianceRule[]> => {
  const value = await Bun.redis.get(RULES_KEY)
  return parseRules(value)
}

export const setRules = async (rules: ComplianceRule[]): Promise<void> => {
  await Bun.redis.set(RULES_KEY, JSON.stringify(rules))
}

export const upsertRule = async (rule: ComplianceRule): Promise<ComplianceRule[]> => {
  const normalizedRule: ComplianceRule = {
    id: rule.id.trim(),
    title: rule.title.trim(),
    description: rule.description.trim(),
  }
  if (!normalizedRule.id || !normalizedRule.title || !normalizedRule.description) {
    throw new Error('Rule id, title, and description are required.')
  }

  const existingRules = await getRules()
  const ruleIndex = existingRules.findIndex((item) => item.id === normalizedRule.id)

  if (ruleIndex === -1) {
    existingRules.push(normalizedRule)
  } else {
    existingRules[ruleIndex] = normalizedRule
  }

  await setRules(existingRules)
  return existingRules
}

export const deleteRule = async (
  ruleId: string,
): Promise<{ rules: ComplianceRule[]; removed: boolean }> => {
  const normalizedRuleId = ruleId.trim()
  if (!normalizedRuleId) {
    throw new Error('ruleId is required.')
  }

  const existingRules = await getRules()
  const nextRules = existingRules.filter((rule) => rule.id !== normalizedRuleId)

  const removed = nextRules.length !== existingRules.length
  if (removed) {
    await setRules(nextRules)
  }

  return {
    rules: nextRules,
    removed,
  }
}

export const getMode = async (): Promise<RuleSetMode> => {
  const value = await Bun.redis.get(MODE_KEY)
  return parseMode(value)
}

export const setMode = async (mode: RuleSetMode): Promise<RuleSetMode> => {
  await Bun.redis.set(MODE_KEY, mode)
  return mode
}
