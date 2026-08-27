import { SiteNav } from '@/components/marketing/SiteNav';
import { Hero } from '@/components/marketing/Hero';
import { Problem } from '@/components/marketing/Problem';
import { Steps } from '@/components/marketing/Steps';
import { Features } from '@/components/marketing/Features';
import { PricingTable } from '@/components/marketing/PricingTable';
import { FinalCta } from '@/components/marketing/FinalCta';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { DemoWidget } from '@/components/marketing/DemoWidget';
import { currentUser } from '@/lib/session';

export default async function LandingPage() {
  const user = await currentUser();
  const signedIn = Boolean(user);

  return (
    <>
      <SiteNav signedIn={signedIn} />
      <main>
        <Hero />
        <Problem />
        <Steps />
        <Features />
        <PricingTable signedIn={signedIn} />
        <FinalCta />
      </main>
      <SiteFooter />
      <DemoWidget />
    </>
  );
}
