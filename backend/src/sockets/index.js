import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      socket.user = null;
      return next();
    }
    try {
      const decoded = jwt.verify(token, env.jwtAccessSecret);
      if (decoded.type !== 'access') throw new Error('bad type');
      socket.user = { id: decoded.sub, role: decoded.role };
    } catch {
      socket.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    socket.emit('connected', { userId: socket.user?.id ?? null });
  });

  return io;
}
