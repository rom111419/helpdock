function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function optional(value: string | undefined): string {
  return value ?? '';
}

export const publicEnv = {
  supabaseUrl: optional(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  stripePublishableKey: optional(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
};

export function serverEnv() {
  return {
    supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
    geminiApiKey: required('GEMINI_API_KEY', process.env.GEMINI_API_KEY),
    stripeSecretKey: optional(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: optional(process.env.STRIPE_WEBHOOK_SECRET),
    stripePricePro: optional(process.env.STRIPE_PRICE_PRO),
    stripePriceBusiness: optional(process.env.STRIPE_PRICE_BUSINESS),
    siteUrl: publicEnv.siteUrl,
  };
}

export const models = {
  chat: 'gemini-2.5-flash',
  embedding: 'gemini-embedding-001',
  embeddingDimensions: 768,
};

export const retrieval = {
  chunkChars: 1_200,
  chunkOverlap: 160,
  minChunkChars: 80,
  topK: 6,
  minSimilarity: 0.35,
};
