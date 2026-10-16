import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Layout from './layout';

vi.mock('@/actions', () => ({
  getChatMessages: vi.fn(),
  getChatUnreadCount: vi.fn(),
  verifyUser: vi.fn(),
}));
vi.mock('@/features/chat', () => ({
  ChatBubble: () => null,
  ChatPanel: () => null,
  ChatProvider: () => null,
}));
vi.mock('./AppLoading', () => ({ AppLoading: () => null }));
vi.mock('./LayoutClient', () => ({ LayoutClient: () => null }));

describe('(app) layout', () => {
  it('returns the loading boundary synchronously instead of awaiting user and chat data', () => {
    // Arrange
    const children = null;

    // Act
    const rendered = Layout({ children });

    // Assert
    expect(rendered).not.toBeInstanceOf(Promise);
    expect(rendered.type).toBe(Suspense);
  });
});
