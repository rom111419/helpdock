import { notFound } from 'next/navigation';
import { widget } from '@/config/strings';
import { PLANS } from '@/config/plans';
import { createAdminClient } from '@/lib/supabase/admin';
import { loadBotByPublicKey } from '@/services/botService';
import { loadProfile } from '@/services/quotaService';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Logo } from '@/components/Logo';

export default async function EmbedPage(props: PageProps<'/embed/[publicKey]'>) {
  const { publicKey } = await props.params;
  const supabase = createAdminClient();
  const bot = await loadBotByPublicKey(supabase, publicKey);
  if (!bot) notFound();

  const profile = await loadProfile(supabase, bot.owner_id);
  const showBadge = !PLANS[profile?.plan ?? 'free'].features.removeBadge;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <header
        className="flex items-center gap-2.5 px-4 py-3 text-white"
        style={{ backgroundColor: bot.accent_color }}
      >
        <span className="text-sm font-medium">{bot.name}</span>
      </header>

      <div className="min-h-0 flex-1">
        <ChatPanel
          endpoint="/api/widget/chat"
          identity={{ publicKey }}
          welcome={bot.welcome_message}
          accentColor={bot.accent_color}
          compact
        />
      </div>

      {showBadge ? (
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 border-t border-line py-2 text-[11px] text-muted hover:text-ink"
        >
          <Logo size={12} />
          {widget.poweredBy}
        </a>
      ) : null}
    </div>
  );
}
