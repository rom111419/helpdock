import Link from 'next/link';
import { brand, app } from '@/config/strings';
import { PLANS } from '@/config/plans';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { loadProfile } from '@/services/quotaService';
import { signOut } from '@/app/app/actions';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  const plan = PLANS[profile?.plan ?? 'free'];

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link href="/app" className="flex items-center gap-2">
            <Logo />
            <span className="display text-lg">{brand.name}</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm text-muted">
            <Link href="/app" className="hover:text-ink">{app.nav.bots}</Link>
            <Link href="/app/billing" className="hover:text-ink">{app.nav.billing}</Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/app/billing"
              className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
            >
              {plan.name}
            </Link>
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-muted hover:text-ink">
                {app.nav.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
