import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * usePWA - Optional PWA functionality
 * 
 * This hook provides PWA install capabilities as an OPTIONAL feature.
 * The website works perfectly without installing as PWA.
 * Service worker registration is non-blocking and graceful.
 */
export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Service worker registration is optional and non-blocking
    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) return;
      
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          // Don't block page load
          updateViaCache: 'none'
        });
        
        setRegistration(reg);
        
        // Non-blocking update check
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      } catch (error) {
        // SW registration failed - site continues to work normally
        console.log('[PWA] Service worker registration skipped:', error);
      }
    };

    // Register SW after page load to not block initial render
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;
    
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  };

  const checkForUpdates = useCallback(async () => {
    if (registration) {
      await registration.update();
    }
  }, [registration]);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  // Unregister service worker completely (if user wants to disable PWA features)
  const unregisterSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      // Clear any remaining caches
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
      return true;
    }
    return false;
  }, []);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isIOS,
    install,
    updateAvailable,
    checkForUpdates,
    applyUpdate,
    unregisterSW,
  };
}
