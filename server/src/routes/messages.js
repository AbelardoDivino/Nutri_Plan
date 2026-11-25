import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import Message from '../models/Message.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const todayStr = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TZ || 'America/Sao_Paulo' }).format(new Date())
}

router.get('/messages/conversations', requireAdmin, asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('name email')
  const messages = await Message.find().sort({ createdAt: 1 }).populate('sender', 'name role')
  const map = new Map()
  for (const p of patients) map.set(String(p._id), { patient: p, messages: [], unread: 0, last: null })
  for (const m of messages) {
    const key = String(m.patient)
    if (!map.has(key)) continue
    const entry = map.get(key)
    entry.messages.push(m)
    entry.last = m
    if (m.senderRole === 'patient' && !m.readByAdmin) entry.unread++
  }
  const conversations = [...map.values()]
    .filter((e) => e.last)
    .sort((a, b) => new Date(b.last.createdAt) - new Date(a.last.createdAt))
    .map((e) => ({ patient: e.patient, lastMessage: e.last, unread: e.unread }))
  // also include patients with no messages? only if needed; keep all for new chat start
  res.json({ conversations, patients })
}))

router.get('/messages', asyncHandler(async (req, res) => {
  let patientId
  if (req.user.role === 'admin') {
    if (!req.query.patientId) throw new ApiError(400, 'patientId é obrigatório.')
    patientId = req.query.patientId
    const p = await User.findOne({ _id: patientId, role: 'patient' })
    if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  } else {
    patientId = req.user._id
  }
  const messages = await Message.find({ patient: patientId }).sort({ createdAt: 1 }).populate('sender', 'name role')
  res.json({ messages })
}))

router.post('/messages', asyncHandler(async (req, res) => {
  const { text, patientId } = req.body || {}
  if (!text || !String(text).trim()) throw new ApiError(400, 'Mensagem vazia.')
  let pid
  if (req.user.role === 'admin') {
    if (!patientId) throw new ApiError(400, 'patientId é obrigatório.')
    const p = await User.findOne({ _id: patientId, role: 'patient' })
    if (!p) throw new ApiError(404, 'Paciente não encontrado.')
    pid = p._id
  } else {
    pid = req.user._id
  }
  const msg = await Message.create({
    patient: pid,
    sender: req.user._id,
    senderRole: req.user.role,
    text: String(text).trim(),
    readByAdmin: req.user.role === 'admin',
    readByPatient: req.user.role === 'patient',
  })
  await msg.populate('sender', 'name role')
  res.status(201).json({ message: msg })
}))

router.put('/messages/read', asyncHandler(async (req, res) => {
  const { patientId } = req.body || {}
  let pid = patientId
  if (req.user.role === 'patient') pid = req.user._id
  if (!pid) throw new ApiError(400, 'patientId é obrigatório.')
  if (req.user.role === 'admin') {
    await Message.updateMany({ patient: pid, senderRole: 'patient', readByAdmin: false }, { $set: { readByAdmin: true } })
  } else {
    await Message.updateMany({ patient: pid, senderRole: 'admin', readByPatient: false }, { $set: { readByPatient: true } })
  }
  res.json({ ok: true })
}))

router.get('/messages/unread-count', asyncHandler(async (req, res) => {
  let count = 0
  if (req.user.role === 'admin') {
    count = await Message.countDocuments({ senderRole: 'patient', readByAdmin: false })
  } else {
    count = await Message.countDocuments({ patient: req.user._id, senderRole: 'admin', readByPatient: false })
  }
  res.json({ count })
}))

export default router