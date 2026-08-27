'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { emptyActionState, type ActionState } from '@/lib/actionState';
import { app } from '@/config/strings';
import { createBot, deleteBot, updateBot } from '@/services/botService';
import { canCreateChatbot, loadProfile, loadUsage } from '@/services/quotaService';

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function createChatbotAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();
  const profile = await loadProfile(supabase, user.id);
  if (!profile) return { error: app.errors.generic };

  const usage = await loadUsage(supabase, user.id, profile.plan);
  const check = canCreateChatbot(usage);
  if (!check.allowed) return { error: check.reason };

  const name = String(formData.get('name') ?? '').trim();
  const welcome = String(formData.get('welcome_message') ?? '').trim();
  if (!name) return { error: app.errors.generic };

  const bot = await createBot(supabase, user.id, name, welcome);
  revalidatePath('/app');
  redirect(`/app/${bot.id}/sources`);
}

export async function updateChatbotAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();
  const botId = String(formData.get('bot_id') ?? '');
  if (!botId) return { error: app.errors.notFound };

  await updateBot(supabase, botId, {
    name: String(formData.get('name') ?? '').trim(),
    welcome_message: String(formData.get('welcome_message') ?? '').trim(),
    accent_color: String(formData.get('accent_color') ?? '#2563eb'),
    persona: String(formData.get('persona') ?? '').trim(),
  });

  revalidatePath(`/app/${botId}/embed`);
  return emptyActionState;
}

export async function deleteChatbotAction(formData: FormData): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const botId = String(formData.get('bot_id') ?? '');
  if (botId) await deleteBot(supabase, botId);
  revalidatePath('/app');
  redirect('/app');
}
