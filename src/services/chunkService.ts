import { retrieval } from '@/config/env';

const PARAGRAPH_BREAK = /\n{2,}/;

function normalizeWhitespace(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function splitOversized(block: string): string[] {
  const parts: string[] = [];
  let cursor = 0;
  while (cursor < block.length) {
    const end = Math.min(cursor + retrieval.chunkChars, block.length);
    parts.push(block.slice(cursor, end));
    if (end === block.length) break;
    cursor = end - retrieval.chunkOverlap;
  }
  return parts;
}

export function chunkText(raw: string): string[] {
  const text = normalizeWhitespace(raw);
  if (text.length === 0) return [];

  const blocks = text.split(PARAGRAPH_BREAK).map((block) => block.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';

  for (const block of blocks) {
    if (block.length > retrieval.chunkChars) {
      if (buffer) {
        chunks.push(buffer);
        buffer = '';
      }
      chunks.push(...splitOversized(block));
      continue;
    }
    const candidate = buffer ? `${buffer}\n\n${block}` : block;
    if (candidate.length > retrieval.chunkChars) {
      chunks.push(buffer);
      buffer = block;
      continue;
    }
    buffer = candidate;
  }

  if (buffer) chunks.push(buffer);

  return chunks.map((chunk) => chunk.trim()).filter((chunk) => chunk.length >= retrieval.minChunkChars);
}
