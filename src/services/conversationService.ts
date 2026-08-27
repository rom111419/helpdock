import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChatChannel, Citation, Conversation, Message } from '@/lib/supabase/types';

const HISTORY_LIMIT = 10;

export async function openConversation(
  client: SupabaseClient,
  ownerId: string,
  chatbotId: string,
  channel: ChatChannel,
  conversationId: string | null,
  visitorLabel: string,
): Promise<Conversation> {
  if (conversationId) {
    const { data } = await client
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('chatbot_id', chatbotId)
      .maybeSingle();
    if (data) return data as Conversation;
  }

  const { data, error } = await client
    .from('conversations')
    .insert({ chatbot_id: chatbotId, owner_id: ownerId, channel, visitor_label: visitorLabel })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Conversation;
}

export async function loadHistory(client: SupabaseClient, conversationId: string): Promise<Message[]> {
  const { data } = await client
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  return ((data as Message[] | null) ?? []).reverse();
}

export async function appendMessage(
  client: SupabaseClient,
  ownerId: string,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  citations: Citation[],
): Promise<void> {
  await client.from('messages').insert({
    conversation_id: conversationId,
    owner_id: ownerId,
    role,
    content,
    citations,
  });
  await client
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
}
