import type { SupabaseClient } from '@supabase/supabase-js';
import { retrieval } from '@/config/env';
import { embedQuery } from '@/services/embeddingService';
import type { ChunkMatch, Citation } from '@/lib/supabase/types';

export type RetrievedContext = {
  passages: string[];
  citations: Citation[];
};

const EMPTY: RetrievedContext = { passages: [], citations: [] };

export async function retrieveContext(
  client: SupabaseClient,
  chatbotId: string,
  question: string,
): Promise<RetrievedContext> {
  const embedding = await embedQuery(question);
  const { data, error } = await client.rpc('match_chunks', {
    target_chatbot: chatbotId,
    query_embedding: embedding,
    match_count: retrieval.topK,
  });

  if (error) throw new Error(error.message);

  const matches = ((data as ChunkMatch[] | null) ?? []).filter(
    (match) => match.similarity >= retrieval.minSimilarity,
  );
  if (matches.length === 0) return EMPTY;

  const sourceIds = [...new Set(matches.map((match) => match.source_id))];
  const { data: sources } = await client.from('sources').select('id, title').in('id', sourceIds);
  const titles = new Map((((sources as { id: string; title: string }[] | null) ?? [])).map((row) => [row.id, row.title]));

  return {
    passages: matches.map((match) => {
      const title = titles.get(match.source_id) ?? 'Source';
      return `[${title}]\n${match.content}`;
    }),
    citations: sourceIds.map((id) => ({ sourceId: id, title: titles.get(id) ?? 'Source' })),
  };
}
