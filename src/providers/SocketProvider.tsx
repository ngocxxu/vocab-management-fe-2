'use client';

import type { Socket } from 'socket.io-client';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { mutate } from 'swr';
import { useAuth } from '@/hooks/useAuth';
import { Env } from '@/libs/Env';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Create socket connection to notification namespace
    const socketInstance = io(`${Env.NEXT_PUBLIC_SOCKET_URL}/notification`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.warn('🔌 Connected to notification socket');
      setIsConnected(true);

      // The backend will handle user-specific notifications based on authentication
      // No need to explicitly join a room since the backend can identify users
    });

    socketInstance.on('disconnect', () => {
      console.warn('🔌 Disconnected from notification socket');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for notification events
    socketInstance.on('notification', (data) => {
      console.warn('🔔 Received notification:', data);

      // Trigger SWR revalidation for notifications
      mutate('notifications');
      mutate('unread-notifications');
      mutate('unread-count');
    });

    // Listen for connection confirmation
    socketInstance.on('connected', (data) => {
      console.warn('🔌 Socket connected:', data);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.id]);

  const contextValue = useMemo(() => ({
    socket,
    isConnected,
  }), [socket, isConnected]);

  return (
    <SocketContext value={contextValue}>
      {children}
    </SocketContext>
  );
};

// Hook to access socket context
export const useSocket = (): SocketContextType => {
  const context = React.use(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
