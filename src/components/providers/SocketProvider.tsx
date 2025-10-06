'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { socketManager } from '@/lib/socket';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emit: () => {},
  on: () => {},
  off: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const newSocket = socketManager.connect(
      (session.user as any).restaurantId || 'demo-restaurant',
      (session.user as any).id || 'demo-user'
    );

    setSocket(newSocket);

    // Set up event listeners
    socketManager.onOrderUpdate((data) => {
      toast.success(`Order ${data.orderId} is now ${data.status}`);
    });

    socketManager.onCartUpdate((data) => {
      console.log('Cart updated:', data);
    });

    socketManager.onSessionUpdate((data) => {
      console.log('Session updated:', data);
    });

    socketManager.onPaymentUpdate((data) => {
      if (data.status === 'success') {
        toast.success('Payment successful!');
      } else if (data.status === 'failed') {
        toast.error('Payment failed. Please try again.');
      }
    });

    // Update connection status
    setIsConnected(socketManager.isSocketConnected() || false);

    return () => {
      socketManager.disconnect();
    };
  }, [session]);

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
