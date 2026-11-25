import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutriplan'
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  })
  console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`)
}