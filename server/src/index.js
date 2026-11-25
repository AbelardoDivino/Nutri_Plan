import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import { seed } from './seed.js'
import { ApiError } from './utils/asyncHandler.js'
import authRoutes from './routes/auth.js'
import patientRoutes from './routes/patients.js'
import dietRoutes from './routes/diets.js'
import workoutRoutes from './routes/workouts.js'
import progressRoutes from './routes/progress.js'
import messageRoutes from './routes/messages.js'
import dailyRoutes from './routes/daily.js'
import dashboardRoutes from './routes/dashboard.js'
import leadRoutes from './routes/leads.js'
import anamnesisRoutes from './routes/anamnesis.js'
import publicRoutes from './routes/public.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: '3mb' }))
app.use(morgan('dev'))

const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  }),
)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
})
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT) || 10,
  standardHeaders: true,
  legacyHeaders: false,
})

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/contact', contactLimiter)

app.use('/api/auth', authRoutes)
app.use('/api', publicRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api', dietRoutes)
app.use('/api', workoutRoutes)
app.use('/api', progressRoutes)
app.use('/api', messageRoutes)
app.use('/api', dailyRoutes)
app.use('/api', dashboardRoutes)
app.use('/api', leadRoutes)
app.use('/api', anamnesisRoutes)

// 404
app.use('/api', (_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }))

// error handler
app.use((err, _req, res, _next) => {
  let status = err.status || 500
  if (err.name === 'CastError') { status = 400; err.message = 'ID inválido.' }
  if (err.name === 'ValidationError') status = 400
  const isProd = process.env.NODE_ENV === 'production'
  const message = status === 500 && isProd ? 'Erro interno do servidor.' : (err.message || 'Erro interno do servidor.')
  if (status >= 500) console.error(err)
  res.status(status).json({ message, details: isProd ? undefined : err.details })
})

const start = async () => {
  await connectDB()
  await seed()
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start', err)
  process.exit(1)
})