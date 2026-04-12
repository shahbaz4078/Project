import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config.js';

let socket;

export function getSocket() {
  return socket;
}

export function connectSocket(accessToken) {
  disconnectSocket();
  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: accessToken ? { token: accessToken } : {},
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
