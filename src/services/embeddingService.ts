import { GoogleGenAI } from '@google/genai';
import { models, geminiEnv } from '@/config/env';

const DOCUMENT_TASK = 'RETRIEVAL_DOCUMENT';
const QUERY_TASK = 'RETRIEVAL_QUERY';
const BATCH_SIZE = 32;

function client(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: geminiEnv().apiKey });
}

async function embed(texts: string[], taskType: string): Promise<number[][]> {
  if (texts.length === 0) return [];
  const ai = client();
  const out: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await ai.models.embedContent({
      model: models.embedding,
      contents: batch,
      config: { taskType, outputDimensionality: models.embeddingDimensions },
    });
    const embeddings = response.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new Error(`Embedding count mismatch: expected ${batch.length}, received ${embeddings.length}`);
    }
    for (const item of embeddings) {
      const values = item.values ?? [];
      if (values.length !== models.embeddingDimensions) {
        throw new Error(`Embedding dimension mismatch: expected ${models.embeddingDimensions}, received ${values.length}`);
      }
      out.push(normalize(values));
    }
  }

  return out;
}

function normalize(values: number[]): number[] {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return values;
  return values.map((value) => value / magnitude);
}

export function embedDocuments(texts: string[]): Promise<number[][]> {
  return embed(texts, DOCUMENT_TASK);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embed([text], QUERY_TASK);
  return vector;
}
