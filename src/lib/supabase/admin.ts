import { createClient } from '@supabase/supabase-js';
import { supabaseAdminEnv } from '@/config/env';

export function createAdminClient() {
  const env = supabaseAdminEnv();
  return createClient(env.url, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
