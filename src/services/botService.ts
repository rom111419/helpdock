import type { SupabaseClient } from '@supabase/supabase-js';
import type { Chatbot } from '@/lib/supabase/types';

export type BotSettings = {
  name: string;
  welcome_message: string;
  accent_color: string;
  persona: string;
};

export async function listBots(client: SupabaseClient, ownerId: string): Promise<Chatbot[]> {
  const { data, error } = await client
    .from('chatbots')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Chatbot[] | null) ?? [];
}

export async function loadBot(client: SupabaseClient, botId: string): Promise<Chatbot | null> {
  const { data, error } = await client.from('chatbots').select('*').eq('id', botId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Chatbot | null) ?? null;
}

export async function loadBotByPublicKey(client: SupabaseClient, publicKey: string): Promise<Chatbot | null> {
  const { data, error } = await client.from('chatbots').select('*').eq('public_key', publicKey).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Chatbot | null) ?? null;
}

export async function createBot(
  client: SupabaseClient,
  ownerId: string,
  name: string,
  welcomeMessage: string,
): Promise<Chatbot> {
  const { data, error } = await client
    .from('chatbots')
    .insert({ owner_id: ownerId, name, welcome_message: welcomeMessage })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Chatbot;
}

export async function updateBot(
  client: SupabaseClient,
  botId: string,
  settings: Partial<BotSettings>,
): Promise<void> {
  const { error } = await client.from('chatbots').update(settings).eq('id', botId);
  if (error) throw new Error(error.message);
}

export async function deleteBot(client: SupabaseClient, botId: string): Promise<void> {
  await client.from('chatbots').delete().eq('id', botId);
}
