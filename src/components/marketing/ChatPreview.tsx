import { FileText } from 'lucide-react';
import { marketing } from '@/config/strings';
import { Logo } from '@/components/Logo';

export function ChatPreview() {
  const { botName, turns, sourceLabel } = marketing.heroChat;

  return (
    <div className="card overflow-hidden shadow-[0_24px_60px_-30px_rgba(23,21,15,0.45)]">
      <div className="flex items-center gap-2.5 border-b border-line bg-surface px-4 py-3">
        <Logo size={18} />
        <span className="text-sm font-medium">{botName}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
          <span className="size-1.5 rounded-full bg-positive" />
          online
        </span>
      </div>

      <div className="space-y-3 bg-paper/60 px-4 py-5">
        {turns.map((turn, index) => (
          <div key={index} className={turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className="max-w-[85%] space-y-2">
              <p
                className={
                  turn.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-sm leading-relaxed text-paper'
                    : 'rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed'
                }
              >
                {turn.text}
              </p>
              {'source' in turn && turn.source ? (
                <p className="flex items-center gap-1.5 pl-1 text-[11px] text-muted">
                  <FileText size={12} />
                  {sourceLabel} <span className="font-medium text-ink/70">{turn.source}</span>
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
