import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    goal: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['novo', 'contatado', 'cliente', 'descartado'], default: 'novo' },
    notes: { type: String, default: '' },
    consent: { type: Boolean, default: false },
    consentedAt: { type: Date, default: null },
    convertedPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
)

export default mongoose.model('Lead', leadSchema)