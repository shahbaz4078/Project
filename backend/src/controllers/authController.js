import crypto from 'crypto';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { signAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

function refreshExpiryDate() {
  const match = String(env.jwtRefreshExpires).match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const n = Number(match[1]);
  const u = match[2];
  const mult = u === 'd' ? 86400000 : u === 'h' ? 3600000 : u === 'm' ? 60000 : 1000;
  return new Date(Date.now() + n * mult);
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export async function register(req, res, next) {
  try {
    const { password, name, orgId, role } = req.validatedBody;
    const email = normalizeEmail(req.validatedBody.email);
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 409);

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name: name || '',
      role: role || 'farmer',
      orgId: orgId || '',
    });

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const rawRefresh = crypto.randomBytes(48).toString('hex');
    const jti = crypto.randomUUID();
    await RefreshToken.create({
      userId: user._id,
      tokenHash: RefreshToken.hashToken(rawRefresh),
      expiresAt: refreshExpiryDate(),
      jti,
    });

    res.status(201).json({
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { password } = req.validatedBody;
    const email = normalizeEmail(req.validatedBody.email);
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const rawRefresh = crypto.randomBytes(48).toString('hex');
    const jti = crypto.randomUUID();
    await RefreshToken.create({
      userId: user._id,
      tokenHash: RefreshToken.hashToken(rawRefresh),
      expiresAt: refreshExpiryDate(),
      jti,
    });

    res.json({
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken: raw } = req.validatedBody;
    const tokenHash = RefreshToken.hashToken(raw);
    const doc = await RefreshToken.findOne({ tokenHash });
    if (!doc || doc.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(doc.userId);
    if (!user) throw new AppError('User not found', 401);

    await RefreshToken.deleteOne({ _id: doc._id });

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const rawRefresh = crypto.randomBytes(48).toString('hex');
    const jti = crypto.randomUUID();
    await RefreshToken.create({
      userId: user._id,
      tokenHash: RefreshToken.hashToken(rawRefresh),
      expiresAt: refreshExpiryDate(),
      jti,
    });

    res.json({
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken: raw } = req.validatedBody;
    if (raw) {
      const tokenHash = RefreshToken.hashToken(raw);
      await RefreshToken.deleteOne({ tokenHash });
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
