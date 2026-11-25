import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import { signToken, authenticate } from '../middleware/auth.js'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto'

const router = Router()

const validateEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {}
    if (!validateEmail(email) || typeof password !== 'string' || password.length < 1) {
      throw new ApiError(400, 'Informe e-mail e senha válidos.')
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
    if (!user || !(await user.verifyPassword(password))) {
      throw new ApiError(401, 'E-mail ou senha inválidos.')
    }
    if (!user.active) throw new ApiError(403, 'Conta desativada. Fale com sua nutricionista.')
    user.lastLoginAt = new Date()
    await user.save()
    const token = signToken(user)
    res.json({ token, user })
  }),
)

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user })
  }),
)

router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user
    const { name, phone, email, birthDate, gender, height, goal, activityLevel, notes } = req.body || {}
    if (name !== undefined) user.name = String(name).trim()
    if (phone !== undefined) user.phone = String(phone).trim()
    if (email !== undefined) {
      const e = String(email).toLowerCase().trim()
      if (!validateEmail(e)) throw new ApiError(400, 'E-mail inválido.')
      const exists = await User.findOne({ email: e, _id: { $ne: user._id } })
      if (exists) throw new ApiError(409, 'E-mail já em uso.')
      user.email = e
    }
    if (user.role === 'patient') {
      if (birthDate !== undefined) user.birthDate = birthDate ? new Date(birthDate) : null
      if (gender !== undefined) user.gender = gender
      if (height !== undefined) user.height = height === '' ? null : Number(height)
      if (goal !== undefined) user.goal = String(goal)
      if (activityLevel !== undefined) user.activityLevel = String(activityLevel)
      if (notes !== undefined) user.notes = String(notes)
    } else {
      if (goal !== undefined) user.goal = String(goal)
    }
    await user.save()
    res.json({ user })
  }),
)

router.put(
  '/password',
  authenticate,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body || {}
    const user = await User.findById(req.user._id).select('+passwordHash')
    if (typeof currentPassword !== 'string' || !(await user.verifyPassword(currentPassword))) {
      throw new ApiError(401, 'Senha atual incorreta.')
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new ApiError(400, 'A nova senha deve ter ao menos 6 caracteres.')
    }
    user.passwordHash = await User.hashPassword(newPassword)
    await user.save()
    res.json({ ok: true })
  }),
)

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { credential } = req.body || {}
    if (typeof credential !== 'string' || !credential) {
      throw new ApiError(400, 'Credencial do Google ausente.')
    }
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) throw new ApiError(503, 'Login com Google não configurado no servidor.')
    const client = new OAuth2Client(clientId)
    let payload
    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId })
      payload = ticket.getPayload()
    } catch (err) {
      throw new ApiError(401, 'Token do Google inválido.')
    }
    if (!payload || !payload.email || !payload.email_verified) {
      throw new ApiError(401, 'E-mail do Google não verificado.')
    }
    const email = payload.email.toLowerCase().trim()
    const name = payload.name || email.split('@')[0]
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
    const isAdmin = adminEmail && email === adminEmail

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email }] })
    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub
        await user.save()
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId: payload.sub,
        passwordHash: null,
        role: isAdmin ? 'admin' : 'patient',
        goal: isAdmin ? 'Ajudar pacientes a alcançarem seus objetivos' : '',
      })
    }
    if (!user.active) throw new ApiError(403, 'Conta desativada. Fale com sua nutricionista.')
    user.lastLoginAt = new Date()
    await user.save()
    const token = signToken(user)
    res.json({ token, user })
  }),
)

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const b = req.body || {}
    const name = String(b.name || '').trim()
    const email = String(b.email || '').toLowerCase().trim()
    const password = String(b.password || '')
    const phone = String(b.phone || '').trim()
    const goal = String(b.goal || '').trim()
    const consent = b.consent === true || b.consent === 'true' || b.consent === 1
    if (!name) throw new ApiError(400, 'Informe seu nome.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Informe um e-mail válido.')
    if (password.length < 8) throw new ApiError(400, 'A senha deve ter ao menos 8 caracteres.')
    if (!consent) throw new ApiError(400, 'É necessário aceitar a política de privacidade.')
    const exists = await User.findOne({ email })
    if (exists) throw new ApiError(409, 'Já existe uma conta com este e-mail.')
    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      role: 'patient',
      phone,
      goal,
    })
    const token = signToken(user)
    res.status(201).json({ token, user })
  }),
)

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Informe um e-mail válido.')
    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires')
    let resetToken = null
    if (user) {
      resetToken = crypto.randomBytes(32).toString('hex')
      const hashed = crypto.createHash('sha256').update(resetToken).digest('hex')
      user.passwordResetToken = hashed
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1h
      await user.save()
    }
    // Em produção, envie resetToken por e-mail. Aqui retornamos para facilitar o teste.
    res.json({ ok: true, resetToken, message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.' })
  }),
)

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').toLowerCase().trim()
    const token = String(req.body?.token || '')
    const newPassword = String(req.body?.newPassword || '')
    if (!token || !newPassword) throw new ApiError(400, 'Token e nova senha são obrigatórios.')
    if (newPassword.length < 8) throw new ApiError(400, 'A senha deve ter ao menos 8 caracteres.')
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      email,
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordHash +passwordResetToken +passwordResetExpires')
    if (!user) throw new ApiError(400, 'Token inválido ou expirado.')
    user.passwordHash = await User.hashPassword(newPassword)
    user.passwordResetToken = ''
    user.passwordResetExpires = null
    await user.save()
    res.json({ ok: true, message: 'Senha redefinida com sucesso.' })
  }),
)

export default router