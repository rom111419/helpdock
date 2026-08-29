import Stripe from 'stripe';
import { PAID_TIERS, PLANS } from '../src/config/plans.ts';

const LOOKUP_PREFIX = 'helpdock_';
const CURRENCY = 'usd';

function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required.');
  if (!key.startsWith('sk_test_')) {
    throw new Error('Refusing to run: this script only ever touches a Stripe test-mode account.');
  }
  return new Stripe(key);
}

async function ensurePrice(stripe: Stripe, tier: 'pro' | 'business'): Promise<string> {
  const plan = PLANS[tier];
  const lookupKey = `${LOOKUP_PREFIX}${tier}_monthly`;

  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  if (existing.data[0]) {
    process.stdout.write(`${plan.name}: reusing ${existing.data[0].id}\n`);
    return existing.data[0].id;
  }

  const product = await stripe.products.create({
    name: `Helpdock ${plan.name}`,
    description: plan.tagline,
    metadata: { tier },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount: plan.priceUsd * 100,
    recurring: { interval: 'month' },
    lookup_key: lookupKey,
    metadata: { tier },
  });

  process.stdout.write(`${plan.name}: created ${price.id}\n`);
  return price.id;
}

const stripe = client();
const ids: Record<string, string> = {};
for (const tier of PAID_TIERS) {
  if (tier === 'free') continue;
  ids[tier] = await ensurePrice(stripe, tier);
}

process.stdout.write('\nAdd these to .env.local:\n');
process.stdout.write(`STRIPE_PRICE_PRO=${ids.pro}\n`);
process.stdout.write(`STRIPE_PRICE_BUSINESS=${ids.business}\n`);
