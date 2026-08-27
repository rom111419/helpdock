'use client';

import { useActionState } from 'react';
import { app, marketing } from '@/config/strings';
import type { PlanTier } from '@/config/plans';
import { checkoutAction, portalAction } from '@/app/app/billing/actions';
import { emptyActionState } from '@/lib/actionState';
import { cn } from '@/lib/cn';

export function PlanActions({
  tier,
  enabled,
  compact = false,
}: {
  tier: PlanTier;
  enabled: boolean;
  compact?: boolean;
}) {
  const [checkoutState, checkout, checkoutPending] = useActionState(checkoutAction, emptyActionState);
  const [portalState, portal, portalPending] = useActionState(portalAction, emptyActionState);
  const error = checkoutState.error || portalState.error;

  if (tier === 'free') {
    return enabled ? null : <p className="text-sm text-muted">{app.billing.disabled}</p>;
  }

  return (
    <div className={cn(compact ? 'mt-6' : '')}>
      {compact ? (
        <form action={checkout}>
          <input type="hidden" name="tier" value={tier} />
          <button type="submit" disabled={!enabled || checkoutPending} className="btn btn-primary w-full py-2.5 text-sm">
            {marketing.pricing.cta.paid}
          </button>
        </form>
      ) : null}

      {!compact ? (
        <form action={portal}>
          <button type="submit" disabled={!enabled || portalPending} className="btn btn-ghost px-5 py-2.5 text-sm">
            {app.billing.manage}
          </button>
        </form>
      ) : null}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
