// Service Worker Admin - Minimal Online Mode
// This SW only handles push notifications - NO CACHING, NO BLOCKING
// Website works normally without PWA installation

const SW_VERSION = 'admin-web-first-v1';

// Install event - clear all caches, don't block
self.addEventListener('install', (event) => {
  console.log('[SW-Admin] Installing minimal service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW-Admin] Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      ))
      .then(() => console.log('[SW-Admin] All caches cleared'))
      .catch((err) => console.log('[SW-Admin] Cache clear error:', err))
  );
  
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW-Admin] Activating...');
  
  event.waitUntil(
    Promise.all([
      caches.keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .catch(() => {}),
      self.clients.claim()
    ])
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data = {
    title: 'PSControl Admin',
    body: 'Você tem uma nova notificação',
    icon: '/admin-icon-192.png',
    badge: '/admin-icon-192.png',
    data: { url: '/admin/dashboard' }
  };

  try {
    const payload = event.data.json();
    data = {
      title: payload.title || data.title,
      body: payload.body || data.body,
      icon: payload.icon || data.icon,
      badge: payload.badge || data.badge,
      data: payload.data || data.data
    };
  } catch (e) {
    console.log('[SW-Admin] Push parse error:', e);
    return;
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: data.data,
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).catch(() => {})
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/admin/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
      .catch(() => {})
  );
});

// Fetch event - NEVER intercept
self.addEventListener('fetch', () => {
  return;
});

// Message handling
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHES') {
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .catch(() => {});
  }
  
  if (event.data.type === 'UNREGISTER') {
    self.registration.unregister().catch(() => {});
  }
});
