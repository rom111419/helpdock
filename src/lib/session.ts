import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { publicEnv } from '@/config/env';
import { createClient } from '@/lib/supabase/server';

export function supabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

export async function currentUser(): Promise<User | null> {
  if (!supabaseConfigured()) return null;
  try {
    const client = await createClient();
    const { data } = await client.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}
