import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import ProgressLog from '../models/ProgressLog.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/patients/:id/progress', requireAdmin, asyncHandler(async (req, res) => {
  const p = await User.findOne({ _id: req.params.id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  const logs = await ProgressLog.find({ patient: p._id }).sort({ date: -1 })
  res.json({ logs })
}))

router.post('/patients/:id/progress', requireAdmin, asyncHandler(async (req, res) => {
  const p = await User.findOne({ _id: req.params.id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  const b = req.body || {}
  const log = await ProgressLog.create({
    patient: p._id,
    date: b.date ? new Date(b.date) : new Date(),
    weight: b.weight === '' || b.weight == null ? null : Number(b.weight),
    bodyFat: b.bodyFat === '' || b.bodyFat == null ? null : Number(b.bodyFat),
    waist: b.waist === '' || b.waist == null ? null : Number(b.waist),
    chest: b.chest === '' || b.chest == null ? null : Number(b.chest),
    hip: b.hip === '' || b.hip == null ? null : Number(b.hip),
    arm: b.arm === '' || b.arm == null ? null : Number(b.arm),
    notes: b.notes || '',
    recordedBy: req.user._id,
  })
  res.status(201).json({ log })
}))

router.delete('/progress/:id', asyncHandler(async (req, res) => {
  const log = await ProgressLog.findById(req.params.id)
  if (!log) throw new ApiError(404, 'Registro não encontrado.')
  if (req.user.role !== 'admin' && String(log.patient) !== String(req.user._id)) {
    throw new ApiError(403, 'Acesso negado.')
  }
  await log.deleteOne()
  res.json({ ok: true })
}))

// patient
router.get('/my/progress', asyncHandler(async (req, res) => {
  const logs = await ProgressLog.find({ patient: req.user._id }).sort({ date: 1 })
  res.json({ logs })
}))

router.post('/my/progress', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const log = await ProgressLog.create({
    patient: req.user._id,
    date: b.date ? new Date(b.date) : new Date(),
    weight: b.weight === '' || b.weight == null ? null : Number(b.weight),
    bodyFat: b.bodyFat === '' || b.bodyFat == null ? null : Number(b.bodyFat),
    waist: b.waist === '' || b.waist == null ? null : Number(b.waist),
    chest: b.chest === '' || b.chest == null ? null : Number(b.chest),
    hip: b.hip === '' || b.hip == null ? null : Number(b.hip),
    arm: b.arm === '' || b.arm == null ? null : Number(b.arm),
    notes: b.notes || '',
    recordedBy: req.user._id,
  })
  res.status(201).json({ log })
}))

export default router