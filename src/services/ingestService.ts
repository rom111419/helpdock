import type { SupabaseClient } from '@supabase/supabase-js';
import { chunkText } from '@/services/chunkService';
import { embedDocuments } from '@/services/embeddingService';
import type { Extracted } from '@/services/extractService';
import type { Source } from '@/lib/supabase/types';

export type IngestResult = {
  source: Source;
  chunkCount: number;
};

async function markFailed(client: SupabaseClient, sourceId: string, message: string): Promise<void> {
  await client.from('sources').update({ status: 'failed', error: message }).eq('id', sourceId);
}

export async function createSource(
  client: SupabaseClient,
  ownerId: string,
  chatbotId: string,
  extracted: Extracted,
): Promise<Source> {
  const { data, error } = await client
    .from('sources')
    .insert({
      chatbot_id: chatbotId,
      owner_id: ownerId,
      kind: extracted.kind,
      title: extracted.title.slice(0, 200),
      origin: extracted.origin,
      status: 'processing',
      char_count: extracted.text.length,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Source;
}

export async function indexSource(
  client: SupabaseClient,
  ownerId: string,
  chatbotId: string,
  source: Source,
  text: string,
): Promise<IngestResult> {
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    await markFailed(client, source.id, 'No readable text was found in this source.');
    throw new Error('No readable text was found in this source.');
  }

  try {
    const vectors = await embedDocuments(chunks);
    const rows = chunks.map((content, position) => ({
      source_id: source.id,
      chatbot_id: chatbotId,
      owner_id: ownerId,
      position,
      content,
      embedding: vectors[position],
    }));

    const { error } = await client.from('chunks').insert(rows);
    if (error) throw new Error(error.message);

    const { data } = await client
      .from('sources')
      .update({ status: 'ready', chunk_count: chunks.length, error: null })
      .eq('id', source.id)
      .select('*')
      .single();

    return { source: (data as Source | null) ?? source, chunkCount: chunks.length };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Indexing failed.';
    await markFailed(client, source.id, message);
    throw new Error(message);
  }
}
