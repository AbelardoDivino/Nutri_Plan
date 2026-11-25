import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Anamnesis from '../models/Anamnesis.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/patients/:id/anamnesis', requireAdmin, asyncHandler(async (req, res) => {
  const p = await User.findOne({ _id: req.params.id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  const a = await Anamnesis.findOne({ patient: p._id })
  res.json({ anamnesis: a })
}))

router.put('/patients/:id/anamnesis', requireAdmin, asyncHandler(async (req, res) => {
  const p = await User.findOne({ _id: req.params.id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  const b = req.body || {}
  const a = await Anamnesis.findOneAndUpdate(
    { patient: p._id },
    { $set: { ...b, patient: p._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json({ anamnesis: a })
}))

router.get('/my/anamnesis', asyncHandler(async (req, res) => {
  const a = await Anamnesis.findOne({ patient: req.user._id })
  res.json({ anamnesis: a })
}))

router.put('/my/anamnesis', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const a = await Anamnesis.findOneAndUpdate(
    { patient: req.user._id },
    { $set: { ...b, patient: req.user._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  res.json({ anamnesis: a })
}))

export default router