/* Service Worker for Web Push Notifications */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: event.data.text(), body: '' };
  }

  const { title, body, type, link, notificationId } = payload;

  const iconMap = {
    success: '/icons/notification-success.png',
    error: '/icons/notification-error.png',
    warning: '/icons/notification-warning.png',
    info: '/icons/notification-info.png',
  };

  const options = {
    body: body || '',
    icon: iconMap[type] || '/favicon.ico',
    badge: '/favicon.ico',
    tag: notificationId || 'roomcraft-notification',
    renotify: true,
    requireInteraction: type === 'error' || type === 'warning',
    data: { link, notificationId },
    actions: link
      ? [{ action: 'open', title: 'View' }, { action: 'dismiss', title: 'Dismiss' }]
      : [{ action: 'dismiss', title: 'Dismiss' }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const link = event.notification.data?.link;
  const targetUrl = link || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NOTIFICATION_CLICK', link: targetUrl });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
