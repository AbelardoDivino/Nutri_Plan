import { Router } from 'express'
import { ApiError, asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import DietPlan from '../models/DietPlan.js'
import { computeTotals } from '../models/DietPlan.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const getPatient = async (id) => {
  const p = await User.findOne({ _id: id, role: 'patient' })
  if (!p) throw new ApiError(404, 'Paciente não encontrado.')
  return p
}

// admin: list/create for patient
router.get('/patients/:id/diets', requireAdmin, asyncHandler(async (req, res) => {
  await getPatient(req.params.id)
  const diets = await DietPlan.find({ patient: req.params.id }).sort({ createdAt: -1 })
  res.json({ diets })
}))

router.post('/patients/:id/diets', requireAdmin, asyncHandler(async (req, res) => {
  await getPatient(req.params.id)
  const b = req.body || {}
  if (!b.title) throw new ApiError(400, 'Título da dieta é obrigatório.')
  if (b.active !== false) {
    await DietPlan.updateMany({ patient: req.params.id, active: true }, { $set: { active: false } })
  }
  const diet = await DietPlan.create({
    patient: req.params.id,
    title: String(b.title).trim(),
    objective: b.objective || '',
    notes: b.notes || '',
    startDate: b.startDate ? new Date(b.startDate) : null,
    endDate: b.endDate ? new Date(b.endDate) : null,
    targetCalories: Number(b.targetCalories) || 0,
    targetProtein: Number(b.targetProtein) || 0,
    targetCarbs: Number(b.targetCarbs) || 0,
    targetFat: Number(b.targetFat) || 0,
    targetWater: Number(b.targetWater) || 2000,
    active: b.active !== false,
    meals: Array.isArray(b.meals) ? b.meals : [],
    createdBy: req.user._id,
  })
  res.status(201).json({ diet })
}))

router.put('/diets/:id', requireAdmin, asyncHandler(async (req, res) => {
  const diet = await DietPlan.findById(req.params.id)
  if (!diet) throw new ApiError(404, 'Dieta não encontrada.')
  const b = req.body || {}
  if (b.title !== undefined) diet.title = String(b.title).trim()
  if (b.objective !== undefined) diet.objective = String(b.objective)
  if (b.notes !== undefined) diet.notes = String(b.notes)
  if (b.startDate !== undefined) diet.startDate = b.startDate ? new Date(b.startDate) : null
  if (b.endDate !== undefined) diet.endDate = b.endDate ? new Date(b.endDate) : null
  if (b.targetCalories !== undefined) diet.targetCalories = Number(b.targetCalories) || 0
  if (b.targetProtein !== undefined) diet.targetProtein = Number(b.targetProtein) || 0
  if (b.targetCarbs !== undefined) diet.targetCarbs = Number(b.targetCarbs) || 0
  if (b.targetFat !== undefined) diet.targetFat = Number(b.targetFat) || 0
  if (b.targetWater !== undefined) diet.targetWater = Number(b.targetWater) || 0
  if (b.meals !== undefined) diet.meals = b.meals
  if (b.active === true && !diet.active) {
    await DietPlan.updateMany({ patient: diet.patient, _id: { $ne: diet._id }, active: true }, { $set: { active: false } })
    diet.active = true
  }
  if (b.active === false) diet.active = false
  await diet.save()
  res.json({ diet })
}))

router.delete('/diets/:id', requireAdmin, asyncHandler(async (req, res) => {
  const diet = await DietPlan.findById(req.params.id)
  if (!diet) throw new ApiError(404, 'Dieta não encontrada.')
  await diet.deleteOne()
  res.json({ ok: true })
}))

router.patch('/diets/:id/activate', requireAdmin, asyncHandler(async (req, res) => {
  const diet = await DietPlan.findById(req.params.id)
  if (!diet) throw new ApiError(404, 'Dieta não encontrada.')
  await DietPlan.updateMany({ patient: diet.patient, _id: { $ne: diet._id } }, { $set: { active: false } })
  diet.active = true
  await diet.save()
  res.json({ diet })
}))

// patient: active diet
router.get('/my/diet', asyncHandler(async (req, res) => {
  const diet = await DietPlan.findOne({ patient: req.user._id, active: true }).sort({ createdAt: -1 })
  res.json({ diet })
}))

export { computeTotals }
export default router