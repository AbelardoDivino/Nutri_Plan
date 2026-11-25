import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Lead from '../models/Lead.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/leads', requireAdmin, asyncHandler(async (req, res) => {
  const status = req.query.status
  const q = status ? { status } : {}
  const leads = await Lead.find(q).sort({ createdAt: -1 })
  res.json({ leads })
}))

router.put('/leads/:id', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw new ApiError(404, 'Contato não encontrado.')
  const b = req.body || {}
  if (b.status !== undefined) lead.status = b.status
  if (b.notes !== undefined) lead.notes = String(b.notes)
  if (b.name !== undefined) lead.name = String(b.name).trim()
  if (b.email !== undefined) lead.email = String(b.email).toLowerCase().trim()
  if (b.phone !== undefined) lead.phone = String(b.phone)
  if (b.goal !== undefined) lead.goal = String(b.goal)
  await lead.save()
  res.json({ lead })
}))

router.delete('/leads/:id', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw new ApiError(404, 'Contato não encontrado.')
  await lead.deleteOne()
  res.json({ ok: true })
}))

router.post('/leads/:id/convert', requireAdmin, asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw new ApiError(404, 'Contato não encontrado.')
  const exists = await User.findOne({ email: lead.email })
  if (exists) throw new ApiError(409, 'Já existe um usuário com este e-mail.')
  const pwd = (req.body && req.body.password && String(req.body.password).length >= 6) ? String(req.body.password) : (() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    let out = ''
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
    return out + '!'
  })()
  const patient = await User.create({
    name: lead.name,
    email: lead.email,
    passwordHash: await User.hashPassword(pwd),
    role: 'patient',
    phone: lead.phone,
    goal: lead.goal,
  })
  lead.status = 'cliente'
  lead.convertedPatient = patient._id
  await lead.save()
  res.status(201).json({ patient, tempPassword: pwd })
}))

export default router