import type { InteractionRow } from '../compliance/types'

const REQUIRED_HEADERS = [
  'interaction_id',
  'timestamp',
  'channel',
  'agent_id',
  'customer_id',
  'transcript',
] as const

type CsvParseResult = {
  rows: InteractionRow[]
}

const parseCsvRows = (input: string): string[][] => {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]

    if (char === '"') {
      if (insideQuotes && next === '"') {
        currentField += '"'
        i += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim())
      currentField = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1
      }
      currentRow.push(currentField.trim())
      currentField = ''

      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      continue
    }

    currentField += char
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
  }

  if (currentRow.some((field) => field.length > 0)) {
    rows.push(currentRow)
  }

  return rows
}

const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, '_')

export const parseInteractionsCsv = (input: string): CsvParseResult => {
  const rows = parseCsvRows(input)
  if (rows.length === 0) {
    throw new Error('CSV is empty.')
  }

  const headerRow = rows[0].map(normalizeHeader)
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headerRow.includes(header))

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`)
  }

  const indexMap = Object.fromEntries(headerRow.map((header, index) => [header, index])) as Record<
    string,
    number
  >

  const dataRows = rows.slice(1)
  const interactions = dataRows.map((fields, rowIndex) => {
    const interactionId = fields[indexMap.interaction_id] ?? ''
    const timestamp = fields[indexMap.timestamp] ?? ''
    const channel = fields[indexMap.channel] ?? ''
    const agentId = fields[indexMap.agent_id] ?? ''
    const customerId = fields[indexMap.customer_id] ?? ''
    const transcript = fields[indexMap.transcript] ?? ''

    if (!interactionId || !timestamp || !channel || !transcript) {
      throw new Error(
        `Row ${rowIndex + 2} is missing required values (interaction_id, timestamp, channel, transcript).`,
      )
    }

    return {
      interactionId,
      timestamp,
      channel,
      agentId,
      customerId,
      transcript,
    } satisfies InteractionRow
  })

  return { rows: interactions }
}
