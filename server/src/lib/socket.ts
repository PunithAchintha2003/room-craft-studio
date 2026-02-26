import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt.util';
import { IUserPayload } from '../types/user.types';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.CLIENT_ORIGIN, env.ADMIN_ORIGIN, env.DESIGNER_ORIGIN],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string }).token ||
      (socket.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded: IUserPayload = verifyAccessToken(token);
      (socket as Socket & { user: IUserPayload }).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as Socket & { user: IUserPayload }).user;
    const room = `user:${user.id}`;

    socket.join(room);
    console.log(`🔔 Socket connected: user=${user.id} socket=${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: user=${user.id} reason=${reason}`);
    });
  });

  console.log('✅ Socket.io server initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  try {
    getIO().to(`user:${userId}`).emit(event, data);
  } catch (err) {
    console.error(`Failed to emit "${event}" to user ${userId}:`, err);
  }
};
