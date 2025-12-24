import { createClient } from '@supabase/supabase-js';
import { Env } from './Env';

const supabaseUrl = Env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
