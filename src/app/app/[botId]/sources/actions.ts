'use server';

import { revalidatePath } from 'next/cache';
import { app } from '@/config/strings';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { emptyActionState, type ActionState } from '@/lib/actionState';
import { extractFromFile, extractFromText, extractFromUrl, type Extracted } from '@/services/extractService';
import { createSource, indexSource } from '@/services/ingestService';
import { canAddCharacters, loadProfile, loadUsage } from '@/services/quotaService';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.md', '.markdown', '.txt', '.text'];

function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

async function ingest(botId: string, extracted: Extracted): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  if (!profile) return { error: app.errors.generic };

  const usage = await loadUsage(supabase, user.id, profile.plan);
  const check = canAddCharacters(usage, extracted.text.length);
  if (!check.allowed) return { error: check.reason };

  try {
    const source = await createSource(supabase, user.id, botId, extracted);
    await indexSource(supabase, user.id, botId, source, extracted.text);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : app.errors.generic };
  }

  revalidatePath(`/app/${botId}/sources`);
  return emptyActionState;
}

export async function addFileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const botId = String(formData.get('bot_id') ?? '');
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: app.errors.unsupportedFile };
  if (file.size > MAX_FILE_BYTES) return { error: app.errors.fileTooLarge };
  if (!isAllowedFile(file)) return { error: app.errors.unsupportedFile };

  return ingest(botId, await extractFromFile(file));
}

export async function addUrlAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const botId = String(formData.get('bot_id') ?? '');
  const url = String(formData.get('url') ?? '').trim();
  if (!/^https?:\/\/\S+$/i.test(url)) return { error: app.errors.emptyUrl };

  try {
    return await ingest(botId, await extractFromUrl(url));
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : app.errors.generic };
  }
}

export async function addTextAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const botId = String(formData.get('bot_id') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  if (!title || !body) return { error: app.errors.generic };

  return ingest(botId, extractFromText(title, body));
}

export async function deleteSourceAction(formData: FormData): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const botId = String(formData.get('bot_id') ?? '');
  const sourceId = String(formData.get('source_id') ?? '');
  if (sourceId) await supabase.from('sources').delete().eq('id', sourceId);
  revalidatePath(`/app/${botId}/sources`);
}
