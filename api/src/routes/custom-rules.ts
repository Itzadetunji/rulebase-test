import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'
import type { ComplianceRule } from '../lib/compliance/types'
import { createRule, deleteRule, getRules, upsertRule } from '../lib/rules/redis'

const customRules = new Hono()

customRules.get('/custom-rules', async (c) => {
  try {
    const rules = await getRules()

    return c.json({
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to fetch custom rules.',
      },
      StatusCodes.BAD_REQUEST,
    )
  }
})

customRules.post('/custom-rules', async (c) => {
  try {
    const body = (await c.req.json()) as { title?: string; description?: string }
    const { rules, createdRule } = await createRule({
      title: body.title ?? '',
      description: body.description ?? '',
    })

    return c.json({
      createdRule,
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to create custom rule.',
      },
      StatusCodes.BAD_REQUEST,
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
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to upsert custom rule.',
      },
      StatusCodes.BAD_REQUEST,
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
      rules,
    })
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to delete custom rule.',
      },
      StatusCodes.BAD_REQUEST,
    )
  }
})

export default customRules
