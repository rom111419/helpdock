import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

function loadLocalEnv(): void {
  let contents = '';
  try {
    contents = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  } catch {
    return;
  }
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at < 1) continue;
    const key = trimmed.slice(0, at);
    if (process.env[key]) continue;
    process.env[key] = trimmed.slice(at + 1).replace(/^"(.*)"$/, '$1');
  }
}

loadLocalEnv();

const PORT = Number(process.env.E2E_PORT ?? 3187);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  tsconfig: './tsconfig.json',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
