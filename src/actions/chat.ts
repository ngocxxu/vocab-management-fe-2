'use server';

import type { TMessage } from '@/types/chat';
import { API_METHODS } from '@/utils/api-config';
import { serverApi } from '@/utils/server-api';
import { requireAuth } from './auth';
import { toActionError } from './utils';

export async function getChatUnreadCount(): Promise<number> {
  await requireAuth();
  try {
    const { endpoint } = API_METHODS.chat.getUnreadCount();
    const data = await serverApi.get<{ unreadCount: number }>(endpoint);
    return data.unreadCount ?? 0;
  } catch (error) {
    throw toActionError(error, 'Failed to fetch chat unread count');
  }
}

export async function getChatMessages(cursor?: string): Promise<{ messages: TMessage[]; nextCursor: string | null }> {
  await requireAuth();
  try {
    const { endpoint } = API_METHODS.chat.getMessages(cursor);
    const data = await serverApi.get<{ messages: TMessage[]; nextCursor: string | null }>(endpoint);
    return { messages: data.messages ?? [], nextCursor: data.nextCursor ?? null };
  } catch (error) {
    throw toActionError(error, 'Failed to fetch chat messages');
  }
}

export async function markChatRead(): Promise<void> {
  await requireAuth();
  try {
    const { endpoint } = API_METHODS.chat.markRead();
    await serverApi.patch<void>(endpoint, {});
  } catch (error) {
    throw toActionError(error, 'Failed to mark chat as read');
  }
}
