import { API_ENDPOINTS } from '@/utils/api-config';
import { postTokenRefreshed, subscribeToTokenRefresh } from '@/libs/token-broadcast';

let clientRefreshInFlight: Promise<boolean> | null = null;

if (typeof window !== 'undefined') {
  subscribeToTokenRefresh(() => {
    clientRefreshInFlight = null;
  });
}

export function refreshAccessTokenOnce(): Promise<boolean> {
  if (clientRefreshInFlight) {
    return clientRefreshInFlight;
  }

  clientRefreshInFlight = fetch(`/api${API_ENDPOINTS.auth.refresh}`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => {
      if (response.ok) {
        postTokenRefreshed();
        return true;
      }
      return false;
    })
    .catch(() => false)
    .finally(() => {
      clientRefreshInFlight = null;
    });

  return clientRefreshInFlight;
}
