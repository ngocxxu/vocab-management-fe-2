'use client';

import type { Socket } from 'socket.io-client';
import type { TUser } from '@/types/auth';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { verifyUser } from '@/actions';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

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
  const [user, setUser] = useState<TUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await verifyUser();
        setUser(userData);
      } catch (error) {
        logger.error('Failed to verify user:', { error });
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!Env.NEXT_PUBLIC_SOCKET_URL) {
      logger.warn('Socket URL not configured. WebSocket notifications will be disabled.');
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

    socketInstance.on('connect', () => {
      logger.debug('Connected to notification socket');
      setIsConnected(true);

      if (userId) {
        logger.debug('Joining user room:', { userId });
        socketInstance.emit('join-user-room', { userId });
      }
    });

    socketInstance.on('joined-user-room', (data) => {
      logger.debug('Joined user room:', { data });
    });

    socketInstance.on('disconnect', () => {
      logger.debug('Disconnected from notification socket');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      setIsConnected(false);

      const hasMeaningfulValue = (value: unknown): boolean => {
        if (!value) {
          return false;
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        if (typeof value === 'object') {
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return Object.keys(value).length > 0;
        }
        return true;
      };

      const errorDetails: string[] = [];

      if (error instanceof Error) {
        errorDetails.push(`message: ${error.message}`);
      } else if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>;

        if (errorObj.message && hasMeaningfulValue(errorObj.message)) {
          const msg = String(errorObj.message);
          if (msg !== 'websocket error') {
            errorDetails.push(`message: ${msg}`);
          }
        }

        if (errorObj.type && hasMeaningfulValue(errorObj.type)) {
          errorDetails.push(`type: ${errorObj.type}`);
        }

        if (errorObj.description && hasMeaningfulValue(errorObj.description)) {
          errorDetails.push(`description: ${JSON.stringify(errorObj.description)}`);
        }

        if (errorObj.context && hasMeaningfulValue(errorObj.context)) {
          errorDetails.push(`context: ${JSON.stringify(errorObj.context)}`);
        }
      }

      if (errorDetails.length > 0) {
        logger.error('Socket connection error:', { details: errorDetails.join(', ') });
      } else {
        logger.error('Socket connection error:', { error });
      }
    });

    socketInstance.on('notification', (data) => {
      logger.debug('Received notification:', { data });
    });

    socketInstance.on('connected', (data) => {
      logger.debug('Socket connected:', { data });
    });

    socketInstance.on('reconnect_error', (error) => {
      logger.error('Socket reconnection error:', { error });
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      logger.debug('Socket reconnection attempt:', { attemptNumber });
    });

    socketInstance.on('reconnect_failed', () => {
      logger.error('Socket reconnection failed after all attempts');
      setIsConnected(false);
    });

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
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
// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): SocketContextType => {
  const context = React.use(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
