import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['admin', 'patient'], required: true },
    text: { type: String, required: true, trim: true },
    readByAdmin: { type: Boolean, default: false },
    readByPatient: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('Message', messageSchema)