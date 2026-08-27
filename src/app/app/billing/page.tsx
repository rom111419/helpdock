import { app, marketing } from '@/config/strings';
import { PLAN_ORDER, PLANS } from '@/config/plans';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadProfile, loadUsage } from '@/services/quotaService';
import { billingEnabled } from '@/services/billingService';
import { UsageBar } from '@/components/app/UsageBar';
import { PlanActions } from '@/components/app/PlanActions';

export default async function BillingPage(props: PageProps<'/app/billing'>) {
  const params = await props.searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  const tier = profile?.plan ?? 'free';
  const usage = await loadUsage(supabase, user.id, tier);

  return (
    <div>
      <h1 className="display text-3xl">{app.billing.title}</h1>
      <p className="mt-2 text-muted">{app.billing.subtitle}</p>

      {params.upgraded ? (
        <p className="mt-6 rounded-lg bg-positive-soft px-4 py-3 text-sm text-positive">{app.billing.upgraded}</p>
      ) : null}

      <section className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{app.billing.currentPlan}</p>
            <p className="display mt-1 text-2xl">{usage.plan.name}</p>
          </div>
          <PlanActions tier={tier} enabled={billingEnabled()} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <UsageBar label={app.billing.chatbots} used={usage.chatbots} limit={usage.plan.limits.chatbots} />
          <UsageBar
            label={app.billing.knowledge}
            used={usage.sourceChars}
            limit={usage.plan.limits.sourceChars}
          />
          <UsageBar
            label={app.billing.answers}
            used={usage.answersThisMonth}
            limit={usage.plan.limits.answersPerMonth}
          />
        </div>
      </section>

      <h2 className="display mt-12 text-2xl">{marketing.pricing.title}</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {PLAN_ORDER.map((candidate) => {
          const plan = PLANS[candidate];
          const current = candidate === tier;
          return (
            <div key={candidate} className="card flex flex-col p-6">
              <h3 className="font-medium">{plan.name}</h3>
              <p className="mt-3">
                <span className="display text-3xl">${plan.priceUsd}</span>
                <span className="text-sm text-muted">{marketing.pricing.perMonth}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
                {plan.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {current ? (
                <p className="mt-6 text-center text-sm text-muted">{marketing.pricing.cta.current}</p>
              ) : (
                <PlanActions tier={candidate} enabled={billingEnabled()} compact />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted">{marketing.pricing.testNote}</p>
    </div>
  );
}
