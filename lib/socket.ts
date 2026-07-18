import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const BACKEND_URL = 'https://shik-shak-webapp-api.onrender.com'; 

export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      path: '/socket.io/',
      transports: ['websocket'],
      withCredentials: true,
      
      // 🚨 THE MAGIC FIX: Spoof the origin header!
      // Replace this URL with your EXACT Vercel WebApp URL
      extraHeaders: {
        "Origin": "https://shik-shak-ui.vercel.app" 
      },
      
      autoConnect: true,
      forceNew: true,
    });
    
    socket.on('connect', () => console.log('✅ Socket Connected! ID:', socket?.id));
    socket.on('connect_error', (err) => console.log('❌ Socket Error:', err.message));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();       // Restored from your original code
    socket = null;
  }
};

export function isSocketConnected(): boolean {
  return socket !== null && socket.connected;
}