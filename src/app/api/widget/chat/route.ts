import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { loadBotByPublicKey } from '@/services/botService';
import { answerStream, checkAnswerQuota } from '@/services/answerService';
import { allow } from '@/services/rateLimitService';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

const STREAM_HEADERS = {
  ...CORS,
  'content-type': 'application/x-ndjson; charset=utf-8',
  'cache-control': 'no-store',
};

const bodySchema = z.object({
  publicKey: z.string().regex(/^[0-9a-f]{32}$/),
  question: z.string().trim().min(1).max(2000),
  conversationId: z.uuid().nullable().optional(),
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: CORS });
  }

  const visitor = request.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!allow(`${parsed.data.publicKey}:${visitor}`)) {
    return NextResponse.json({ error: 'Too many questions, slow down.' }, { status: 429, headers: CORS });
  }

  const supabase = createAdminClient();
  const bot = await loadBotByPublicKey(supabase, parsed.data.publicKey);
  if (!bot) return NextResponse.json({ error: 'Chatbot not found.' }, { status: 404, headers: CORS });

  const verdict = await checkAnswerQuota(supabase, bot.owner_id);
  if (verdict.rejection) {
    return NextResponse.json({ error: verdict.rejection.reason }, { status: 402, headers: CORS });
  }

  const stream = await answerStream(supabase, {
    bot,
    question: parsed.data.question,
    conversationId: parsed.data.conversationId ?? null,
    channel: 'widget',
    visitorLabel: request.headers.get('referer') ?? '',
    personaAllowed: verdict.personaAllowed,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
