import type { FullConfig } from '@playwright/test';

const ROUTES = ['/', '/login', '/app', '/app/billing', '/embed/warmup'];
const PER_ROUTE_TIMEOUT_MS = 120_000;

export default async function warmRoutes(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  for (const route of ROUTES) {
    try {
      await fetch(new URL(route, baseURL), {
        redirect: 'manual',
        signal: AbortSignal.timeout(PER_ROUTE_TIMEOUT_MS),
      });
    } catch {
      continue;
    }
  }
}
