import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Env } from './Env';

let supabaseClient: SupabaseClient | null = null;

function clearStoredSupabaseSession(supabaseUrl: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    if (!projectRef) {
      return;
    }

    window.localStorage.removeItem(`sb-${projectRef}-auth-token`);
    window.localStorage.removeItem(`sb-${projectRef}-auth-token-user`);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = Env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = Env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }

  clearStoredSupabaseSession(supabaseUrl);

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
