import { FileText, Globe, PencilLine, Trash2 } from 'lucide-react';
import { app } from '@/config/strings';
import { cn } from '@/lib/cn';
import type { Source, SourceStatus } from '@/lib/supabase/types';
import { deleteSourceAction } from '@/app/app/[botId]/sources/actions';

const ICONS = { file: FileText, url: Globe, text: PencilLine };

const STATUS_STYLE: Record<SourceStatus, string> = {
  pending: 'bg-accent-soft text-warning',
  processing: 'bg-accent-soft text-warning',
  ready: 'bg-positive-soft text-positive',
  failed: 'bg-danger-soft text-danger',
};

export function SourceList({ botId, sources }: { botId: string; sources: Source[] }) {
  if (sources.length === 0) {
    return <p className="card mt-6 p-8 text-center text-sm text-muted">{app.sources.empty}</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {sources.map((source) => {
        const Icon = ICONS[source.kind];
        return (
          <li key={source.id} className="card flex items-start gap-3.5 p-4">
            <Icon size={17} className="mt-0.5 shrink-0 text-muted" />

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{source.title}</p>
              <p className="mt-1 text-xs text-muted">
                {source.char_count.toLocaleString('en-US')} {app.sources.chars}
                {source.chunk_count > 0 ? ` · ${source.chunk_count} ${app.sources.chunks}` : ''}
              </p>
              {source.error ? <p className="mt-1.5 text-xs text-danger">{source.error}</p> : null}
            </div>

            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', STATUS_STYLE[source.status])}>
              {app.sources.status[source.status]}
            </span>

            <form action={deleteSourceAction}>
              <input type="hidden" name="bot_id" value={botId} />
              <input type="hidden" name="source_id" value={source.id} />
              <button type="submit" aria-label={app.sources.remove} className="text-muted hover:text-danger">
                <Trash2 size={16} />
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
