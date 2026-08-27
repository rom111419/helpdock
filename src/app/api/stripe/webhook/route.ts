import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { applySubscriptionEvent, constructEvent } from '@/services/billingService';

const HANDLED = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = constructEvent(await request.text(), signature);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Invalid signature.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (HANDLED.has(event.type)) {
    await applySubscriptionEvent(createAdminClient(), event.data.object as Stripe.Subscription);
  }

  return NextResponse.json({ received: true });
}
