import { GoogleGenAI } from '@google/genai';
import { models, serverEnv } from '@/config/env';
import type { RetrievedContext } from '@/services/retrievalService';

export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

const BASE_INSTRUCTION = [
  'You are a customer support assistant for an online store.',
  'Answer only from the knowledge passages provided below.',
  'If the passages do not contain the answer, say plainly that you do not have that information and suggest contacting the store team. Never invent policies, prices, delivery times or order details.',
  'Be concise: two to four sentences unless the customer asks for steps. Use plain language a shopper understands.',
  'Never mention the passages, the knowledge base or that you are an AI model.',
].join(' ');

const NO_KNOWLEDGE_REPLY =
  'I do not have anything in my knowledge base yet, so I cannot answer that. Please add a document or reach out to the store team.';

function buildInstruction(persona: string, context: RetrievedContext): string {
  const tone = persona.trim() ? `\n\nTone of voice set by the store owner: ${persona.trim()}` : '';
  const passages = context.passages.length
    ? context.passages.map((passage, index) => `Passage ${index + 1}:\n${passage}`).join('\n\n')
    : 'No passages matched this question.';
  return `${BASE_INSTRUCTION}${tone}\n\nKnowledge passages:\n${passages}`;
}

export function emptyKnowledgeReply(): string {
  return NO_KNOWLEDGE_REPLY;
}

export async function streamAnswer(
  history: ChatTurn[],
  question: string,
  persona: string,
  context: RetrievedContext,
): Promise<AsyncGenerator<string>> {
  const ai = new GoogleGenAI({ apiKey: serverEnv().geminiApiKey });
  const leading = history.findIndex((turn) => turn.role === 'user');
  const usable = leading === -1 ? [] : history.slice(leading);
  const contents = [...usable, { role: 'user' as const, content: question }].map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }],
  }));

  const stream = await ai.models.generateContentStream({
    model: models.chat,
    contents,
    config: {
      systemInstruction: buildInstruction(persona, context),
      temperature: 0.2,
      maxOutputTokens: 800,
    },
  });

  return (async function* () {
    for await (const part of stream) {
      const text = part.text;
      if (text) yield text;
    }
  })();
}
