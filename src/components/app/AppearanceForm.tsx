'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { app } from '@/config/strings';
import type { Chatbot } from '@/lib/supabase/types';
import { updateChatbotAction } from '@/app/app/actions';
import { emptyActionState } from '@/lib/actionState';

export function AppearanceForm({ bot, personaAllowed }: { bot: Chatbot; personaAllowed: boolean }) {
  const [state, formAction, pending] = useActionState(updateChatbotAction, emptyActionState);

  return (
    <form action={formAction} className="card mt-4 p-5">
      <input type="hidden" name="bot_id" value={bot.id} />

      <label className="block text-sm font-medium" htmlFor="name">{app.bots.nameLabel}</label>
      <input id="name" name="name" defaultValue={bot.name} required className="field mt-1.5" />

      <label className="mt-4 block text-sm font-medium" htmlFor="welcome_message">
        {app.bots.welcomeLabel}
      </label>
      <textarea
        id="welcome_message"
        name="welcome_message"
        rows={2}
        defaultValue={bot.welcome_message}
        className="field mt-1.5 resize-none"
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="accent_color">{app.embed.accent}</label>
      <input
        id="accent_color"
        name="accent_color"
        type="color"
        defaultValue={bot.accent_color}
        className="mt-1.5 h-10 w-20 cursor-pointer rounded-lg border border-line bg-surface p-1"
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="persona">{app.embed.persona}</label>
      <p className="mt-1 text-xs text-muted">{app.embed.personaHint}</p>
      <textarea
        id="persona"
        name="persona"
        rows={3}
        disabled={!personaAllowed}
        defaultValue={bot.persona}
        placeholder={app.embed.personaPlaceholder}
        className="field mt-1.5 resize-none disabled:opacity-60"
      />
      {!personaAllowed ? (
        <Link href="/app/billing" className="mt-2 inline-block text-xs text-accent hover:underline">
          {app.inbox.lockedCta}
        </Link>
      ) : null}

      {state.error ? (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 px-5 py-2.5 text-sm">
        {app.embed.save}
      </button>
    </form>
  );
}
