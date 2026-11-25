import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import WorkoutPlan from '../models/WorkoutPlan.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const getPatient = async (id) => {
  const p = await User.findOne({ _id: id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  return p
}

router.get('/patients/:id/workouts', requireAdmin, asyncHandler(async (req, res) => {
  await getPatient(req.params.id)
  const workouts = await WorkoutPlan.find({ patient: req.params.id }).sort({ createdAt: -1 })
  res.json({ workouts })
}))

router.post('/patients/:id/workouts', requireAdmin, asyncHandler(async (req, res) => {
  await getPatient(req.params.id)
  const b = req.body || {}
  if (!b.title) throw new ApiError(400, 'Título do treino é obrigatório.')
  if (b.active !== false) {
    await WorkoutPlan.updateMany({ patient: req.params.id, active: true }, { $set: { active: false } })
  }
  const workout = await WorkoutPlan.create({
    patient: req.params.id,
    title: String(b.title).trim(),
    objective: b.objective || '',
    level: b.level || 'Iniciante',
    notes: b.notes || '',
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
    active: b.active !== false,
    days: Array.isArray(b.days) ? b.days : [],
    createdBy: req.user._id,
  })
  res.status(201).json({ workout })
}))

router.put('/workouts/:id', requireAdmin, asyncHandler(async (req, res) => {
  const w = await WorkoutPlan.findById(req.params.id)
  if (!w) throw new ApiError(404, 'Treino não encontrado.')
  const b = req.body || {}
  if (b.title !== undefined) w.title = String(b.title).trim()
  if (b.objective !== undefined) w.objective = String(b.objective)
  if (b.level !== undefined) w.level = String(b.level)
  if (b.notes !== undefined) w.notes = String(b.notes)
  if (b.startDate !== undefined) w.startDate = b.startDate ? new Date(b.startDate) : null
  if (b.endDate !== undefined) w.endDate = b.endDate ? new Date(b.endDate) : null
  if (b.days !== undefined) w.days = b.days
  if (b.active === true && !w.active) {
    await WorkoutPlan.updateMany({ patient: w.patient, _id: { $ne: w._id }, active: true }, { $set: { active: false } })
    w.active = true
  }
  if (b.active === false) w.active = false
  await w.save()
  res.json({ workout: w })
}))

router.delete('/workouts/:id', requireAdmin, asyncHandler(async (req, res) => {
  const w = await WorkoutPlan.findById(req.params.id)
  if (!w) throw new ApiError(404, 'Treino não encontrado.')
  await w.deleteOne()
  res.json({ ok: true })
}))

router.patch('/workouts/:id/activate', requireAdmin, asyncHandler(async (req, res) => {
  const w = await WorkoutPlan.findById(req.params.id)
  if (!w) throw new ApiError(404, 'Treino não encontrado.')
  await WorkoutPlan.updateMany({ patient: w.patient, _id: { $ne: w._id } }, { $set: { active: false } })
  w.active = true
  await w.save()
  res.json({ workout: w })
}))

router.get('/my/workout', asyncHandler(async (req, res) => {
  const workout = await WorkoutPlan.findOne({ patient: req.user._id, active: true }).sort({ createdAt: -1 })
  res.json({ workout })
}))

export default router