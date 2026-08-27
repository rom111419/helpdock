import Link from 'next/link';
import { brand, marketing } from '@/config/strings';
import { Logo } from '@/components/Logo';

export function SiteNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="display text-lg">{brand.name}</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-muted md:flex">
          <a href="#how" className="hover:text-ink">{marketing.nav.howItWorks}</a>
          <a href="#pricing" className="hover:text-ink">{marketing.nav.pricing}</a>
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link href="/app" className="btn btn-primary px-4 py-2 text-sm">{marketing.nav.dashboard}</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-ink">{marketing.nav.signIn}</Link>
              <Link href="/login?mode=signup" className="btn btn-primary px-4 py-2 text-sm">
                {marketing.nav.start}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
