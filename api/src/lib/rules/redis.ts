import type { ComplianceRule } from '../compliance/types'

declare const Bun: {
  redis: {
    get: (key: string) => Promise<string | null>
    set: (key: string, value: string) => Promise<unknown>
  }
}

const REDIS_OP_TIMEOUT_MS = 500

const RULES_KEY = 'rules:items'
const inMemoryStore = new Map<string, string>()

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error('Redis operation timed out.'))
      }, timeoutMs),
    ),
  ])
}

const safeGet = async (key: string): Promise<string | null> => {
  try {
    return await withTimeout(Bun.redis.get(key), REDIS_OP_TIMEOUT_MS)
  } catch {
    return inMemoryStore.get(key) ?? null
  }
}

const safeSet = async (key: string, value: string): Promise<void> => {
  try {
    await withTimeout(Bun.redis.set(key, value), REDIS_OP_TIMEOUT_MS)
  } catch {
    inMemoryStore.set(key, value)
  }
}

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

export const getRules = async (): Promise<ComplianceRule[]> => {
  const value = await safeGet(RULES_KEY)
  return parseRules(value)
}

export const setRules = async (rules: ComplianceRule[]): Promise<void> => {
  await safeSet(RULES_KEY, JSON.stringify(rules))
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

export const createRule = async (
  rule: Omit<ComplianceRule, 'id'>,
): Promise<{ rules: ComplianceRule[]; createdRule: ComplianceRule }> => {
  const normalizedRule = {
    title: rule.title.trim(),
    description: rule.description.trim(),
  }

  if (!normalizedRule.title || !normalizedRule.description) {
    throw new Error('Rule title and description are required.')
  }

  const createdRule: ComplianceRule = {
    id: crypto.randomUUID(),
    title: normalizedRule.title,
    description: normalizedRule.description,
  }

  const existingRules = await getRules()
  existingRules.push(createdRule)
  await setRules(existingRules)

  return {
    rules: existingRules,
    createdRule,
  }
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
