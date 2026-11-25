import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/asyncHandler.js'
import User from '../models/User.js'

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id || user.id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new ApiError(401, 'Token ausente. Faça login novamente.')
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) throw new ApiError(401, 'Usuário não encontrado.')
    if (!user.active) throw new ApiError(403, 'Conta desativada.')
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Sessão expirada. Faça login novamente.'))
    } else {
      next(err)
    }
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Apenas nutricionistas podem acessar este recurso.'))
  next()
}

export const requireSelfOrAdmin = (param = 'id') => (req, res, next) => {
  if (req.user.role === 'admin') return next()
  if (String(req.user._id) === String(req.params[param])) return next()
  next(new ApiError(403, 'Acesso negado.'))
}