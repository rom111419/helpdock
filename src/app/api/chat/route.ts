import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { loadBot } from '@/services/botService';
import { answerStream, checkAnswerQuota } from '@/services/answerService';

const STREAM_HEADERS = {
  'content-type': 'application/x-ndjson; charset=utf-8',
  'cache-control': 'no-store',
};

const bodySchema = z.object({
  botId: z.uuid(),
  question: z.string().trim().min(1).max(2000),
  conversationId: z.uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const bot = await loadBot(supabase, parsed.data.botId);
  if (!bot) return NextResponse.json({ error: 'Chatbot not found.' }, { status: 404 });

  const verdict = await checkAnswerQuota(supabase, bot.owner_id);
  if (verdict.rejection) return NextResponse.json({ error: verdict.rejection.reason }, { status: 402 });

  const stream = await answerStream(supabase, {
    bot,
    question: parsed.data.question,
    conversationId: parsed.data.conversationId ?? null,
    channel: 'app',
    visitorLabel: data.user.email ?? '',
    personaAllowed: verdict.personaAllowed,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
