import { BASE_COMPLIANCE_RULES } from '../compliance/rules'
import type { ComplianceRule, RuleSetMode } from '../compliance/types'
import { getRules } from './redis'

const dedupeRules = (rules: ComplianceRule[]): ComplianceRule[] => {
  const byId = new Map<string, ComplianceRule>()
  for (const rule of rules) {
    byId.set(rule.id, rule)
  }
  return [...byId.values()]
}

export const resolveRulesByMode = async (
  mode: RuleSetMode,
): Promise<{
  mode: RuleSetMode
  rules: ComplianceRule[]
}> => {
  const customRules = await getRules()

  if (mode === 'custom') {
    return {
      mode,
      rules: customRules,
    }
  }

  if (mode === 'combined') {
    return {
      mode,
      rules: dedupeRules([...BASE_COMPLIANCE_RULES, ...customRules]),
    }
  }

  return {
    mode: 'default',
    rules: BASE_COMPLIANCE_RULES,
  }
}
