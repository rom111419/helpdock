export function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const ratio = limit === 0 ? 0 : Math.min(1, used / limit);

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {used.toLocaleString('en-US')} / {limit.toLocaleString('en-US')}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className={ratio >= 1 ? 'h-full bg-danger' : 'h-full bg-accent'}
          style={{ width: `${Math.max(2, ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
