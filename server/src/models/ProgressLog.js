import mongoose from 'mongoose'

const progressSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    weight: { type: Number, default: null },
    bodyFat: { type: Number, default: null },
    waist: { type: Number, default: null },
    chest: { type: Number, default: null },
    hip: { type: Number, default: null },
    arm: { type: Number, default: null },
    notes: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

progressSchema.index({ patient: 1, date: 1 })

export default mongoose.model('ProgressLog', progressSchema)