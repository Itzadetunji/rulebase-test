import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import customRules from './routes/custom-rules'
import review from './routes/review'

const app = new Hono()

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, '')
const parseOrigins = (value?: string) =>
  value
    ?.split(',')
    .map(normalizeOrigin)
    .filter(Boolean) ?? []

const baseOrigins =
  process.env.NODE_ENV !== 'production'
    ? (['http://localhost:5173', 'http://127.0.0.1:5173'] as const)
    : (['https://rulebase-test.vercel.app'] as const)

const allowedOrigins = [...baseOrigins.map(normalizeOrigin), ...parseOrigins(process.env.FRONTEND_ORIGIN)]

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)
app.route('/api/v1/', review)
app.route('/api/v1/', customRules)

app.get('/', (c) =>
  c.json({
    status: 'ok',
    data: {
      message: 'Welcome to Rulebase Test API by Adetunji',
      description:
        'The review API analyzes customer interaction transcripts for UDAAP compliance and returns summary metrics plus per-interaction findings.',
      usage: {
        endpoint: 'POST /api/v1/review',
        contentTypes: ['multipart/form-data (file)', 'application/json (interactions array)'],
      },
    },
  }),
)

export default app
