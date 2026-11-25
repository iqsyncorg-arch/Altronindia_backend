import mongoose, { Schema } from 'mongoose'

export type UserDocument = {
  email: string
  passwordHash: string
  role: 'admin' | 'editor'
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  },
  { timestamps: true }
)

export const User = mongoose.model<UserDocument>('User', userSchema)
