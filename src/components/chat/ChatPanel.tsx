'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FileText, Send } from 'lucide-react';
import { app, widget } from '@/config/strings';
import type { Citation } from '@/lib/supabase/types';
import { cn } from '@/lib/cn';

export type ChatIdentity = { botId: string } | { publicKey: string };

type Bubble = {
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
};

type Props = {
  endpoint: string;
  identity: ChatIdentity;
  welcome: string;
  accentColor: string;
  compact?: boolean;
};

export function ChatPanel({ endpoint, identity, welcome, accentColor, compact = false }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const conversationId = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;

    setDraft('');
    setError('');
    setBusy(true);
    setBubbles((current) => [
      ...current,
      { role: 'user', content: question, citations: [] },
      { role: 'assistant', content: '', citations: [] },
    ]);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...identity, question, conversationId: conversationId.current }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({ error: widget.offline }));
        throw new Error(typeof payload.error === 'string' ? payload.error : widget.offline);
      }

      await consume(response.body, (event) => {
        if (event.type === 'conversation') conversationId.current = event.conversationId ?? null;
        if (event.type === 'citations') updateLast((bubble) => ({ ...bubble, citations: event.citations ?? [] }));
        if (event.type === 'delta') updateLast((bubble) => ({ ...bubble, content: bubble.content + (event.text ?? '') }));
        if (event.type === 'error') setError(event.message ?? widget.offline);
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : widget.offline);
      setBubbles((current) => current.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  function updateLast(mutate: (bubble: Bubble) => Bubble) {
    setBubbles((current) => current.map((bubble, index) => (index === current.length - 1 ? mutate(bubble) : bubble)));
  }

  return (
    <div className={cn('flex flex-col', compact ? 'h-full' : 'card h-[600px]')}>
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-5">
        {welcome ? <Bubble role="assistant" content={welcome} citations={[]} accentColor={accentColor} /> : null}
        {bubbles.length === 0 && !welcome ? (
          <p className="pt-10 text-center text-sm text-muted">{app.chat.empty}</p>
        ) : null}
        {bubbles.map((bubble, index) => (
          <Bubble key={index} {...bubble} accentColor={accentColor} />
        ))}
        {busy && bubbles.at(-1)?.content === '' ? (
          <p className="text-sm text-muted">{app.chat.thinking}</p>
        ) : null}
        {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p> : null}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={compact ? widget.placeholder : app.chat.placeholder}
          className="field"
          aria-label={compact ? widget.placeholder : app.chat.placeholder}
        />
        <button
          type="submit"
          disabled={busy || draft.trim().length === 0}
          aria-label={app.chat.send}
          className="btn shrink-0 px-3 py-2.5 text-surface"
          style={{ backgroundColor: accentColor }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, content, citations, accentColor }: Bubble & { accentColor: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <p
          className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed text-white"
          style={{ backgroundColor: accentColor }}
        >
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="max-w-[90%] rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
      {citations.length > 0 ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[11px] text-muted">
          <FileText size={12} />
          {app.chat.sources}
          {citations.map((citation) => (
            <span key={citation.sourceId} className="font-medium text-ink/70">{citation.title}</span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

type StreamEvent = {
  type: string;
  conversationId?: string;
  citations?: Citation[];
  text?: string;
  message?: string;
};

async function consume(body: ReadableStream<Uint8Array>, onEvent: (event: StreamEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      if (!raw.trim()) continue;
      onEvent(JSON.parse(raw) as StreamEvent);
    }
  }
}
