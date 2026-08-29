import { expect, test } from '@playwright/test';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { app, auth, marketing } from '../src/config/strings';
import { PLANS } from '../src/config/plans';

const PASSWORD = 'aaaabbbbcccc';
const TEST_CARD = '4242424242424242';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin credentials are required.');
  return createClient(url, key, { auth: { persistSession: false } });
}

function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required.');
  return new Stripe(key);
}

async function signUp(page: import('@playwright/test').Page, prefix: string): Promise<string> {
  const email = `${prefix}${Date.now()}@example.com`;
  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(email);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');
  return email;
}

test('upgrading opens a real Stripe checkout for the Pro price', async ({ page }) => {
  test.setTimeout(120_000);
  await signUp(page, 'checkout');

  await page.goto('/app/billing');
  await page.getByRole('button', { name: marketing.pricing.cta.paid }).first().click();

  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  await expect(page.getByText(`$${PLANS.pro.priceUsd}`).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`Helpdock ${PLANS.pro.name}`).first()).toBeVisible();
});

test('the webhook endpoint verifies a signed event and moves the profile onto the plan', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const email = await signUp(page, 'hookroute');

  const supabase = admin();
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
  expect(profile?.id).toBeTruthy();

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is required.');

  const payload = JSON.stringify({
    id: 'evt_test_helpdock',
    object: 'event',
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: `sub_test_${Date.now()}`,
        object: 'subscription',
        status: 'active',
        metadata: { profile_id: profile?.id, tier: 'pro' },
        items: { data: [{ current_period_end: Math.floor(Date.parse('2027-03-01T00:00:00Z') / 1000) }] },
      },
    },
  });

  const header = stripe().webhooks.generateTestHeaderString({ payload, secret });
  const response = await request.post('/api/stripe/webhook', {
    headers: { 'stripe-signature': header, 'content-type': 'application/json' },
    data: payload,
  });
  expect(response.status()).toBe(200);

  const { data: upgraded } = await supabase.from('profiles').select('plan').eq('email', email).single();
  expect(upgraded?.plan).toBe('pro');

  await page.goto('/app/billing');
  await expect(page.getByText(app.inbox.locked)).toBeHidden();
  await expect(page.getByText(PLANS.pro.name, { exact: true }).first()).toBeVisible();
});

test('the webhook endpoint rejects an unsigned event', async ({ request }) => {
  const response = await request.post('/api/stripe/webhook', {
    headers: { 'content-type': 'application/json' },
    data: JSON.stringify({ type: 'customer.subscription.updated' }),
  });
  expect(response.status()).toBe(400);
});

test('paying with the test card completes the upgrade end to end', async ({ page }) => {
  test.setTimeout(240_000);
  const email = await signUp(page, 'pay');

  await page.goto('/app/billing');
  await page.getByRole('button', { name: marketing.pricing.cta.paid }).first().click();
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });

  const emailField = page.locator('#email');
  if (await emailField.isEditable().catch(() => false)) await emailField.fill(email);

  await page.locator('#cardNumber').fill(TEST_CARD);
  await page.locator('#cardExpiry').fill('12/34');
  await page.locator('#cardCvc').fill('123');

  const name = page.locator('#billingName');
  if (await name.isVisible().catch(() => false)) await name.fill('Northline Supply');

  const postal = page.locator('#billingPostalCode');
  if (await postal.isVisible().catch(() => false)) await postal.fill('10001');

  await page.locator('.SubmitButton, [data-testid="hosted-payment-submit-button"]').first().click();

  await page.waitForURL(/\/app\/billing\?upgraded=pro/, { timeout: 120_000 });
  await expect(page.getByText(app.billing.upgraded)).toBeVisible();

  const supabase = admin();
  await expect
    .poll(
      async () => {
        const { data } = await supabase.from('profiles').select('plan').eq('email', email).single();
        return data?.plan;
      },
      { timeout: 90_000, intervals: [2_000] },
    )
    .toBe('pro');

  await page.reload();
  await expect(page.getByText(PLANS.pro.limits.answersPerMonth.toLocaleString('en-US'), { exact: false }).first()).toBeVisible();
});
