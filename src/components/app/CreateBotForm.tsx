'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { app } from '@/config/strings';
import { createChatbotAction } from '@/app/app/actions';
import { emptyActionState } from '@/lib/actionState';

export function CreateBotForm({ allowed, reason }: { allowed: boolean; reason: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createChatbotAction, emptyActionState);

  if (!allowed) {
    return (
      <div className="card border-dashed p-6">
        <p className="text-sm text-muted">{reason}</p>
        <Link href="/app/billing" className="btn btn-ghost mt-4 px-4 py-2 text-sm">
          {app.inbox.lockedCta}
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card flex min-h-40 flex-col items-center justify-center gap-2 border-dashed text-muted hover:border-ink hover:text-ink"
      >
        <Plus size={20} />
        <span className="text-sm font-medium">{app.bots.create}</span>
      </button>
    );
  }

  return (
    <form action={formAction} className="card p-6">
      <h2 className="font-medium">{app.bots.createTitle}</h2>

      <label className="mt-4 block text-sm font-medium" htmlFor="name">{app.bots.nameLabel}</label>
      <input id="name" name="name" required className="field mt-1.5" placeholder={app.bots.namePlaceholder} />

      <label className="mt-4 block text-sm font-medium" htmlFor="welcome_message">
        {app.bots.welcomeLabel}
      </label>
      <textarea
        id="welcome_message"
        name="welcome_message"
        rows={3}
        className="field mt-1.5 resize-none"
        placeholder={app.bots.welcomePlaceholder}
      />

      {state.error ? (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full py-2.5">
        {app.bots.submit}
      </button>
    </form>
  );
}
