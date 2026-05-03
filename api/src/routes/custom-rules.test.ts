import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'
import type { ComplianceRule } from '../lib/compliance/types'

const getRulesMock = mock(async (): Promise<ComplianceRule[]> => [])
const createRuleMock = mock(
  async (): Promise<{ rules: ComplianceRule[]; createdRule: ComplianceRule }> => ({
    rules: [],
    createdRule: { id: 'rule-1', title: 'Title', description: 'Description' },
  }),
)
const upsertRuleMock = mock(async (): Promise<ComplianceRule[]> => [])
const deleteRuleMock = mock(async (): Promise<{ rules: ComplianceRule[] }> => ({ rules: [] }))

mock.module('../lib/rules/redis', () => ({
  getRules: getRulesMock,
  createRule: createRuleMock,
  upsertRule: upsertRuleMock,
  deleteRule: deleteRuleMock,
}))

const { default: customRules } = await import('./custom-rules')

const app = new Hono()
app.route('/api/v1', customRules)

const request = (path: string, init?: RequestInit) => app.request(`http://localhost${path}`, init)

describe('custom-rules routes', () => {
  beforeEach(() => {
    getRulesMock.mockReset()
    createRuleMock.mockReset()
    upsertRuleMock.mockReset()
    deleteRuleMock.mockReset()
  })

  it('returns all custom rules', async () => {
    const rules: ComplianceRule[] = [{ id: 'rule-1', title: 'T1', description: 'D1' }]
    getRulesMock.mockResolvedValueOnce(rules)

    const response = await request('/api/v1/custom-rules')
    const body = await response.json()

    expect(response.status).toBe(StatusCodes.OK)
    expect(body).toEqual({ rules })
  })

  it('returns bad request when fetching rules fails', async () => {
    getRulesMock.mockRejectedValueOnce(new Error('boom'))

    const response = await request('/api/v1/custom-rules')
    const body = await response.json()

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(body).toEqual({ error: 'boom' })
  })

  it('creates a rule and returns updated rules', async () => {
    const createdRule: ComplianceRule = { id: 'rule-2', title: 'New', description: 'Rule' }
    const rules: ComplianceRule[] = [createdRule]
    createRuleMock.mockResolvedValueOnce({ createdRule, rules })

    const response = await request('/api/v1/custom-rules', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'New', description: 'Rule' }),
    })
    const body = await response.json()

    expect(response.status).toBe(StatusCodes.OK)
    expect(createRuleMock).toHaveBeenCalledWith({ title: 'New', description: 'Rule' })
    expect(body).toEqual({ createdRule, rules })
  })

  it('upserts a rule by id', async () => {
    const rules: ComplianceRule[] = [{ id: 'rule-3', title: 'Updated', description: 'Desc' }]
    upsertRuleMock.mockResolvedValueOnce(rules)

    const response = await request('/api/v1/custom-rules/rule-3', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '  Updated  ', description: '  Desc  ' }),
    })
    const body = await response.json()

    expect(response.status).toBe(StatusCodes.OK)
    expect(upsertRuleMock).toHaveBeenCalledWith({
      id: 'rule-3',
      title: 'Updated',
      description: 'Desc',
    })
    expect(body).toEqual({ rules })
  })

  it('returns bad request when rule id is missing for delete', async () => {
    const response = await request('/api/v1/custom-rules/%20', { method: 'DELETE' })
    const body = await response.json()

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(body).toEqual({ error: 'ruleId path param is required.' })
  })
})
