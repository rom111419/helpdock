import Link from 'next/link';
import { Lock } from 'lucide-react';
import { app } from '@/config/strings';
import { PLANS } from '@/config/plans';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadProfile } from '@/services/quotaService';
import type { Conversation, Message } from '@/lib/supabase/types';
import { ConversationList } from '@/components/app/ConversationList';

export default async function InboxPage(props: PageProps<'/app/[botId]/inbox'>) {
  const { botId } = await props.params;
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  const plan = PLANS[profile?.plan ?? 'free'];

  if (!plan.features.conversationHistory) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <Lock size={20} className="mx-auto text-muted" />
        <p className="mt-4 text-sm text-muted">{app.inbox.locked}</p>
        <Link href="/app/billing" className="btn btn-primary mt-5 px-5 py-2.5 text-sm">
          {app.inbox.lockedCta}
        </Link>
      </div>
    );
  }

  const { data: rows } = await supabase
    .from('conversations')
    .select('*')
    .eq('chatbot_id', botId)
    .order('last_message_at', { ascending: false })
    .limit(50);

  const conversations = (rows as Conversation[] | null) ?? [];
  const ids = conversations.map((conversation) => conversation.id);

  const { data: messageRows } = ids.length
    ? await supabase.from('messages').select('*').in('conversation_id', ids).order('created_at')
    : { data: [] };

  const messages = (messageRows as Message[] | null) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-medium">{app.inbox.title}</h2>
      <p className="mt-1 text-sm text-muted">{app.inbox.subtitle}</p>
      <ConversationList conversations={conversations} messages={messages} />
    </div>
  );
}
