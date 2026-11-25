import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, select: false },
    googleId: { type: String, default: '', index: true, sparse: true },
    passwordResetToken: { type: String, default: '', select: false },
    passwordResetExpires: { type: Date, default: null },
    role: { type: String, enum: ['admin', 'patient'], default: 'patient' },
    phone: { type: String, default: '' },
    birthDate: { type: Date, default: null },
    gender: { type: String, enum: ['feminino', 'masculino', 'outro', ''], default: '' },
    height: { type: Number, default: null },
    startWeight: { type: Number, default: null },
    goal: { type: String, default: '' },
    activityLevel: { type: String, default: '' },
    notes: { type: String, default: '' },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash
    return ret
  },
})

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10)
}

export default mongoose.model('User', userSchema)