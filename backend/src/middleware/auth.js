import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401);
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (e) {
    next(new AppError(e.message === 'jwt expired' ? 'Token expired' : 'Unauthorized', 401));
  }
}
