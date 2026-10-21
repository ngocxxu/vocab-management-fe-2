// @vitest-environment jsdom
import { act, createElement } from 'react';
// @ts-expect-error -- @types/react-dom is not installed; only createRoot is used here
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const disconnect = vi.fn();
const io = vi.fn(() => ({ on: vi.fn(), connect: vi.fn(), disconnect, emit: vi.fn(), io: { on: vi.fn() } }));

vi.mock('socket.io-client', () => ({ io: (...args: unknown[]) => (io as (...a: unknown[]) => unknown)(...args) }));
// A new function on every call, like next-intl's `t` after the layout re-renders.
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@/actions/chat', () => ({
  getChatMessages: vi.fn(),
  getChatUnreadCount: vi.fn().mockResolvedValue(0),
  markChatRead: vi.fn(),
}));
vi.mock('@/libs/Env', () => ({ Env: { NEXT_PUBLIC_SOCKET_URL: 'http://socket.test' } }));
vi.mock('@/libs/Logger', () => ({ logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const { ChatProvider } = await import('@/providers/ChatProvider');

describe('chatProvider socket lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it('keeps one socket across re-renders and closes it on unmount', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(ChatProvider, { initialUnreadCount: 0, children: createElement('span') }));
    });
    await act(async () => {
      root.render(createElement(ChatProvider, { initialUnreadCount: 1, children: createElement('span') }));
    });
    await act(async () => {
      root.render(createElement(ChatProvider, { initialUnreadCount: 2, children: createElement('span') }));
    });

    expect(io).toHaveBeenCalledTimes(1);
    expect(disconnect).not.toHaveBeenCalled();

    await act(async () => {
      root.unmount();
    });

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
