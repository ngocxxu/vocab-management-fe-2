'use client';

import type { TChatContext, TChatState, TConfirmRequest, TMessage, TToolActivity } from '@/types/chat';
import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getChatMessages, getChatUnreadCount, markChatRead } from '@/actions/chat';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

type ChatAction
  = { type: 'TOGGLE_OPEN'; open: boolean }
    | { type: 'MESSAGE_QUEUED'; messageId: string }
    | { type: 'AI_TOOL_USED'; toolActivity: TToolActivity }
    | { type: 'AI_CONFIRM_REQUIRED'; confirmRequest: TConfirmRequest }
    | { type: 'AI_DONE'; message: TMessage }
    | { type: 'AI_ERROR' }
    | { type: 'HISTORY_LOADED'; messages: TMessage[]; nextCursor: string | null }
    | { type: 'HISTORY_FETCHED'; messages: TMessage[]; nextCursor: string | null }
    | { type: 'CONFIRM_CLEARED' }
    | { type: 'UNREAD_COUNT_LOADED'; unreadCount: number }
    | { type: 'UNREAD_CLEARED' };

const initialState: TChatState = {
  isOpen: false,
  messages: [],
  isQueued: false,
  pendingMessageId: null,
  toolActivity: null,
  confirmRequest: null,
  nextCursor: null,
  historyLoaded: false,
  unreadCount: 0,
};

function chatReducer(state: TChatState, action: ChatAction): TChatState {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: action.open };
    case 'MESSAGE_QUEUED':
      return { ...state, isQueued: true, pendingMessageId: action.messageId };
    case 'AI_TOOL_USED':
      return { ...state, toolActivity: action.toolActivity };
    case 'AI_CONFIRM_REQUIRED':
      return { ...state, confirmRequest: action.confirmRequest };
    case 'AI_DONE':
      return {
        ...state,
        isQueued: false,
        pendingMessageId: null,
        toolActivity: null,
        messages: [...state.messages, action.message],
      };
    case 'AI_ERROR':
      return { ...state, isQueued: false, pendingMessageId: null, toolActivity: null };
    case 'HISTORY_LOADED':
      return {
        ...state,
        messages: [...action.messages, ...state.messages],
        nextCursor: action.nextCursor,
      };
    case 'HISTORY_FETCHED':
      return {
        ...state,
        messages: action.messages,
        nextCursor: action.nextCursor,
        historyLoaded: true,
      };
    case 'CONFIRM_CLEARED':
      return { ...state, confirmRequest: null };
    case 'UNREAD_COUNT_LOADED':
      return { ...state, unreadCount: action.unreadCount };
    case 'UNREAD_CLEARED':
      return { ...state, unreadCount: 0 };
    default:
      return state;
  }
}

const ChatContext = createContext<TChatContext | null>(null);

export function ChatProvider({ children, initialUnreadCount = 0 }: { children: React.ReactNode; initialUnreadCount?: number }) {
  const [state, dispatch] = useReducer(chatReducer, { ...initialState, unreadCount: initialUnreadCount });
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const unreadCount = await getChatUnreadCount();
      dispatch({ type: 'UNREAD_COUNT_LOADED', unreadCount });
    } catch (error) {
      logger.warn('Failed to fetch unread count:', { error });
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!Env.NEXT_PUBLIC_SOCKET_URL) {
      logger.warn('Socket URL not configured. AI Chat will be disabled.');
      return;
    }

    const socket = io(`${Env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      logger.debug('Connected to chat socket');
    });

    socket.on('disconnect', () => {
      logger.debug('Disconnected from chat socket');
    });

    socket.on('connect_error', (error) => {
      logger.error('Chat socket connection error:', { error });
    });

    socket.on('message_queued', ({ messageId }: { messageId: string }) => {
      dispatch({ type: 'MESSAGE_QUEUED', messageId });
    });

    socket.on('ai_tool_used', (toolActivity: TToolActivity) => {
      dispatch({ type: 'AI_TOOL_USED', toolActivity });
    });

    socket.on('ai_confirm_required', (confirmRequest: TConfirmRequest) => {
      dispatch({ type: 'AI_CONFIRM_REQUIRED', confirmRequest });
    });

    socket.on('ai_done', ({ content }: { content: string }) => {
      const message: TMessage = {
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        content,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'AI_DONE', message });
      void fetchUnreadCount();
    });

    socket.on('ai_error', ({ message: errMsg, retryable }: { message: string; retryable: boolean; code: string }) => {
      dispatch({ type: 'AI_ERROR' });
      toast.error(errMsg, {
        description: retryable ? 'You can try sending your message again.' : undefined,
      });
    });

    socket.on('history_loaded', ({ messages, nextCursor }: { messages: TMessage[]; nextCursor: string | null }) => {
      dispatch({ type: 'HISTORY_LOADED', messages, nextCursor });
    });

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchUnreadCount]);

  const sendMessage = useCallback((message: string) => {
    socketRef.current?.emit('send_message', { message });
  }, []);

  const confirmResponse = useCallback((requestId: string, confirmed: boolean) => {
    socketRef.current?.emit('confirm_response', { requestId, confirmed });
    dispatch({ type: 'CONFIRM_CLEARED' });
  }, []);

  const cancelGeneration = useCallback(() => {
    socketRef.current?.emit('cancel_generation', {});
  }, []);

  const loadMoreHistory = useCallback(() => {
    if (!state.nextCursor) {
      return;
    }
    socketRef.current?.emit('load_history', { cursor: state.nextCursor });
  }, [state.nextCursor]);

  const toggleOpen = useCallback(async (open: boolean) => {
    dispatch({ type: 'TOGGLE_OPEN', open });

    if (open) {
      if (state.unreadCount > 0) {
        dispatch({ type: 'UNREAD_CLEARED' });
        markChatRead().catch((error: unknown) => {
          logger.warn('Failed to mark chat as read:', { error });
        });
      }

      if (!state.historyLoaded) {
        try {
          const data = await getChatMessages();
          dispatch({ type: 'HISTORY_FETCHED', messages: data.messages, nextCursor: data.nextCursor });
        } catch (error) {
          logger.error('Failed to load chat history:', { error });
          dispatch({ type: 'HISTORY_FETCHED', messages: [], nextCursor: null });
        }
      }
    }
  }, [state.historyLoaded, state.unreadCount]);

  const contextValue = useMemo<TChatContext>(() => ({
    state,
    sendMessage,
    confirmResponse,
    cancelGeneration,
    loadMoreHistory,
    toggleOpen,
  }), [state, sendMessage, confirmResponse, cancelGeneration, loadMoreHistory, toggleOpen]);

  return (
    <ChatContext value={contextValue}>
      {children}
    </ChatContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat(): TChatContext {
  const context = React.use(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
