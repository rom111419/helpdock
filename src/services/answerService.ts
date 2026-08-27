import type { SupabaseClient } from '@supabase/supabase-js';
import type { ChatChannel, Chatbot, Citation } from '@/lib/supabase/types';
import { emptyKnowledgeReply, streamAnswer, type ChatTurn } from '@/services/chatService';
import { retrieveContext } from '@/services/retrievalService';
import { appendMessage, loadHistory, openConversation } from '@/services/conversationService';
import { canAnswer, loadProfile, loadUsage } from '@/services/quotaService';

export type AnswerRequest = {
  bot: Chatbot;
  question: string;
  conversationId: string | null;
  channel: ChatChannel;
  visitorLabel: string;
  personaAllowed: boolean;
};

export type AnswerRejection = { reason: string };

const ENCODER = new TextEncoder();
const UNAVAILABLE = 'This chatbot is not available.';

function line(payload: Record<string, unknown>): Uint8Array {
  return ENCODER.encode(`${JSON.stringify(payload)}\n`);
}

export type QuotaVerdict = { rejection: AnswerRejection | null; personaAllowed: boolean };

export async function checkAnswerQuota(
  client: SupabaseClient,
  ownerId: string,
): Promise<QuotaVerdict> {
  const profile = await loadProfile(client, ownerId);
  if (!profile) return { rejection: { reason: UNAVAILABLE }, personaAllowed: false };
  const usage = await loadUsage(client, ownerId, profile.plan);
  const check = canAnswer(usage);
  return {
    rejection: check.allowed ? null : { reason: check.reason },
    personaAllowed: usage.plan.features.customPersona,
  };
}

export async function answerStream(
  client: SupabaseClient,
  request: AnswerRequest,
): Promise<ReadableStream<Uint8Array>> {
  const { bot, question, conversationId, channel, visitorLabel, personaAllowed } = request;

  const conversation = await openConversation(
    client,
    bot.owner_id,
    bot.id,
    channel,
    conversationId,
    visitorLabel,
  );

  const previous = await loadHistory(client, conversation.id);
  const history: ChatTurn[] = previous.map((message) => ({ role: message.role, content: message.content }));

  await appendMessage(client, bot.owner_id, conversation.id, 'user', question, []);

  const context = await retrieveContext(client, bot.id, question);
  const citations: Citation[] = context.passages.length ? context.citations : [];

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(line({ type: 'conversation', conversationId: conversation.id }));
      controller.enqueue(line({ type: 'citations', citations }));

      let answer = '';
      try {
        if (context.passages.length === 0) {
          answer = emptyKnowledgeReply();
          controller.enqueue(line({ type: 'delta', text: answer }));
        } else {
          const stream = await streamAnswer(history, question, personaAllowed ? bot.persona : '', context);
          for await (const delta of stream) {
            answer += delta;
            controller.enqueue(line({ type: 'delta', text: delta }));
          }
        }
        await appendMessage(client, bot.owner_id, conversation.id, 'assistant', answer, citations);
        controller.enqueue(line({ type: 'done' }));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'The assistant failed to answer.';
        controller.enqueue(line({ type: 'error', message }));
      } finally {
        controller.close();
      }
    },
  });
}
