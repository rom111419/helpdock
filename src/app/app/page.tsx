import Link from 'next/link';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { listBots } from '@/services/botService';
import { loadProfile, loadUsage, canCreateChatbot } from '@/services/quotaService';
import { CreateBotForm } from '@/components/app/CreateBotForm';

export default async function BotsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  const [bots, usage] = await Promise.all([
    listBots(supabase, user.id),
    loadUsage(supabase, user.id, profile?.plan ?? 'free'),
  ]);

  const { data: counts } = await supabase.from('sources').select('chatbot_id').eq('owner_id', user.id);
  const perBot = new Map<string, number>();
  for (const row of ((counts as { chatbot_id: string }[] | null) ?? [])) {
    perBot.set(row.chatbot_id, (perBot.get(row.chatbot_id) ?? 0) + 1);
  }

  const quota = canCreateChatbot(usage);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl">{app.bots.title}</h1>
          <p className="mt-2 text-muted">{app.bots.subtitle}</p>
        </div>
        <p className="text-sm text-muted">
          {usage.chatbots} / {usage.plan.limits.chatbots} {app.nav.bots.toLowerCase()}
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <Link key={bot.id} href={`/app/${bot.id}/sources`} className="card group p-6 hover:border-ink">
            <div className="flex items-start justify-between gap-3">
              <span
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${bot.accent_color}1a`, color: bot.accent_color }}
              >
                <MessageSquare size={17} />
              </span>
              <ArrowUpRight size={16} className="text-muted transition group-hover:text-ink" />
            </div>
            <h2 className="mt-4 font-medium">{bot.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {perBot.get(bot.id) ?? 0} {app.bots.sources}
            </p>
          </Link>
        ))}

        <CreateBotForm allowed={quota.allowed} reason={quota.reason} />
      </div>

      {bots.length === 0 ? <p className="mt-8 text-sm text-muted">{app.bots.empty}</p> : null}
    </div>
  );
}
