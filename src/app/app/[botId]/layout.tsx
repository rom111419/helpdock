import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadBot } from '@/services/botService';
import { BotTabs } from '@/components/app/BotTabs';

export default async function BotLayout(props: LayoutProps<'/app/[botId]'>) {
  const { botId } = await props.params;
  await requireUser();
  const supabase = await createClient();
  const bot = await loadBot(supabase, botId);
  if (!bot) notFound();

  return (
    <div>
      <Link href="/app" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft size={15} />
        {app.nav.bots}
      </Link>

      <h1 className="display mt-3 text-3xl">{bot.name}</h1>
      <BotTabs botId={botId} />

      <div className="mt-8">{props.children}</div>
    </div>
  );
}
