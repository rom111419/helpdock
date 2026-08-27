import Link from 'next/link';
import { Check } from 'lucide-react';
import { PLAN_ORDER, PLANS } from '@/config/plans';
import { marketing } from '@/config/strings';
import { cn } from '@/lib/cn';

const FEATURED = 'pro';

export function PricingTable({ signedIn }: { signedIn: boolean }) {
  const { title, subtitle, cta, perMonth, testNote } = marketing.pricing;
  const href = signedIn ? '/app/billing' : '/login?mode=signup';

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-18 lg:py-24">
      <h2 className="display text-3xl leading-tight lg:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-muted">{subtitle}</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLAN_ORDER.map((tier) => {
          const plan = PLANS[tier];
          const featured = tier === FEATURED;
          return (
            <div
              key={tier}
              className={cn(
                'card flex flex-col p-7',
                featured && 'border-accent ring-1 ring-accent',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{plan.name}</h3>
                {featured ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent uppercase">
                    {marketing.pricing.popular}
                  </span>
                ) : null}
              </div>

              <p className="mt-4">
                <span className="display text-4xl">${plan.priceUsd}</span>
                <span className="text-sm text-muted">{perMonth}</span>
              </p>
              <p className="mt-3 min-h-12 text-sm leading-relaxed text-muted">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.highlights.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={cn('btn mt-7 w-full py-2.5', featured ? 'btn-primary' : 'btn-ghost')}
              >
                {plan.priceUsd === 0 ? cta.free : cta.paid}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted">{testNote}</p>
    </section>
  );
}
