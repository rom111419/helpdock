'use client';

import { useActionState, useState } from 'react';
import { FileText, Globe, PencilLine } from 'lucide-react';
import { app } from '@/config/strings';
import { cn } from '@/lib/cn';
import { addFileAction, addTextAction, addUrlAction } from '@/app/app/[botId]/sources/actions';
import { emptyActionState } from '@/lib/actionState';

type Mode = 'file' | 'url' | 'text';

const MODES: { id: Mode; label: string; icon: typeof FileText }[] = [
  { id: 'file', label: app.sources.uploadTitle, icon: FileText },
  { id: 'url', label: app.sources.urlTitle, icon: Globe },
  { id: 'text', label: app.sources.textTitle, icon: PencilLine },
];

export function AddSource({ botId }: { botId: string }) {
  const [mode, setMode] = useState<Mode>('file');
  const [fileState, fileAction, filePending] = useActionState(addFileAction, emptyActionState);
  const [urlState, urlAction, urlPending] = useActionState(addUrlAction, emptyActionState);
  const [textState, textAction, textPending] = useActionState(addTextAction, emptyActionState);

  const pending = filePending || urlPending || textPending;
  const error = fileState.error || urlState.error || textState.error;

  return (
    <aside className="card h-fit p-5 lg:sticky lg:top-6">
      <div className="flex gap-1 rounded-lg bg-paper p-1">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition',
              mode === item.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            <item.icon size={14} />
            {item.id}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <form action={fileAction} className="mt-5">
          <input type="hidden" name="bot_id" value={botId} />
          <p className="text-sm font-medium">{app.sources.uploadTitle}</p>
          <p className="mt-1 text-xs text-muted">{app.sources.uploadHint}</p>
          <input
            type="file"
            name="file"
            required
            accept=".pdf,.md,.markdown,.txt,.text"
            className="field mt-3 file:mr-3 file:rounded-md file:border-0 file:bg-paper file:px-2.5 file:py-1 file:text-xs"
          />
          <SubmitButton pending={pending} />
        </form>
      ) : null}

      {mode === 'url' ? (
        <form action={urlAction} className="mt-5">
          <input type="hidden" name="bot_id" value={botId} />
          <p className="text-sm font-medium">{app.sources.urlTitle}</p>
          <p className="mt-1 text-xs text-muted">{app.sources.urlHint}</p>
          <input
            type="url"
            name="url"
            required
            placeholder={app.sources.urlPlaceholder}
            className="field mt-3"
          />
          <SubmitButton pending={pending} />
        </form>
      ) : null}

      {mode === 'text' ? (
        <form action={textAction} className="mt-5">
          <input type="hidden" name="bot_id" value={botId} />
          <p className="text-sm font-medium">{app.sources.textTitle}</p>
          <p className="mt-1 text-xs text-muted">{app.sources.textHint}</p>
          <input
            type="text"
            name="title"
            required
            placeholder={app.sources.textTitlePlaceholder}
            className="field mt-3"
          />
          <textarea name="body" required rows={6} className="field mt-2 resize-none" />
          <SubmitButton pending={pending} />
        </form>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}
    </aside>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full py-2.5 text-sm">
      {pending ? app.sources.importing : app.sources.add}
    </button>
  );
}
