const CHANNEL_NAME = 'auth_tokens';

export type TTokenBroadcastMessage = {
  type: 'TOKEN_REFRESHED';
  timestamp: number;
};

export function postTokenRefreshed(): void {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: 'TOKEN_REFRESHED', timestamp: Date.now() } satisfies TTokenBroadcastMessage);
  channel.close();
}

export function subscribeToTokenRefresh(onRefreshed: () => void): () => void {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return () => {};
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  const handler = (event: MessageEvent<TTokenBroadcastMessage>) => {
    if (event.data?.type === 'TOKEN_REFRESHED') {
      onRefreshed();
    }
  };

  channel.addEventListener('message', handler);

  return () => {
    channel.removeEventListener('message', handler);
    channel.close();
  };
}
