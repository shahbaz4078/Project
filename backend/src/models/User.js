import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['farmer', 'processor', 'retailer', 'consumer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, trim: true, default: '' },
    role: { type: String, enum: ROLES, default: 'farmer', index: true },
    orgId: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
};

export const User = mongoose.model('User', userSchema);
