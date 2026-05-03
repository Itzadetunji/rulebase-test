import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'
import { evaluateInteractionWithMinimax, runComplianceActionWithMinimax } from '../lib/ai/minimax'
import type {
  ComplianceActionResponse,
  InteractionRow,
  ReviewResponse,
  ReviewResult,
  RuleSetMode,
} from '../lib/compliance/types'
import { parseInteractionsCsv } from '../lib/csv/parse'
import { resolveRulesByMode } from '../lib/rules/resolve'

const review = new Hono()

const parseRuleMode = (value: unknown): RuleSetMode => {
  const mode = String(value ?? '').trim()
  if (mode === 'default' || mode === 'custom' || mode === 'combined') {
    return mode
  }
  return 'default'
}

const parseJsonInteractions = async (
  request: Request,
): Promise<{ interactions: InteractionRow[]; mode: RuleSetMode }> => {
  const body = (await request.json()) as { interactions?: InteractionRow[]; mode?: RuleSetMode }
  if (!body.interactions || !Array.isArray(body.interactions)) {
    throw new Error('JSON body must include interactions array.')
  }

  return {
    interactions: body.interactions,
    mode: parseRuleMode(body.mode),
  }
}

const parseMultipartCsv = async (
  request: Request,
): Promise<{ interactions: InteractionRow[]; mode: RuleSetMode }> => {
  const formData = await request.formData()
  const file = formData.get('file')
  const mode = parseRuleMode(formData.get('mode'))

  if (!(file instanceof File)) {
    throw new Error('Expected CSV file in form field "file".')
  }

  const csvText = await file.text()
  return {
    interactions: parseInteractionsCsv(csvText).rows,
    mode,
  }
}

const parseRequestInteractions = async (
  request: Request,
): Promise<{ interactions: InteractionRow[]; mode: RuleSetMode }> => {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartCsv(request)
  }

  if (contentType.includes('application/json')) {
    return parseJsonInteractions(request)
  }

  throw new Error('Unsupported content-type. Use multipart/form-data or application/json.')
}

const parseRequestWithPrompt = async (
  request: Request,
): Promise<{ interactions: InteractionRow[]; prompt: string }> => {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const file = formData.get('file')
    const prompt = String(formData.get('prompt') ?? '').trim()

    if (!(file instanceof File)) {
      throw new Error('Expected CSV file in form field "file".')
    }
    if (!prompt) {
      throw new Error('Prompt is required in form field "prompt".')
    }

    const csvText = await file.text()
    return {
      interactions: parseInteractionsCsv(csvText).rows,
      prompt,
    }
  }

  if (contentType.includes('application/json')) {
    const body = (await request.json()) as { interactions?: InteractionRow[]; prompt?: string }
    const prompt = (body.prompt ?? '').trim()

    if (!body.interactions || !Array.isArray(body.interactions)) {
      throw new Error('JSON body must include interactions array.')
    }
    if (!prompt) {
      throw new Error('JSON body must include a non-empty prompt.')
    }

    return {
      interactions: body.interactions,
      prompt,
    }
  }

  throw new Error('Unsupported content-type. Use multipart/form-data or application/json.')
}

// api/v1/review
review.post('/review', async (c) => {
  try {
    const { interactions, mode } = await parseRequestInteractions(c.req.raw)
    const { rules } = await resolveRulesByMode(mode)

    const results: ReviewResult[] = []
    for (const interaction of interactions) {
      try {
        const reviewResult = await evaluateInteractionWithMinimax(interaction, rules)
        results.push({
          interactionId: interaction.interactionId,
          timestamp: interaction.timestamp,
          channel: interaction.channel,
          agentId: interaction.agentId,
          customerId: interaction.customerId,
          overallStatus: reviewResult.overallStatus,
          findings: reviewResult.findings,
        })
      } catch (error) {
        results.push({
          interactionId: interaction.interactionId,
          timestamp: interaction.timestamp,
          channel: interaction.channel,
          agentId: interaction.agentId,
          customerId: interaction.customerId,
          overallStatus: 'flagged',
          findings: [],
          error: error instanceof Error ? error.message : 'Unknown evaluation error.',
        })
      }
    }

    const compliantRows = results.filter((result) => result.overallStatus === 'compliant').length
    const flaggedRows = results.length - compliantRows

    const payload: ReviewResponse = {
      summary: {
        totalRows: results.length,
        compliantRows,
        flaggedRows,
      },
      results,
    }

    return c.json(payload)
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process review request.',
      },
      StatusCodes.BAD_REQUEST,
    )
  }
})

// api/v1/review/action
review.post('/review/action', async (c) => {
  try {
    const { interactions, prompt } = await parseRequestWithPrompt(c.req.raw)
    const output = await runComplianceActionWithMinimax(interactions, prompt)

    const payload: ComplianceActionResponse = {
      prompt,
      output,
    }

    return c.json(payload)
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to process compliance action request.',
      },
      StatusCodes.BAD_REQUEST,
    )
  }
})

export default review
