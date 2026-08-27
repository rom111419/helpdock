import { notFound } from 'next/navigation';
import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadBot } from '@/services/botService';
import { ChatPanel } from '@/components/chat/ChatPanel';

export default async function ChatPage(props: PageProps<'/app/[botId]/chat'>) {
  const { botId } = await props.params;
  await requireUser();
  const supabase = await createClient();
  const bot = await loadBot(supabase, botId);
  if (!bot) notFound();

  const { count } = await supabase
    .from('sources')
    .select('id', { count: 'exact', head: true })
    .eq('chatbot_id', botId)
    .eq('status', 'ready');

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-xl font-medium">{app.chat.title}</h2>
      <p className="mt-1 text-sm text-muted">{app.chat.subtitle}</p>

      {count === 0 ? (
        <p className="card mt-6 p-8 text-center text-sm text-muted">{app.sources.empty}</p>
      ) : (
        <div className="mt-6">
          <ChatPanel
            endpoint="/api/chat"
            identity={{ botId }}
            welcome={bot.welcome_message}
            accentColor={bot.accent_color}
          />
        </div>
      )}
    </div>
  );
}
