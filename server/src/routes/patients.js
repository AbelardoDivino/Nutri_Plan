import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import DietPlan from '../models/DietPlan.js'
import WorkoutPlan from '../models/WorkoutPlan.js'
import ProgressLog from '../models/ProgressLog.js'
import Message from '../models/Message.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)
router.use(requireAdmin)

const randomPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out + '!'
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = (req.query.search || '').trim()
    const q = { role: 'patient' }
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      q.$or = [{ name: re }, { email: re }, { goal: re }]
    }
    const patients = await User.find(q).sort({ createdAt: -1 })
    const ids = patients.map((p) => p._id)
    const [diets, workouts, progress] = await Promise.all([
      DietPlan.find({ patient: { $in: ids }, active: true }).select('patient title targetCalories totals updatedAt'),
      WorkoutPlan.find({ patient: { $in: ids }, active: true }).select('patient title level updatedAt'),
      ProgressLog.aggregate([
        { $match: { patient: { $in: ids } } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: '$patient',
            date: { $first: '$date' },
            weight: { $first: '$weight' },
          },
        },
      ]),
    ])
    const dietMap = Object.fromEntries(diets.map((d) => [String(d.patient), d]))
    const workoutMap = Object.fromEntries(workouts.map((w) => [String(w.patient), w]))
    const progressMap = Object.fromEntries(progress.map((p) => [String(p._id), p]))
    const enriched = patients.map((p) => ({
      ...p.toJSON(),
      activeDiet: dietMap[String(p._id)] || null,
      activeWorkout: workoutMap[String(p._id)] || null,
      lastProgress: progressMap[String(p._id)] || null,
    }))
    res.json({ patients: enriched })
  }),
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, birthDate, gender, height, startWeight, goal, activityLevel, notes } = req.body || {}
    if (!name || !email) throw new ApiError(400, 'Nome e e-mail são obrigatórios.')
    const e = String(email).toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new ApiError(400, 'E-mail inválido.')
    const exists = await User.findOne({ email: e })
    if (exists) throw new ApiError(409, 'Já existe um usuário com este e-mail.')
    const pwd = password && String(password).length >= 8 ? String(password) : randomPassword()
    const user = await User.create({
      name: String(name).trim(),
      email: e,
      passwordHash: await User.hashPassword(pwd),
      role: 'patient',
      phone: phone || '',
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender || '',
      height: height === '' || height == null ? null : Number(height),
      startWeight: startWeight === '' || startWeight == null ? null : Number(startWeight),
      goal: goal || '',
      activityLevel: activityLevel || '',
      notes: notes || '',
    })
    res.status(201).json({ patient: user, tempPassword: pwd })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' })
    if (!patient) throw new ApiError(404, 'Paciente não encontrado.')
    const [diets, workouts, progress, unread] = await Promise.all([
      DietPlan.find({ patient: patient._id }).sort({ createdAt: -1 }),
      WorkoutPlan.find({ patient: patient._id }).sort({ createdAt: -1 }),
      ProgressLog.find({ patient: patient._id }).sort({ date: -1 }).limit(50),
      Message.countDocuments({ patient: patient._id, senderRole: 'patient', readByAdmin: false }),
    ])
    res.json({ patient, diets, workouts, progress, unreadMessages: unread })
  }),
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' })
    if (!patient) throw new ApiError(404, 'Paciente não encontrado.')
    const b = req.body || {}
    if (b.name !== undefined) patient.name = String(b.name).trim()
    if (b.email !== undefined) {
      const e = String(b.email).toLowerCase().trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new ApiError(400, 'E-mail inválido.')
      const exists = await User.findOne({ email: e, _id: { $ne: patient._id } })
      if (exists) throw new ApiError(409, 'E-mail já em uso.')
      patient.email = e
    }
    if (b.password && String(b.password).length >= 8) {
      patient.passwordHash = await User.hashPassword(String(b.password))
    }
    if (b.phone !== undefined) patient.phone = String(b.phone)
    if (b.birthDate !== undefined) patient.birthDate = b.birthDate ? new Date(b.birthDate) : null
    if (b.gender !== undefined) patient.gender = b.gender
    if (b.height !== undefined) patient.height = b.height === '' || b.height == null ? null : Number(b.height)
    if (b.startWeight !== undefined) patient.startWeight = b.startWeight === '' || b.startWeight == null ? null : Number(b.startWeight)
    if (b.goal !== undefined) patient.goal = String(b.goal)
    if (b.activityLevel !== undefined) patient.activityLevel = String(b.activityLevel)
    if (b.notes !== undefined) patient.notes = String(b.notes)
    if (b.active !== undefined) patient.active = Boolean(b.active)
    await patient.save()
    res.json({ patient })
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' })
    if (!patient) throw new ApiError(404, 'Paciente não encontrado.')
    await Promise.all([
      DietPlan.deleteMany({ patient: patient._id }),
      WorkoutPlan.deleteMany({ patient: patient._id }),
      ProgressLog.deleteMany({ patient: patient._id }),
      Message.deleteMany({ patient: patient._id }),
      import('../models/DailyLog.js').then((m) => m.default.deleteMany({ patient: patient._id })),
    ])
    await patient.deleteOne()
    res.json({ ok: true })
  }),
)

router.post(
  '/:id/reset-password',
  asyncHandler(async (req, res) => {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' })
    if (!patient) throw new ApiError(404, 'Paciente não encontrado.')
    const pwd = randomPassword()
    patient.passwordHash = await User.hashPassword(pwd)
    await patient.save()
    res.json({ tempPassword: pwd })
  }),
)

export default router