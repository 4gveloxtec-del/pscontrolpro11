// Service Worker - Minimal Online Mode
// This SW only handles push notifications - NO CACHING, NO BLOCKING
// Website works normally without PWA installation

const SW_VERSION = 'web-first-v1';

// Install event - clear all caches, don't block
self.addEventListener('install', (event) => {
  console.log('[SW] Installing minimal service worker...');
  
  // Clear any existing caches without blocking
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      ))
      .then(() => {
        console.log('[SW] All caches cleared');
      })
      .catch((err) => {
        console.log('[SW] Cache clear error (non-blocking):', err);
      })
  );
  
  // Immediately activate
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating minimal service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clear any remaining caches
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        ))
        .catch(() => {}),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Push notification handling (optional feature)
self.addEventListener('push', (event) => {
  // Don't block if push fails
  if (!event.data) return;
  
  let data = {
    title: 'PSControl',
    body: 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/' }
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
    console.log('[SW] Push parse error:', e);
    return;
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: data.data,
    requireInteraction: false, // Don't force user interaction
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

  const urlToOpen = event.notification.data?.url || '/';

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

// Fetch event - NEVER intercept, always go to network
// This ensures the site behaves like a normal website
self.addEventListener('fetch', () => {
  // Do nothing - let browser handle all requests normally
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
});

// Unregister handler - allows easy removal if needed
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UNREGISTER') {
    self.registration.unregister()
      .then(() => console.log('[SW] Unregistered'))
      .catch(() => {});
  }
});
