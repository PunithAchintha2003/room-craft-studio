import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { addNotification } from '@/features/notifications/notificationSlice';
import { NotificationItem } from '@/services/notifications.api';

const WS_URL = (import.meta as { env: Record<string, string> }).env['VITE_SOCKET_URL'] ||
  (import.meta as { env: Record<string, string> }).env['VITE_WS_URL'] ||
  (import.meta as { env: Record<string, string> }).env['VITE_API_URL']?.replace('/api', '') ||
  'http://localhost:5001';

const toastIconMap: Record<NotificationItem['type'], string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export const useNotificationSocket = (isAuthenticated: boolean): void => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token =
      Cookies.get('accessToken') || sessionStorage.getItem('accessToken');

    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔔 Notification socket connected');
    });

    socket.on('notification', (payload: NotificationItem) => {
      dispatch(addNotification(payload));
      toast(payload.title, {
        icon: toastIconMap[payload.type] ?? 'ℹ️',
        duration: 5000,
        style: {
          borderRadius: '10px',
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.875rem',
        },
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, dispatch]);
};
