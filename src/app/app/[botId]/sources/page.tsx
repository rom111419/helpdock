import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadProfile, loadUsage } from '@/services/quotaService';
import type { Source } from '@/lib/supabase/types';
import { AddSource } from '@/components/app/AddSource';
import { SourceList } from '@/components/app/SourceList';

export default async function SourcesPage(props: PageProps<'/app/[botId]/sources'>) {
  const { botId } = await props.params;
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data }, profile] = await Promise.all([
    supabase.from('sources').select('*').eq('chatbot_id', botId).order('created_at', { ascending: false }),
    loadProfile(supabase, user.id),
  ]);
  const usage = await loadUsage(supabase, user.id, profile?.plan ?? 'free');
  const sources = (data as Source[] | null) ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium">{app.sources.title}</h2>
            <p className="mt-1 text-sm text-muted">{app.sources.subtitle}</p>
          </div>
          <p className="text-sm text-muted">
            {usage.sourceChars.toLocaleString('en-US')} / {usage.plan.limits.sourceChars.toLocaleString('en-US')}{' '}
            {app.sources.chars}
          </p>
        </div>

        <SourceList botId={botId} sources={sources} />
      </section>

      <AddSource botId={botId} />
    </div>
  );
}
