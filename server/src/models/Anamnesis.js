import mongoose from 'mongoose'

const anamnesisSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    allergies: { type: String, default: '' },
    diseases: { type: String, default: '' },
    medications: { type: String, default: '' },
    dietaryRestrictions: { type: String, default: '' },
    eatingHabits: { type: String, default: '' },
    physicalActivity: { type: String, default: '' },
    sleep: { type: String, default: '' },
    waterIntake: { type: String, default: '' },
    preferences: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('Anamnesis', anamnesisSchema)