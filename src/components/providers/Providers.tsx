'use client';

import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from './SocketProvider';
import { CartProvider } from './CartProvider';
import { ThemeProvider } from './ThemeProvider';
import { OfflineProvider } from './OfflineProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <OfflineProvider>
          <SocketProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SocketProvider>
        </OfflineProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
