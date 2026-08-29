import { expect, test } from '@playwright/test';
import { app, auth } from '../src/config/strings';

const PASSWORD = 'aaaabbbbcccc';

const KNOWLEDGE = [
  'Northline Supply shipping and returns.',
  '',
  'Orders with the code NL-7788 are dispatched from the Vilnius warehouse and take exactly nine working days to arrive, because they are assembled to order.',
  '',
  'All other orders inside the European Union arrive in two to four working days. Returns are accepted within thirty days if the boots are unworn, and return shipping inside the European Union is paid by Northline Supply.',
].join('\n');

test.describe.configure({ mode: 'serial' });

test('a text source indexes, the chat answers from it, and the widget answers the same', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(`rag${Date.now()}@example.com`);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');
  const botId = page.url().split('/app/')[1].split('/')[0];

  await page.getByRole('button', { name: 'text' }).click();
  await page.getByPlaceholder(app.sources.textTitlePlaceholder).fill('Shipping and returns');
  await page.locator('textarea[name="body"]').fill(KNOWLEDGE);
  await page.getByRole('button', { name: app.sources.add }).click();

  await expect(page.getByText(app.sources.status.ready)).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(app.sources.chunks, { exact: false })).toBeVisible();

  await page.goto(`/app/${botId}/chat`);
  await page.getByPlaceholder(app.chat.placeholder).fill('How long does an NL-7788 order take to arrive?');
  await page.getByRole('button', { name: app.chat.send }).click();

  const answer = page.locator('main p').filter({ hasText: /nine|9/i }).first();
  await expect(answer).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(app.chat.sources)).toBeVisible();
  await expect(page.getByText('Shipping and returns').first()).toBeVisible();

  await page.goto(`/app/${botId}/embed`);
  const snippet = await page.locator('pre code').innerText();
  const publicKey = snippet.match(/data-helpdock="([0-9a-f]{32})"/)?.[1];
  expect(publicKey).toBeTruthy();

  await page.goto(`/embed/${publicKey}`);
  await page.getByPlaceholder('Ask a question…').fill('How many days for order NL-7788?');
  await page.getByRole('button', { name: app.chat.send }).click();
  await expect(page.locator('p').filter({ hasText: /nine|9/i }).first()).toBeVisible({ timeout: 60_000 });
});

test('the chat refuses to answer what the documents do not cover', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(`gap${Date.now()}@example.com`);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');
  const botId = page.url().split('/app/')[1].split('/')[0];

  await page.getByRole('button', { name: 'text' }).click();
  await page.getByPlaceholder(app.sources.textTitlePlaceholder).fill('Shipping and returns');
  await page.locator('textarea[name="body"]').fill(KNOWLEDGE);
  await page.getByRole('button', { name: app.sources.add }).click();
  await expect(page.getByText(app.sources.status.ready)).toBeVisible({ timeout: 60_000 });

  await page.goto(`/app/${botId}/chat`);
  await page.getByPlaceholder(app.chat.placeholder).fill('Who is the chief executive of Northline Supply?');
  await page.getByRole('button', { name: app.chat.send }).click();

  const refusal = page.locator('main p').filter({ hasText: /do not have|don't have|not have that information|cannot|contact/i }).first();
  await expect(refusal).toBeVisible({ timeout: 60_000 });
});

test('a PDF and a web page both reach the ready state', async ({ page, baseURL }) => {
  test.setTimeout(180_000);

  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(`ingest${Date.now()}@example.com`);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');
  const botId = page.url().split('/app/')[1].split('/')[0];

  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/shipping-and-delivery.pdf');
  await page.getByRole('button', { name: app.sources.add }).click();
  await expect(page.getByText('shipping-and-delivery.pdf')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByText(app.sources.status.ready)).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', { name: 'url' }).click();
  await page.getByPlaceholder(app.sources.urlPlaceholder).fill(`${baseURL}/storefront-demo.html`);
  await page.getByRole('button', { name: app.sources.add }).click();
  await expect(page.getByText(app.sources.status.ready)).toHaveCount(2, { timeout: 90_000 });

  await page.goto(`/app/${botId}/chat`);
  await page.getByPlaceholder(app.chat.placeholder).fill('How long does delivery to Norway take?');
  await page.getByRole('button', { name: app.chat.send }).click();
  await expect(
    page.locator('main p').filter({ hasText: /five to seven|5 to 7|5-7/i }).first(),
  ).toBeVisible({ timeout: 90_000 });
});

test('the script tag mounts the widget on a third-party page and it answers there', async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto('/login?mode=signup');
  await page.getByLabel(auth.email).fill(`embed${Date.now()}@example.com`);
  await page.getByLabel(auth.password).fill(PASSWORD);
  await page.getByRole('button', { name: auth.signUp }).click();
  await page.waitForURL('**/app');

  await page.getByRole('button', { name: app.bots.create }).click();
  await page.getByLabel(app.bots.nameLabel).fill('Northline Supply');
  await page.getByRole('button', { name: app.bots.submit }).click();
  await page.waitForURL('**/sources');
  const botId = page.url().split('/app/')[1].split('/')[0];

  await page.getByRole('button', { name: 'text' }).click();
  await page.getByPlaceholder(app.sources.textTitlePlaceholder).fill('Shipping and returns');
  await page.locator('textarea[name="body"]').fill(KNOWLEDGE);
  await page.getByRole('button', { name: app.sources.add }).click();
  await expect(page.getByText(app.sources.status.ready)).toBeVisible({ timeout: 90_000 });

  await page.goto(`/app/${botId}/embed`);
  const snippet = await page.locator('pre code').innerText();
  const publicKey = snippet.match(/data-helpdock="([0-9a-f]{32})"/)?.[1];
  expect(publicKey).toBeTruthy();

  await page.goto(`/storefront-demo.html?key=${publicKey}`);
  await expect(page.getByRole('heading', { name: /Built for the trail/i })).toBeVisible();

  const launcher = page.getByRole('button', { name: 'Open chat' });
  await expect(launcher).toBeVisible({ timeout: 20_000 });
  await launcher.click();

  const widget = page.frameLocator('iframe[title="Helpdock chat"]');
  await widget.getByPlaceholder('Ask a question…').fill('How many days for an NL-7788 order?');
  await widget.getByRole('button', { name: app.chat.send }).click();
  await expect(widget.locator('p').filter({ hasText: /nine|9/i }).first()).toBeVisible({ timeout: 90_000 });
  await expect(widget.getByText('Powered by Helpdock')).toBeVisible();
});
