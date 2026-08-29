import { expect, test } from '@playwright/test';
import { app, auth } from '../src/config/strings';
import { PLANS } from '../src/config/plans';

const PASSWORD = 'helpdock-demo-1234';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${process.env.TEST_RUN_ID ?? ''}${Math.floor(Math.random() * 1e9)}@example.com`;
}

async function signUp(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(uniqueEmail('owner'));
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');
}

test('a new account signs up, lands on an empty dashboard and creates a chatbot', async ({ page }) => {
  await signUp(page);

  await expect(page.getByRole('heading', { name: app.bots.title })).toBeVisible();
  await expect(page.getByText(app.bots.empty)).toBeVisible();

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByLabel(app.bots.welcomeLabel).fill('Hi! Ask me about shipping or returns.');
  await page.getByRole('button', { name: app.bots.submit }).click();

  await page.waitForURL('**/sources');
  await expect(page.getByRole('heading', { name: 'Northline Supply' })).toBeVisible();
  await expect(page.getByText(app.sources.empty)).toBeVisible();
});

test('the free plan refuses a second chatbot and offers the upgrade', async ({ page }) => {
  await signUp(page);

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('First bot');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');

  await page.goto('/app');
  const limit = PLANS.free.limits.chatbots;
  await expect(page.getByText(`${limit} / ${limit}`, { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: app.bots.create })).toBeHidden();
  await expect(page.getByRole('link', { name: app.inbox.lockedCta })).toBeVisible();
});

test('signing out returns to the landing page and protects the app', async ({ page }) => {
  await signUp(page);

  await page.getByRole('button', { name: app.nav.signOut }).click();
  await page.waitForURL('**/');

  await page.goto('/app');
  await page.waitForURL('**/login**');
});
