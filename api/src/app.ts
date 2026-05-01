import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import review from './routes/review'

const app = new Hono()

const devOrigins =
  process.env.NODE_ENV !== 'production'
    ? (['http://localhost:5173', 'http://127.0.0.1:5173'] as const)
    : []

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: [
      ...devOrigins,
      ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : [])
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  })
)
app.route('/api/v1/', review)

export default app
