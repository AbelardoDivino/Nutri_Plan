import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: '10-12' },
    load: { type: String, default: '' },
    rest: { type: String, default: '60s' },
    notes: { type: String, default: '' },
  },
  { _id: true },
)

const daySchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Treino A' },
    focus: { type: String, default: '' },
    notes: { type: String, default: '' },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { _id: true },
)

const workoutSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    objective: { type: String, default: '' },
    level: { type: String, default: 'Iniciante' },
    notes: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true },
    days: { type: [daySchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export default mongoose.model('WorkoutPlan', workoutSchema)