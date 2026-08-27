import { brand, marketing } from '@/config/strings';
import { Logo } from '@/components/Logo';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-paper/10 px-5 py-8 text-sm">
        <span className="flex items-center gap-2">
          <Logo size={16} />
          <span className="display text-paper">{brand.name}</span>
        </span>
        <span>{marketing.footer.rights}</span>
      </div>
    </footer>
  );
}
