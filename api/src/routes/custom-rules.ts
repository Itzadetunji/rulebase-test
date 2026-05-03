import { Hono } from 'hono'
import type { ComplianceRule, RuleSetMode } from '../lib/compliance/types'
import { deleteRule, getMode, getRules, setMode, upsertRule } from '../lib/rules/redis'

const customRules = new Hono()

const assertMode = (value: string): RuleSetMode => {
  if (value === 'default' || value === 'custom' || value === 'combined') {
    return value
  }
  throw new Error('mode must be one of: default, custom, combined.')
}

customRules.get('/custom-rules', async (c) => {
  try {
    const [rules, mode] = await Promise.all([getRules(), getMode()])

    return c.json({
      mode,
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to fetch custom rules.',
      },
      400,
    )
  }
})

customRules.patch('/custom-rules/mode', async (c) => {
  try {
    const body = (await c.req.json()) as { mode?: string }

    const mode = assertMode(body.mode ?? '')
    const nextMode = await setMode(mode)

    return c.json({
      mode: nextMode,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to update custom rule mode.',
      },
      400,
    )
  }
})

customRules.patch('/custom-rules/:ruleId', async (c) => {
  try {
    const ruleId = c.req.param('ruleId')?.trim() ?? ''
    if (!ruleId) {
      throw new Error('ruleId path param is required.')
    }

    const body = (await c.req.json()) as { title?: string; description?: string }

    const rule: ComplianceRule = {
      id: ruleId,
      title: body.title?.trim() ?? '',
      description: body.description?.trim() ?? '',
    }
    const rules = await upsertRule(rule)

    return c.json({
      mode: await getMode(),
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to upsert custom rule.',
      },
      400,
    )
  }
})

customRules.delete('/custom-rules/:ruleId', async (c) => {
  try {
    const ruleId = c.req.param('ruleId')?.trim() ?? ''
    if (!ruleId) {
      throw new Error('ruleId path param is required.')
    }

    const { rules } = await deleteRule(ruleId)
    return c.json({
      mode: await getMode(),
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to delete custom rule.',
      },
      400,
    )
  }
})

export default customRules
