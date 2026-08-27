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
  demoBotKey: optional(process.env.NEXT_PUBLIC_DEMO_BOT_KEY),
};

export function supabaseEnv() {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function supabaseAdminEnv() {
  return {
    ...supabaseEnv(),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

export function geminiEnv() {
  return { apiKey: required('GEMINI_API_KEY', process.env.GEMINI_API_KEY) };
}

export function stripeEnv() {
  return {
    secretKey: optional(process.env.STRIPE_SECRET_KEY),
    webhookSecret: optional(process.env.STRIPE_WEBHOOK_SECRET),
    pricePro: optional(process.env.STRIPE_PRICE_PRO),
    priceBusiness: optional(process.env.STRIPE_PRICE_BUSINESS),
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
