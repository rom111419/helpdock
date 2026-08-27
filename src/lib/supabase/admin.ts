import { createClient } from '@supabase/supabase-js';
import { serverEnv } from '@/config/env';

export function createAdminClient() {
  const env = serverEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
