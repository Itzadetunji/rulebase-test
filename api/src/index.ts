import app from './app'

const port = Number(process.env.PORT) || 3000

export default {
  hostname: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
  port,
  fetch: app.fetch,
}
