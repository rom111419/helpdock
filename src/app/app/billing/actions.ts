'use server';

import { redirect } from 'next/navigation';
import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import type { ActionState } from '@/lib/actionState';
import { billingEnabled, createCheckoutSession, createPortalSession, type CheckoutTarget } from '@/services/billingService';
import { loadProfile } from '@/services/quotaService';

export async function checkoutAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!billingEnabled()) return { error: app.billing.disabled };

  const tier = String(formData.get('tier') ?? '');
  if (tier !== 'pro' && tier !== 'business') return { error: app.errors.generic };

  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  if (!profile) return { error: app.errors.generic };

  let url = '';
  try {
    url = await createCheckoutSession(supabase, profile, tier as CheckoutTarget);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : app.errors.generic };
  }

  redirect(url);
}

export async function portalAction(_state: ActionState): Promise<ActionState> {
  if (!billingEnabled()) return { error: app.billing.disabled };

  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  if (!profile) return { error: app.errors.generic };

  let url = '';
  try {
    url = await createPortalSession(profile);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : app.errors.generic };
  }

  redirect(url);
}
