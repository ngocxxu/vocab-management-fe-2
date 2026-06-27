export type TMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  toolCalls?: unknown[];
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
};

export type TToolActivity = {
  toolName: string;
  label: string;
};

export type TConfirmRequest = {
  requestId: string;
  action: string;
  params: Record<string, unknown>;
};

export type TChatState = {
  isOpen: boolean;
  messages: TMessage[];
  isQueued: boolean;
  pendingMessageId: string | null;
  toolActivity: TToolActivity | null;
  confirmRequest: TConfirmRequest | null;
  nextCursor: string | null;
  historyLoaded: boolean;
  unreadCount: number;
};

export type TChatContext = {
  state: TChatState;
  sendMessage: (message: string) => void;
  retryMessage: (messageId: string, content: string) => void;
  confirmResponse: (requestId: string, confirmed: boolean) => void;
  cancelGeneration: () => void;
  loadMoreHistory: () => void;
  toggleOpen: (open: boolean) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
};
