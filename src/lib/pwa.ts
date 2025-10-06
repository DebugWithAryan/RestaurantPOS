// PWA utilities for RestaurantSaaS

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  }
};

export const isOnline = () => navigator.onLine;

export const isInstallable = () => {
  // Check if the app can be installed
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const installPWA = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      return true;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }
  return false;
};

export const getCacheSize = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
    };
  }
  return { used: 0, available: 0 };
};

export const clearCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
};

export const precacheAssets = async (assets: string[]) => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'PRECACHE',
          assets,
        });
      }
    } catch (error) {
      console.error('Precaching failed:', error);
    }
  }
};

export const syncOfflineData = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Background sync is not widely supported yet, so we'll use a different approach
      if ('sync' in registration) {
        await (registration as any).sync.register('cart-sync');
        await (registration as any).sync.register('order-sync');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

// PWA install prompt handling
export class PWAInstallPrompt {
  private deferredPrompt: any = null;
  private isInstallable = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
      this.showInstallButton();
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.isInstallable = false;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA is already installed');
      this.isInstallable = false;
    }
  }

  private showInstallButton() {
    // Show install button in UI
    const installButton = document.getElementById('install-pwa-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
  }

  private hideInstallButton() {
    // Hide install button in UI
    const installButton = document.getElementById('install-pwa-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  public async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      this.deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  public canInstall() {
    return this.isInstallable;
  }
}

// Initialize PWA features
export const initPWA = () => {
  // Register service worker
  registerServiceWorker();
  
  // Initialize install prompt
  new PWAInstallPrompt();
  
  // Request notification permission
  requestNotificationPermission();
  
  // Register for background sync
  syncOfflineData();
};

// Cache management utilities
export const cacheMenuData = async (menuData: any) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('menu-cache-v1');
      await cache.put('/api/menu/cached', new Response(JSON.stringify(menuData)));
    } catch (error) {
      console.error('Failed to cache menu data:', error);
    }
  }
};

export const getCachedMenuData = async () => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('menu-cache-v1');
      const response = await cache.match('/api/menu/cached');
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get cached menu data:', error);
    }
  }
  return null;
};

// Offline indicator
export const createOfflineIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f59e0b;
    color: white;
    text-align: center;
    padding: 8px;
    font-size: 14px;
    z-index: 9999;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  `;
  indicator.textContent = 'You are offline. Changes will sync when connection is restored.';
  
  document.body.appendChild(indicator);
  
  const updateIndicator = () => {
    if (navigator.onLine) {
      indicator.style.transform = 'translateY(-100%)';
    } else {
      indicator.style.transform = 'translateY(0)';
    }
  };
  
  window.addEventListener('online', updateIndicator);
  window.addEventListener('offline', updateIndicator);
  
  return indicator;
};

// Export all utilities
export default {
  registerServiceWorker,
  requestNotificationPermission,
  showNotification,
  isOnline,
  isInstallable,
  installPWA,
  getCacheSize,
  clearCache,
  precacheAssets,
  syncOfflineData,
  initPWA,
  cacheMenuData,
  getCachedMenuData,
  createOfflineIndicator,
  PWAInstallPrompt,
};
