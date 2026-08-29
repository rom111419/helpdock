import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { app, auth, widget } from '../src/config/strings';
import { PLANS } from '../src/config/plans';
import { applySubscriptionEvent } from '../src/services/billingService';

const PASSWORD = 'aaaabbbbcccc';

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin credentials are required for the billing tests.');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function signUpAndCreateBot(page: import('@playwright/test').Page, prefix: string) {
  const email = `${prefix}${Date.now()}@example.com`;
  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(email);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');
  return { email, botId: page.url().split('/app/')[1].split('/')[0] };
}

test('the free plan locks the inbox, the tone of voice and hides nothing from the badge', async ({ page }) => {
  const { botId } = await signUpAndCreateBot(page, 'free');

  await page.goto(`/app/${botId}/inbox`);
  await expect(page.getByText(app.inbox.locked)).toBeVisible();

  await page.goto(`/app/${botId}/embed`);
  await expect(page.locator('textarea[name="persona"]')).toBeDisabled();

  const snippet = await page.locator('pre code').innerText();
  const publicKey = snippet.match(/data-helpdock="([0-9a-f]{32})"/)?.[1];
  await page.goto(`/embed/${publicKey}`);
  await expect(page.getByText(widget.poweredBy)).toBeVisible();
});

test('moving the profile to Pro unlocks the inbox, the tone of voice and removes the badge', async ({ page }) => {
  const { email, botId } = await signUpAndCreateBot(page, 'pro');

  const supabase = admin();
  const { error } = await supabase.from('profiles').update({ plan: 'pro' }).eq('email', email);
  expect(error).toBeNull();

  await page.goto(`/app/${botId}/inbox`);
  await expect(page.getByText(app.inbox.locked)).toBeHidden();
  await expect(page.getByRole('heading', { name: app.inbox.title })).toBeVisible();

  await page.goto(`/app/${botId}/embed`);
  await expect(page.locator('textarea[name="persona"]')).toBeEnabled();

  const snippet = await page.locator('pre code').innerText();
  const publicKey = snippet.match(/data-helpdock="([0-9a-f]{32})"/)?.[1];
  await page.goto(`/embed/${publicKey}`);
  await expect(page.getByText(widget.poweredBy)).toBeHidden();

  await page.goto('/app/billing');
  await expect(page.getByText(PLANS.pro.name, { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(PLANS.pro.limits.answersPerMonth.toLocaleString('en-US'), { exact: false }).first(),
  ).toBeVisible();
});

test('the subscription webhook moves a profile onto a plan and back off it', async ({ page }) => {
  const { email } = await signUpAndCreateBot(page, 'hook');

  const supabase = admin();
  const { data: profile } = await supabase.from('profiles').select('id, plan').eq('email', email).single();
  expect(profile?.plan).toBe('free');

  const periodEnd = Math.floor(Date.parse('2027-01-01T00:00:00Z') / 1000);
  const subscription = {
    id: `sub_test_${Date.now()}`,
    status: 'active',
    metadata: { profile_id: profile?.id, tier: 'business' },
    items: { data: [{ current_period_end: periodEnd }] },
  };

  await applySubscriptionEvent(supabase, subscription as never);

  const { data: upgraded } = await supabase
    .from('profiles')
    .select('plan, stripe_subscription_id, plan_renews_at')
    .eq('email', email)
    .single();
  expect(upgraded?.plan).toBe('business');
  expect(upgraded?.stripe_subscription_id).toBe(subscription.id);
  expect(upgraded?.plan_renews_at).toContain('2027-01-01');

  await applySubscriptionEvent(supabase, { ...subscription, status: 'canceled' } as never);

  const { data: cancelled } = await supabase
    .from('profiles')
    .select('plan, plan_renews_at')
    .eq('email', email)
    .single();
  expect(cancelled?.plan).toBe('free');
  expect(cancelled?.plan_renews_at).toBeNull();
});
