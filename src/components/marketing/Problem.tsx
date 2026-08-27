import { marketing } from '@/config/strings';

export function Problem() {
  const { title, body, stats } = marketing.problem;

  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <h2 className="display text-3xl leading-tight lg:text-4xl">{title}</h2>
          <p className="text-lg leading-relaxed text-muted">{body}</p>
        </div>

        <dl className="mt-14 grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-t-2 border-accent pt-4">
              <dt className="display text-4xl">{stat.value}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
