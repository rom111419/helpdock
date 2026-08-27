import Script from 'next/script';
import { publicEnv } from '@/config/env';

export function DemoWidget() {
  if (!publicEnv.demoBotKey) return null;

  return (
    <Script
      src="/widget.js"
      data-helpdock={publicEnv.demoBotKey}
      data-accent="#c2410c"
      strategy="afterInteractive"
    />
  );
}
