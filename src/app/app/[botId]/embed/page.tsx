import { notFound } from 'next/navigation';
import { app } from '@/config/strings';
import { publicEnv } from '@/config/env';
import { PLANS } from '@/config/plans';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadBot } from '@/services/botService';
import { loadProfile } from '@/services/quotaService';
import { EmbedSnippet } from '@/components/app/EmbedSnippet';
import { AppearanceForm } from '@/components/app/AppearanceForm';
import { DeleteBot } from '@/components/app/DeleteBot';

export default async function EmbedPage(props: PageProps<'/app/[botId]/embed'>) {
  const { botId } = await props.params;
  const user = await requireUser();
  const supabase = await createClient();
  const bot = await loadBot(supabase, botId);
  if (!bot) notFound();

  const profile = await loadProfile(supabase, user.id);
  const plan = PLANS[profile?.plan ?? 'free'];
  const snippet = `<script src="${publicEnv.siteUrl}/widget.js" data-helpdock="${bot.public_key}" data-accent="${bot.accent_color}" defer></script>`;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h2 className="text-xl font-medium">{app.embed.title}</h2>
        <p className="mt-1 text-sm text-muted">{app.embed.subtitle}</p>
        <EmbedSnippet snippet={snippet} />

        <h3 className="mt-10 text-lg font-medium">{app.embed.appearance}</h3>
        <AppearanceForm bot={bot} personaAllowed={plan.features.customPersona} />
        <DeleteBot botId={bot.id} />
      </section>

      <section>
        <h3 className="text-lg font-medium">{app.embed.preview}</h3>
        <iframe
          src={`/embed/${bot.public_key}`}
          title={app.embed.preview}
          className="card mt-4 h-[560px] w-full"
        />
      </section>
    </div>
  );
}
