// @vitest-environment jsdom
import { act, createElement } from 'react';
// @ts-expect-error -- @types/react-dom is not installed; only createRoot is used here
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const disconnect = vi.fn();
const emit = vi.fn();
const io = vi.fn(() => ({ on: vi.fn(), connect: vi.fn(), disconnect, emit, io: { on: vi.fn() } }));

vi.mock('socket.io-client', () => ({ io: (...args: unknown[]) => (io as (...a: unknown[]) => unknown)(...args) }));
// A new function on every call, like next-intl's `t` after the layout re-renders.
// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix -- mock names mirror next-intl's hook exports
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key, useLocale: () => 'vi' }));
vi.mock('@/actions/chat', () => ({
  getChatMessages: vi.fn(),
  getChatUnreadCount: vi.fn().mockResolvedValue(0),
  markChatRead: vi.fn(),
}));
vi.mock('@/libs/Env', () => ({ Env: { NEXT_PUBLIC_SOCKET_URL: 'http://socket.test' } }));
vi.mock('@/libs/Logger', () => ({ logger: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const { ChatProvider, useChat } = await import('@/providers/ChatProvider');

describe('chatProvider send_message payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it('sends the UI locale with each message so the AI replies in that language', async () => {
    let sendMessage: ((message: string) => void) | undefined;
    function CaptureSendMessage() {
      sendMessage = useChat().sendMessage;
      return null;
    }
    const container = document.createElement('div');
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(ChatProvider, { initialUnreadCount: 0, children: createElement(CaptureSendMessage) }));
    });
    await act(async () => {
      sendMessage?.('xin chào');
    });

    expect(emit).toHaveBeenCalledWith('send_message', { message: 'xin chào', locale: 'vi' });

    await act(async () => {
      root.unmount();
    });
  });
});

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
