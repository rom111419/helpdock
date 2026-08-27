import { expect, test } from '@playwright/test';
import { marketing, brand } from '../src/config/strings';
import { PLAN_ORDER, PLANS } from '../src/config/plans';

test('landing states the offer, the steps and every plan', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(marketing.hero.title);
  await expect(page.getByRole('heading', { name: marketing.steps.title })).toBeVisible();

  for (const tier of PLAN_ORDER) {
    await expect(page.getByRole('heading', { name: PLANS[tier].name, exact: true })).toBeVisible();
  }

  await expect(page.getByText(brand.name).first()).toBeVisible();
});

test('landing has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
