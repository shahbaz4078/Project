import mongoose from 'mongoose';
import crypto from 'crypto';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    jti: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.hashToken = function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
