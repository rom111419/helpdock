import { BadgeCheck, Inbox, Palette, ShieldQuestion } from 'lucide-react';
import { marketing } from '@/config/strings';

const ICONS = [BadgeCheck, ShieldQuestion, Inbox, Palette];

export function Features() {
  const { title, items } = marketing.features;

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <h2 className="display text-3xl leading-tight lg:text-4xl">{title}</h2>

        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? BadgeCheck;
            return (
              <div key={item.title} className="flex gap-4">
                <Icon size={20} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
