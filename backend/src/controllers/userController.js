import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('Not found', 404);
    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    });
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('email name role orgId createdAt').limit(200);
    res.json(users);
  } catch (e) {
    next(e);
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, password, name, role, orgId } = req.validatedBody;
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 409);
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name: name || '', role, orgId: orgId || '' });
    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    });
  } catch (e) {
    next(e);
  }
}
