'use client';

import type { Socket } from 'socket.io-client';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
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

  // Extract userId to stable reference
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Check if socket URL is configured
    if (!Env.NEXT_PUBLIC_SOCKET_URL) {
      console.warn('🔌 Socket URL not configured. WebSocket notifications will be disabled.');
      return;
    }

    // Create socket connection to notification namespace
    const socketInstance = io(`${Env.NEXT_PUBLIC_SOCKET_URL}/notification`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.warn('🔌 Connected to notification socket');
      setIsConnected(true);

      if (userId) {
        console.warn('🔌 Joining user room:', userId);
        socketInstance.emit('join-user-room', { userId });
      }
    });

    socketInstance.on('joined-user-room', (data) => {
      console.warn('🔌 Joined user room:', data);
    });

    socketInstance.on('disconnect', () => {
      console.warn('🔌 Disconnected from notification socket');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);

      const errorMessage = error instanceof Error ? error.message : (error as any)?.message || String(error);
      if (errorMessage && errorMessage !== 'websocket error') {
        console.error('🔌 Error message:', errorMessage);
      }

      if (error && typeof error === 'object') {
        if ('description' in error && error.description) {
          console.error('🔌 Error description:', error.description);
        }
        if ('context' in error && error.context) {
          console.error('🔌 Error context:', error.context);
        }
        if ('type' in error && error.type) {
          console.error('🔌 Error type:', error.type);
        }
      }
    });

    // Listen for notification events
    socketInstance.on('notification', (data) => {
      console.warn('🔔 Received notification:', data);

      // Notifications will be refreshed via their own hooks/components
    });

    // Listen for connection confirmation
    socketInstance.on('connected', (data) => {
      console.warn('🔌 Socket connected:', data);
    });

    // Handle reconnection errors
    socketInstance.on('reconnect_error', (error) => {
      console.error('🔌 Socket reconnection error:', error);
    });

    // Handle reconnection attempts
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.warn(`🔌 Socket reconnection attempt ${attemptNumber}`);
    });

    // Handle failed reconnection
    socketInstance.on('reconnect_failed', () => {
      console.error('🔌 Socket reconnection failed after all attempts');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]); // Use stable userId instead of user?.id

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
