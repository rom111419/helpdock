'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { app } from '@/config/strings';
import { cn } from '@/lib/cn';

const TABS = [
  { segment: 'sources', label: app.tabs.sources },
  { segment: 'chat', label: app.tabs.chat },
  { segment: 'embed', label: app.tabs.embed },
  { segment: 'inbox', label: app.tabs.inbox },
];

export function BotTabs({ botId }: { botId: string }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-1 border-b border-line">
      {TABS.map((tab) => {
        const href = `/app/${botId}/${tab.segment}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              '-mb-px border-b-2 px-3.5 py-2.5 text-sm transition',
              active ? 'border-accent font-medium text-ink' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
