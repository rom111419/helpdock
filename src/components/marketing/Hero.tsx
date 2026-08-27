import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { marketing } from '@/config/strings';
import { ChatPreview } from '@/components/marketing/ChatPreview';

export function Hero() {
  const { eyebrow, title, subtitle, primary, secondary, note } = marketing.hero;

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-28">
      <div>
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-medium tracking-wide text-accent uppercase">
          {eyebrow}
        </p>
        <h1 className="display mt-6 text-[2.6rem] leading-[1.06] sm:text-5xl lg:text-[3.5rem]">{title}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{subtitle}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/login?mode=signup" className="btn btn-primary px-5 py-3">
            {primary}
            <ArrowRight size={16} />
          </Link>
          <a href="#how" className="btn btn-ghost px-5 py-3">{secondary}</a>
        </div>

        <p className="mt-4 text-sm text-muted">{note}</p>
      </div>

      <ChatPreview />
    </section>
  );
}
