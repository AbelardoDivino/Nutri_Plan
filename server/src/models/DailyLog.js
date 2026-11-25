import mongoose from 'mongoose'

const dailyLogSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mealsDone: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    exercisesDone: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    water: { type: Number, default: 0 },
  },
  { timestamps: true },
)

dailyLogSchema.index({ patient: 1, date: 1 }, { unique: true })

export default mongoose.model('DailyLog', dailyLogSchema)