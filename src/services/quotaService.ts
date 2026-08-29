import type { SupabaseClient } from '@supabase/supabase-js';
import { planFor, type Plan, type PlanTier } from '@/config/plans';
import type { Profile } from '@/lib/supabase/types';

export type Usage = {
  plan: Plan;
  chatbots: number;
  sourceChars: number;
  answersThisMonth: number;
};

export type QuotaCheck = {
  allowed: boolean;
  reason: string;
};

const ALLOWED: QuotaCheck = { allowed: true, reason: '' };

export async function loadProfile(client: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

export async function loadUsage(client: SupabaseClient, userId: string, tier: PlanTier): Promise<Usage> {
  const [bots, chars, answers] = await Promise.all([
    client.from('chatbots').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    client.rpc('count_chars_for_owner', { target_owner: userId }),
    client.rpc('count_messages_this_month', { target_owner: userId }),
  ]);

  const failure = bots.error ?? chars.error ?? answers.error;
  if (failure) throw new Error(failure.message);

  return {
    plan: planFor(tier),
    chatbots: bots.count ?? 0,
    sourceChars: Number(chars.data ?? 0),
    answersThisMonth: Number(answers.data ?? 0),
  };
}

export function canCreateChatbot(usage: Usage): QuotaCheck {
  if (usage.chatbots >= usage.plan.limits.chatbots) {
    return {
      allowed: false,
      reason: `The ${usage.plan.name} plan includes ${usage.plan.limits.chatbots} chatbot${usage.plan.limits.chatbots === 1 ? '' : 's'}. Upgrade to add more.`,
    };
  }
  return ALLOWED;
}

export function canAddCharacters(usage: Usage, incoming: number): QuotaCheck {
  if (usage.sourceChars + incoming > usage.plan.limits.sourceChars) {
    const remaining = Math.max(0, usage.plan.limits.sourceChars - usage.sourceChars);
    return {
      allowed: false,
      reason: `This source needs ${incoming.toLocaleString('en-US')} characters and only ${remaining.toLocaleString('en-US')} are left on the ${usage.plan.name} plan. Upgrade for more knowledge.`,
    };
  }
  return ALLOWED;
}

export function canAnswer(usage: Usage): QuotaCheck {
  if (usage.answersThisMonth >= usage.plan.limits.answersPerMonth) {
    return {
      allowed: false,
      reason: `This chatbot has used all ${usage.plan.limits.answersPerMonth.toLocaleString('en-US')} answers included this month.`,
    };
  }
  return ALLOWED;
}
