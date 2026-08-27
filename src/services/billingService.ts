import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { stripeEnv } from '@/config/env';
import { PLANS, type PlanTier } from '@/config/plans';
import type { Profile } from '@/lib/supabase/types';

export type CheckoutTarget = Extract<PlanTier, 'pro' | 'business'>;

export function billingEnabled(): boolean {
  return Boolean(stripeEnv().secretKey);
}

function stripe(): Stripe {
  return new Stripe(stripeEnv().secretKey);
}

function priceIdFor(tier: CheckoutTarget): string {
  const env = stripeEnv();
  const priceId = tier === 'pro' ? env.pricePro : env.priceBusiness;
  if (!priceId) throw new Error(`No Stripe price configured for the ${PLANS[tier].name} plan.`);
  return priceId;
}

async function customerIdFor(client: SupabaseClient, profile: Profile): Promise<string> {
  if (profile.stripe_customer_id) return profile.stripe_customer_id;
  const customer = await stripe().customers.create({
    email: profile.email,
    metadata: { profile_id: profile.id },
  });
  await client.from('profiles').update({ stripe_customer_id: customer.id }).eq('id', profile.id);
  return customer.id;
}

export async function createCheckoutSession(
  client: SupabaseClient,
  profile: Profile,
  tier: CheckoutTarget,
): Promise<string> {
  const env = stripeEnv();
  const customer = await customerIdFor(client, profile);
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: priceIdFor(tier), quantity: 1 }],
    success_url: `${env.siteUrl}/app/billing?upgraded=${tier}`,
    cancel_url: `${env.siteUrl}/app/billing`,
    subscription_data: { metadata: { profile_id: profile.id, tier } },
    metadata: { profile_id: profile.id, tier },
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL.');
  return session.url;
}

export async function createPortalSession(profile: Profile): Promise<string> {
  if (!profile.stripe_customer_id) throw new Error('This account has no billing history yet.');
  const session = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${stripeEnv().siteUrl}/app/billing`,
  });
  return session.url;
}

export function constructEvent(payload: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(payload, signature, stripeEnv().webhookSecret);
}

function tierFromMetadata(metadata: Stripe.Metadata | null): PlanTier {
  const tier = metadata?.tier;
  return tier === 'pro' || tier === 'business' ? tier : 'free';
}

export async function applySubscriptionEvent(
  client: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const profileId = subscription.metadata?.profile_id;
  if (!profileId) return;

  const active = subscription.status === 'active' || subscription.status === 'trialing';
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;

  await client
    .from('profiles')
    .update({
      plan: active ? tierFromMetadata(subscription.metadata) : 'free',
      stripe_subscription_id: subscription.id,
      plan_renews_at: active && periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq('id', profileId);
}
