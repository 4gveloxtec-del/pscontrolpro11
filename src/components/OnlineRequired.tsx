import { useState, useEffect, ReactNode } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnlineRequiredProps {
  children: ReactNode;
}

/**
 * OnlineRequired - Graceful offline handling
 * 
 * This component shows a NON-BLOCKING notification when offline.
 * The app continues to be usable (with limited functionality).
 * This ensures the site works as a normal website first.
 */
export function OnlineRequired({ children }: OnlineRequiredProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Always render children - site works even offline (with limited functionality)
  return (
    <>
      {children}
      
      {/* Non-blocking offline banner */}
      {!isOnline && !dismissed && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
          <div className="bg-destructive/95 backdrop-blur-sm text-destructive-foreground p-4 rounded-lg shadow-lg border border-destructive/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive-foreground/10 flex items-center justify-center flex-shrink-0">
                <WifiOff className="h-5 w-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Sem conexão</p>
                <p className="text-xs opacity-90 mt-0.5">
                  Algumas funcionalidades podem não funcionar.
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => setDismissed(true)}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 hover:bg-destructive-foreground/10"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
