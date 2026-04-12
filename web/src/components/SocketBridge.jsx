import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket, disconnectSocket } from '../services/socket.js';
import { getStoredTokens } from '../services/http.js';

/** Keeps Socket.IO connected when a JWT session exists (realtime shipment events). */
export function SocketBridge() {
  const { user } = useAuth();

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (user && accessToken) {
      connectSocket(accessToken);
      return () => disconnectSocket();
    }
    disconnectSocket();
  }, [user]);

  return null;
}
