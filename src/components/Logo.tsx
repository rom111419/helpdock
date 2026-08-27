export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="21" height="14" rx="4" className="fill-accent" />
      <path d="M8 20.5l3.2-3.5h4.3" className="stroke-accent" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8.6h10M7 12.4h6.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
