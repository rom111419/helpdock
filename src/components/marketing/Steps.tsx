import { marketing } from '@/config/strings';

export function Steps() {
  const { title, items } = marketing.steps;

  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-18 lg:py-24">
      <h2 className="display text-3xl leading-tight lg:text-4xl">{title}</h2>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.title} className="card p-6">
            <span className="display flex size-9 items-center justify-center rounded-full bg-accent-soft text-lg text-accent">
              {index + 1}
            </span>
            <h3 className="mt-5 text-lg font-medium">{item.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
