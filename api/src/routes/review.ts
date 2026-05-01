import { Hono } from 'hono'
import { parseInteractionsCsv } from '../lib/csv/parse'
import { evaluateInteractionWithMinimax } from '../lib/ai/minimax'
import type { InteractionRow, ReviewResponse, ReviewResult } from '../lib/compliance/types'

const review = new Hono()

const parseJsonInteractions = async (request: Request): Promise<InteractionRow[]> => {
  const body = (await request.json()) as { interactions?: InteractionRow[] }
  if (!body.interactions || !Array.isArray(body.interactions)) {
    throw new Error('JSON body must include interactions array.')
  }

  return body.interactions
}

const parseMultipartCsv = async (request: Request): Promise<InteractionRow[]> => {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    throw new Error('Expected CSV file in form field "file".')
  }

  const csvText = await file.text()
  return parseInteractionsCsv(csvText).rows
}

const parseRequestInteractions = async (request: Request): Promise<InteractionRow[]> => {
  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    return parseMultipartCsv(request)
  }

  if (contentType.includes('application/json')) {
    return parseJsonInteractions(request)
  }

  throw new Error('Unsupported content-type. Use multipart/form-data or application/json.')
}


// api/v1/review
review.post('/review', async (c) => {
  try {
    const interactions = await parseRequestInteractions(c.req.raw)

    const results: ReviewResult[] = []
    for (const interaction of interactions) {
      try {
        const reviewResult = await evaluateInteractionWithMinimax(interaction)
        results.push({
          interactionId: interaction.interactionId,
          timestamp: interaction.timestamp,
          channel: interaction.channel,
          agentId: interaction.agentId,
          customerId: interaction.customerId,
          overallStatus: reviewResult.overallStatus,
          findings: reviewResult.findings
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
          error: error instanceof Error ? error.message : 'Unknown evaluation error.'
        })
      }
    }

    const compliantRows = results.filter(
      (result) => result.overallStatus === 'compliant'
    ).length
    const flaggedRows = results.length - compliantRows

    const payload: ReviewResponse = {
      summary: {
        totalRows: results.length,
        compliantRows,
        flaggedRows
      },
      results
    }

    return c.json(payload)
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process review request.'
      },
      400
    )
  }
})

export default review
