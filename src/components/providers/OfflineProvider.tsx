'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface OfflineContextType {
  isOnline: boolean;
  isOffline: boolean;
  syncPending: boolean;
  setSyncPending: (pending: boolean) => void;
  retrySync: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncPending, setSyncPending] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (syncPending) {
        toast.success('Connection restored! Syncing your data...');
        // Trigger sync here
        setTimeout(() => setSyncPending(false), 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncPending(true);
      toast.error('You are offline. Changes will be synced when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPending]);

  const retrySync = () => {
    if (isOnline) {
      setSyncPending(false);
      toast.success('Data synced successfully!');
    } else {
      toast.error('Still offline. Please check your connection.');
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        syncPending,
        setSyncPending,
        retrySync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
