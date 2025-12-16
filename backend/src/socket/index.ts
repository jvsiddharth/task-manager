import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

const userSockets = new Map<string, string>();

export function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: 'https://task-manager-alpha-rose.vercel.app',
            credentials: true
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return { io, userSockets };
}

