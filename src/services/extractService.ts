import { extractText, getDocumentProxy } from 'unpdf';
import type { SourceKind } from '@/lib/supabase/types';

const HTML_STRIP_BLOCKS = /<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi;
const HTML_TAGS = /<[^>]+>/g;
const HTML_TITLE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

export type Extracted = {
  kind: SourceKind;
  title: string;
  origin: string;
  text: string;
};

function decodeEntities(value: string): string {
  return value.replace(/&[#a-zA-Z0-9]+;/g, (entity) => ENTITIES[entity] ?? ' ');
}

export function htmlToText(html: string): string {
  const withoutBlocks = html.replace(HTML_STRIP_BLOCKS, ' ');
  const withBreaks = withoutBlocks
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n');
  return decodeEntities(withBreaks.replace(HTML_TAGS, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  const document = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(document, { mergePages: true });
  return text;
}

export async function extractFromFile(file: File): Promise<Extracted> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const text = isPdf ? await extractPdf(await file.arrayBuffer()) : await file.text();
  return { kind: 'file', title: file.name, origin: file.name, text };
}

export async function extractFromUrl(url: string): Promise<Extracted> {
  const response = await fetch(url, {
    headers: { 'user-agent': 'HelpdockBot/1.0 (+https://helpdock.app)' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Could not fetch the page (HTTP ${response.status}).`);

  const html = await response.text();
  const titleMatch = html.match(HTML_TITLE);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : new URL(url).hostname;
  return { kind: 'url', title: title || url, origin: url, text: htmlToText(html) };
}

export function extractFromText(title: string, text: string): Extracted {
  return { kind: 'text', title, origin: '', text };
}
