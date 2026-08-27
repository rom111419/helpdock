import type { PlanTier } from '@/config/plans';

export type SourceKind = 'file' | 'url' | 'text';
export type SourceStatus = 'pending' | 'processing' | 'ready' | 'failed';
export type ChatChannel = 'app' | 'widget';
export type MessageRole = 'user' | 'assistant';

export type Profile = {
  id: string;
  email: string;
  plan: PlanTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_renews_at: string | null;
  created_at: string;
};

export type Chatbot = {
  id: string;
  owner_id: string;
  name: string;
  public_key: string;
  welcome_message: string;
  accent_color: string;
  persona: string;
  created_at: string;
};

export type Source = {
  id: string;
  chatbot_id: string;
  owner_id: string;
  kind: SourceKind;
  title: string;
  origin: string;
  status: SourceStatus;
  error: string | null;
  char_count: number;
  chunk_count: number;
  created_at: string;
};

export type Conversation = {
  id: string;
  chatbot_id: string;
  owner_id: string;
  channel: ChatChannel;
  visitor_label: string;
  created_at: string;
  last_message_at: string;
};

export type Citation = {
  sourceId: string;
  title: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  owner_id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  created_at: string;
};

export type ChunkMatch = {
  id: string;
  source_id: string;
  content: string;
  similarity: number;
};
