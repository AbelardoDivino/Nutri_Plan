import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import User from '../models/User.js'
import DietPlan from '../models/DietPlan.js'
import WorkoutPlan from '../models/WorkoutPlan.js'
import Lead from '../models/Lead.js'
import Message from '../models/Message.js'
import ProgressLog from '../models/ProgressLog.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/dashboard', requireAdmin, asyncHandler(async (req, res) => {
  const [
    totalPatients,
    activePatients,
    activeDiets,
    activeWorkouts,
    newLeads,
    unreadMessages,
    recentPatients,
    recentLeads,
    patientsWithoutDiet,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'patient', active: true }),
    DietPlan.countDocuments({ active: true }),
    WorkoutPlan.countDocuments({ active: true }),
    Lead.countDocuments({ status: 'novo' }),
    Message.countDocuments({ senderRole: 'patient', readByAdmin: false }),
    User.find({ role: 'patient' }).sort({ createdAt: -1 }).limit(6),
    Lead.find().sort({ createdAt: -1 }).limit(6),
    (async () => {
      const patients = await User.find({ role: 'patient', active: true }).select('name')
      const withDiet = await DietPlan.distinct('patient', { active: true })
      const set = new Set(withDiet.map(String))
      return patients.filter((p) => !set.has(String(p._id))).map((p) => ({ id: p._id, name: p.name }))
    })(),
  ])
  // recent weight changes
  const recentProgress = await ProgressLog.find().sort({ createdAt: -1 }).limit(5).populate('patient', 'name')
  res.json({
    stats: {
      totalPatients,
      activePatients,
      activeDiets,
      activeWorkouts,
      newLeads,
      unreadMessages,
    },
    recentPatients,
    recentLeads,
    patientsWithoutDiet,
    recentProgress,
  })
}))

export default router