'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { app } from '@/config/strings';
import { cn } from '@/lib/cn';
import type { Conversation, Message } from '@/lib/supabase/types';

export function ConversationList({
  conversations,
  messages,
}: {
  conversations: Conversation[];
  messages: Message[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (conversations.length === 0) {
    return <p className="card mt-6 p-8 text-center text-sm text-muted">{app.inbox.empty}</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {conversations.map((conversation) => {
        const thread = messages.filter((message) => message.conversation_id === conversation.id);
        const firstQuestion = thread.find((message) => message.role === 'user');
        const open = openId === conversation.id;

        return (
          <li key={conversation.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : conversation.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {firstQuestion?.content ?? app.inbox.empty}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {app.inbox.channel[conversation.channel]} · {thread.length} {app.inbox.messages} ·{' '}
                  {new Date(conversation.last_message_at).toLocaleString('en-US')}
                </p>
              </div>
              <ChevronDown size={16} className={cn('shrink-0 text-muted transition', open && 'rotate-180')} />
            </button>

            {open ? (
              <div className="space-y-3 border-t border-line bg-paper/50 p-4">
                {thread.map((message) => (
                  <div
                    key={message.id}
                    className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <p
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                        message.role === 'user'
                          ? 'rounded-br-md bg-ink text-paper'
                          : 'rounded-bl-md border border-line bg-surface',
                      )}
                    >
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
