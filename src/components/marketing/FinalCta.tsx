import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { marketing } from '@/config/strings';

export function FinalCta() {
  const { title, body, button } = marketing.finalCta;

  return (
    <section className="border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center lg:py-24">
        <h2 className="display mx-auto max-w-2xl text-3xl leading-tight lg:text-4xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper/70">{body}</p>
        <Link href="/login?mode=signup" className="btn btn-primary mt-9 px-6 py-3">
          {button}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
