'use client';

import type { TChatContext, TChatState, TConfirmRequest, TMessage, TToolActivity } from '@/types/chat';
import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getChatMessages, getChatUnreadCount, markChatRead } from '@/actions/chat';
import { Env } from '@/libs/Env';
import { refreshAccessTokenOnce } from '@/libs/auth-refresh-client';
import { logger } from '@/libs/Logger';

type ChatAction
  = { type: 'TOGGLE_OPEN'; open: boolean }
    | { type: 'SEND_OPTIMISTIC'; message: string }
    | { type: 'MESSAGE_QUEUED'; messageId: string }
    | { type: 'RETRY_MESSAGE'; messageId: string }
    | { type: 'AI_TOOL_USED'; toolActivity: TToolActivity }
    | { type: 'AI_CONFIRM_REQUIRED'; confirmRequest: TConfirmRequest }
    | { type: 'AI_DONE'; message: TMessage }
    | { type: 'AI_ERROR' }
    | { type: 'HISTORY_LOADED'; messages: TMessage[]; nextCursor: string | null }
    | { type: 'HISTORY_FETCHED'; messages: TMessage[]; nextCursor: string | null }
    | { type: 'CONFIRM_CLEARED' }
    | { type: 'UNREAD_COUNT_LOADED'; unreadCount: number }
    | { type: 'UNREAD_CLEARED' }
    | { type: 'PREVIEW_DISMISSED' };

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
  previewDismissed: false,
};

function chatReducer(state: TChatState, action: ChatAction): TChatState {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: action.open, previewDismissed: action.open ? false : state.previewDismissed };
    case 'SEND_OPTIMISTIC': {
      const optimisticMsg: TMessage = {
        id: `temp_${Date.now()}`,
        role: 'USER',
        message: action.message,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      return { ...state, messages: [...state.messages, optimisticMsg] };
    }
    case 'MESSAGE_QUEUED':
      return {
        ...state,
        isQueued: true,
        pendingMessageId: action.messageId,
        messages: state.messages.map(msg =>
          msg.status === 'sending' ? { ...msg, id: action.messageId, status: 'sent' } : msg,
        ),
      };
    case 'RETRY_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.messageId ? { ...msg, status: 'sending' } : msg,
        ),
      };
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
        previewDismissed: false,
        messages: [...state.messages, action.message],
      };
    case 'AI_ERROR':
      return {
        ...state,
        isQueued: false,
        pendingMessageId: null,
        toolActivity: null,
        messages: state.messages.map(msg =>
          msg.status === 'sending' ? { ...msg, status: 'failed' } : msg,
        ),
      };
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
    case 'PREVIEW_DISMISSED':
      return { ...state, previewDismissed: true };
    default:
      return state;
  }
}

const ChatContext = createContext<TChatContext | null>(null);

type ChatProviderProps = {
  children: React.ReactNode;
  initialUnreadCount?: number;
  initialMessages?: TMessage[];
  initialNextCursor?: string | null;
};

export function ChatProvider({ children, initialUnreadCount = 0, initialMessages, initialNextCursor }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    unreadCount: initialUnreadCount,
    messages: initialMessages ?? [],
    nextCursor: initialNextCursor ?? null,
    historyLoaded: (initialMessages?.length ?? 0) > 0,
  });
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const inputFocusedRef = useRef(false);

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

    let isRefreshing = false;

    const socket = io(`${Env.NEXT_PUBLIC_SOCKET_URL}/chat-bot`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      withCredentials: true,
    });

    const handleAuthError = () => {
      if (isRefreshing) {
        return;
      }
      isRefreshing = true;
      // Pause auto-reconnect to avoid retrying with stale token
      socket.io.reconnection(false);
      logger.warn('Chat socket: token expired, refreshing...');
      refreshAccessTokenOnce()
        .then((refreshed) => {
          if (refreshed) {
            socket.io.reconnection(true);
            socket.connect();
          } else {
            logger.error('Chat socket: token refresh failed, cannot reconnect');
          }
        })
        .catch((error: unknown) => {
          logger.error('Chat socket: failed to refresh token', { error });
        })
        .finally(() => {
          isRefreshing = false;
        });
    };

    socket.on('connect', () => {
      logger.debug('Connected to chat socket');
    });

    socket.on('disconnect', (reason) => {
      logger.debug('Disconnected from chat socket', { reason });
      // but skip if auth refresh is in progress (handleAuthError will reconnect after refresh)
      if (reason === 'io server disconnect' && !isRefreshing) {
        socket.connect();
      }
      // All other reasons (transport close, ping timeout, etc.) handled by reconnection: true
    });

    socket.on('connect_error', (error) => {
      const msg = error.message?.toLowerCase() ?? '';
      const isAuthError = msg.includes('expired') || msg.includes('invalid') || msg.includes('unauthorized') || msg.includes('auth rejected');
      if (isAuthError) {
        handleAuthError();
      } else {
        logger.error('Chat socket connection error:', { error });
      }
    });

    socket.on('unauthorized', () => {
      handleAuthError();
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

    socket.on('ai_done', ({ message: messageText }: { message: string }) => {
      const message: TMessage = {
        id: crypto.randomUUID(),
        role: 'ASSISTANT',
        message: messageText,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'AI_DONE', message });
      if (inputFocusedRef.current) {
        dispatch({ type: 'UNREAD_CLEARED' });
        markChatRead().catch((error: unknown) => {
          logger.warn('Failed to mark chat as read:', { error });
        });
      } else {
        void fetchUnreadCount();
      }
    });

    socket.on('ai_error', ({ message: errMsg, retryable, code }: { message: string; retryable: boolean; code: string }) => {
      dispatch({ type: 'AI_ERROR' });
      if (code === 'AUTH_FAILED') {
        handleAuthError();
        return;
      }
      toast.error(errMsg, {
        description: retryable ? 'You can try sending your message again.' : undefined,
      });
    });

    socket.on('history_loaded', ({ messages, nextCursor }: { messages: TMessage[]; nextCursor: string | null }) => {
      dispatch({ type: 'HISTORY_LOADED', messages, nextCursor });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchUnreadCount]);

  const sendMessage = useCallback((message: string) => {
    dispatch({ type: 'SEND_OPTIMISTIC', message });
    socketRef.current?.emit('send_message', { message });
  }, []);

  const retryMessage = useCallback((messageId: string, message: string) => {
    dispatch({ type: 'RETRY_MESSAGE', messageId });
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

    if (!open) {
      inputFocusedRef.current = false;
    }

    if (open && !state.historyLoaded) {
      try {
        const data = await getChatMessages();
        dispatch({ type: 'HISTORY_FETCHED', messages: data.messages, nextCursor: data.nextCursor });
      } catch (error) {
        logger.error('Failed to load chat history:', { error });
        dispatch({ type: 'HISTORY_FETCHED', messages: [], nextCursor: null });
      }
    }
  }, [state.historyLoaded]);

  const onInputFocus = useCallback(() => {
    inputFocusedRef.current = true;
    if (state.unreadCount > 0) {
      dispatch({ type: 'UNREAD_CLEARED' });
      markChatRead().catch((error: unknown) => {
        logger.warn('Failed to mark chat as read:', { error });
      });
    }
  }, [state.unreadCount]);

  const onInputBlur = useCallback(() => {
    inputFocusedRef.current = false;
  }, []);

  const dismissPreview = useCallback(() => {
    dispatch({ type: 'PREVIEW_DISMISSED' });
  }, []);

  const contextValue = useMemo<TChatContext>(() => ({
    state,
    sendMessage,
    retryMessage,
    confirmResponse,
    cancelGeneration,
    loadMoreHistory,
    toggleOpen,
    onInputFocus,
    onInputBlur,
    dismissPreview,
  }), [state, sendMessage, retryMessage, confirmResponse, cancelGeneration, loadMoreHistory, toggleOpen, onInputFocus, onInputBlur, dismissPreview]);

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
