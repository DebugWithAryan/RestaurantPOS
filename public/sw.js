// RestaurantSaaS Service Worker
const CACHE_NAME = 'restaurant-saas-v1';
const STATIC_CACHE_NAME = 'restaurant-saas-static-v1';
const DYNAMIC_CACHE_NAME = 'restaurant-saas-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/scan',
  '/menu',
  '/cart',
  '/payment',
  '/feedback',
  '/auth/login',
  '/auth/register',
  '/admin/dashboard',
  '/manifest.json',
  '/offline.html'
];

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/menu/',
  '/api/scan/validate',
  '/api/session/',
  '/api/orders/',
  '/api/payments/'
];

// Cache TTL settings
const CACHE_TTL = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  DYNAMIC: 30 * 60 * 1000, // 30 minutes
  API: 10 * 60 * 1000, // 10 minutes
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiRequest(url.pathname)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'You are offline. Data will sync when connection is restored.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Stale-while-revalidate strategy for pages
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // If network fails and we have cached response, return it
    if (cachedResponse) {
      return cachedResponse;
    }
    // Otherwise, return offline page
    return caches.match('/offline.html');
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isApiRequest(pathname) {
  return API_ROUTES.some(route => pathname.startsWith(route));
}

function isPageRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData());
  }
});

// Sync cart data when online
async function syncCartData() {
  try {
    const cartData = await getStoredCartData();
    if (cartData) {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData)
      });
      
      if (response.ok) {
        console.log('Cart data synced successfully');
        await clearStoredCartData();
      }
    }
  } catch (error) {
    console.error('Failed to sync cart data:', error);
  }
}

// Sync order data when online
async function syncOrderData() {
  try {
    const orderData = await getStoredOrderData();
    if (orderData) {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        console.log('Order data synced successfully');
        await clearStoredOrderData();
      }
    }
  } catch (error) {
    console.error('Failed to sync order data:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredCartData() {
  // Implementation would use IndexedDB to get cart data
  return null;
}

async function clearStoredCartData() {
  // Implementation would clear cart data from IndexedDB
}

async function getStoredOrderData() {
  // Implementation would use IndexedDB to get order data
  return null;
}

async function clearStoredOrderData() {
  // Implementation would clear order data from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'New order received!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Order',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('RestaurantSaaS', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(performPeriodicSync());
  }
});

async function performPeriodicSync() {
  try {
    // Sync menu data, pricing, etc.
    const response = await fetch('/api/sync/content');
    if (response.ok) {
      console.log('Periodic sync completed successfully');
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

console.log('Service Worker: Loaded successfully');
