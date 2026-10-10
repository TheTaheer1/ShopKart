import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8088'

export const createOrderSocket = () => io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
})
