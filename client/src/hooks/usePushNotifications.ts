import { useEffect, useRef } from 'react';
import { savePushSubscription, removePushSubscription } from '@/services/notifications.api';

const VAPID_PUBLIC_KEY =
  (import.meta as { env: Record<string, string> }).env['VITE_VAPID_PUBLIC_KEY'] || '';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const usePushNotifications = (isAuthenticated: boolean): void => {
  const subscriptionRef = useRef<PushSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !VAPID_PUBLIC_KEY) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let active = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          subscriptionRef.current = existing;
          if (active) await savePushSubscription(existing);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        subscriptionRef.current = subscription;
        if (active) await savePushSubscription(subscription);
      } catch (err) {
        console.warn('Push notification setup failed:', err);
      }
    };

    void register();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;

    const unsubscribe = async () => {
      if (!subscriptionRef.current) return;
      try {
        await removePushSubscription(subscriptionRef.current.endpoint);
        await subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      } catch (err) {
        console.warn('Failed to unsubscribe push:', err);
      }
    };

    void unsubscribe();
  }, [isAuthenticated]);
};
