import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import Lead from '../models/Lead.js'

const router = Router()

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    const name = String(b.name || '').trim()
    const email = String(b.email || '').toLowerCase().trim()
    const phone = String(b.phone || '').trim()
    const goal = String(b.goal || '').trim()
    const message = String(b.message || '').trim()
    if (!name) throw new ApiError(400, 'Informe seu nome.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Informe um e-mail válido.')
    const consent = b.consent === true || b.consent === 'true' || b.consent === 1
    if (!consent) throw new ApiError(400, 'É necessário aceitar a política de privacidade.')
    const lead = await Lead.create({ name, email, phone, goal, message, consent, consentedAt: new Date() })
    res.status(201).json({ ok: true, id: lead._id })
  }),
)

export default router