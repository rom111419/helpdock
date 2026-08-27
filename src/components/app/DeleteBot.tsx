'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { app } from '@/config/strings';
import { deleteChatbotAction } from '@/app/app/actions';

export function DeleteBot({ botId }: { botId: string }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="card mt-8 border-danger/30 p-5">
      <p className="text-sm font-medium text-danger">{app.embed.danger}</p>
      <p className="mt-1 text-xs text-muted">{app.embed.dangerHint}</p>

      {confirming ? (
        <form action={deleteChatbotAction} className="mt-4 flex gap-2">
          <input type="hidden" name="bot_id" value={botId} />
          <button type="submit" className="btn bg-danger px-4 py-2 text-sm text-white">
            <Trash2 size={15} />
            {app.embed.delete}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost px-4 py-2 text-sm">
            {app.embed.cancel}
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="btn btn-ghost mt-4 px-4 py-2 text-sm">
          <Trash2 size={15} />
          {app.embed.delete}
        </button>
      )}
    </div>
  );
}
