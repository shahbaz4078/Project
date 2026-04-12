import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(
    { sub: payload.sub, role: payload.role, type: 'access' },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpires }
  );
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, env.jwtAccessSecret);
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}
