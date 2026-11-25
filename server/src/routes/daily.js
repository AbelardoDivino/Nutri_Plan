import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import DailyLog from '../models/DailyLog.js'
import DietPlan from '../models/DietPlan.js'
import WorkoutPlan from '../models/WorkoutPlan.js'
import ProgressLog from '../models/ProgressLog.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const TZ = () => process.env.TZ || 'America/Sao_Paulo'
const todayStr = (date) => {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ() }).format(new Date())
}

router.get('/my/today', asyncHandler(async (req, res) => {
  const date = todayStr(req.query.date)
  const [log, diet, workout] = await Promise.all([
    DailyLog.findOne({ patient: req.user._id, date }),
    DietPlan.findOne({ patient: req.user._id, active: true }).sort({ createdAt: -1 }),
    WorkoutPlan.findOne({ patient: req.user._id, active: true }).sort({ createdAt: -1 }),
  ])
  res.json({ date, log: log || { date, mealsDone: [], exercisesDone: [], water: 0 }, diet, workout })
}))

router.post('/my/today/meal/:mealId/toggle', asyncHandler(async (req, res) => {
  const date = todayStr(req.body?.date)
  let log = await DailyLog.findOne({ patient: req.user._id, date })
  if (!log) log = await DailyLog.create({ patient: req.user._id, date, mealsDone: [], exercisesDone: [], water: 0 })
  const id = String(req.params.mealId)
  const idx = log.mealsDone.findIndex((x) => String(x) === id)
  if (idx >= 0) log.mealsDone.splice(idx, 1)
  else log.mealsDone.push(req.params.mealId)
  await log.save()
  res.json({ log })
}))

router.post('/my/today/exercise/:exerciseId/toggle', asyncHandler(async (req, res) => {
  const date = todayStr(req.body?.date)
  let log = await DailyLog.findOne({ patient: req.user._id, date })
  if (!log) log = await DailyLog.create({ patient: req.user._id, date, mealsDone: [], exercisesDone: [], water: 0 })
  const id = String(req.params.exerciseId)
  const idx = log.exercisesDone.findIndex((x) => String(x) === id)
  if (idx >= 0) log.exercisesDone.splice(idx, 1)
  else log.exercisesDone.push(req.params.exerciseId)
  await log.save()
  res.json({ log })
}))

router.post('/my/today/water', asyncHandler(async (req, res) => {
  const date = todayStr(req.body?.date)
  const amount = Number(req.body?.amount)
  if (Number.isNaN(amount)) throw new ApiError(400, 'Quantidade inválida.')
  let log = await DailyLog.findOne({ patient: req.user._id, date })
  if (!log) log = await DailyLog.create({ patient: req.user._id, date, mealsDone: [], exercisesDone: [], water: 0 })
  log.water = Math.max(0, (log.water || 0) + amount)
  await log.save()
  res.json({ log })
}))

// LGPD: data portability
router.get('/my/export', asyncHandler(async (req, res) => {
  const [user, diets, workouts, progress, messages, logs] = await Promise.all([
    User.findById(req.user._id).select('-passwordHash'),
    DietPlan.find({ patient: req.user._id }),
    WorkoutPlan.find({ patient: req.user._id }),
    ProgressLog.find({ patient: req.user._id }),
    Message.find({ patient: req.user._id }),
    DailyLog.find({ patient: req.user._id }),
  ])
  res.json({ exportedAt: new Date().toISOString(), user, diets, workouts, progress, messages, dailyLogs: logs })
}))

// LGPD: right to be forgotten (requires password confirmation)
router.delete('/my/account', asyncHandler(async (req, res) => {
  const { password } = req.body || {}
  const user = await User.findById(req.user._id).select('+passwordHash')
  if (typeof password !== 'string' || !(await user.verifyPassword(password))) {
    throw new ApiError(401, 'Senha incorreta. Não foi possível excluir a conta.')
  }
  await Promise.all([
    DietPlan.deleteMany({ patient: user._id }),
    WorkoutPlan.deleteMany({ patient: user._id }),
    ProgressLog.deleteMany({ patient: user._id }),
    Message.deleteMany({ patient: user._id }),
    DailyLog.deleteMany({ patient: user._id }),
  ])
  await user.deleteOne()
  res.json({ ok: true })
}))

export default router