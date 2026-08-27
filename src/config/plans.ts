export type PlanTier = 'free' | 'pro' | 'business';

export type PlanLimits = {
  chatbots: number;
  sourceChars: number;
  answersPerMonth: number;
};

export type PlanFeatures = {
  removeBadge: boolean;
  conversationHistory: boolean;
  customPersona: boolean;
};

export type Plan = {
  tier: PlanTier;
  name: string;
  priceUsd: number;
  tagline: string;
  limits: PlanLimits;
  features: PlanFeatures;
  highlights: string[];
};

export const PLANS: Record<PlanTier, Plan> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceUsd: 0,
    tagline: 'Point it at your returns policy and see what it can do.',
    limits: { chatbots: 1, sourceChars: 50_000, answersPerMonth: 50 },
    features: { removeBadge: false, conversationHistory: false, customPersona: false },
    highlights: [
      '1 chatbot',
      '50,000 characters of knowledge',
      '50 answers per month',
      'Embeddable widget with Helpdock badge',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    priceUsd: 29,
    tagline: 'For a single store that answers the same questions all day.',
    limits: { chatbots: 3, sourceChars: 2_000_000, answersPerMonth: 2_000 },
    features: { removeBadge: true, conversationHistory: true, customPersona: true },
    highlights: [
      '3 chatbots',
      '2,000,000 characters of knowledge',
      '2,000 answers per month',
      'Your branding, no Helpdock badge',
      'Customer questions inbox',
      'Custom tone of voice',
    ],
  },
  business: {
    tier: 'business',
    name: 'Business',
    priceUsd: 99,
    tagline: 'For agencies and groups running several storefronts.',
    limits: { chatbots: 10, sourceChars: 10_000_000, answersPerMonth: 10_000 },
    features: { removeBadge: true, conversationHistory: true, customPersona: true },
    highlights: [
      '10 chatbots',
      '10,000,000 characters of knowledge',
      '10,000 answers per month',
      'Your branding, no Helpdock badge',
      'Customer questions inbox',
      'Custom tone of voice',
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = ['free', 'pro', 'business'];

export const PAID_TIERS: PlanTier[] = ['pro', 'business'];

export function planFor(tier: PlanTier): Plan {
  return PLANS[tier];
}
