create extension if not exists vector;

create type plan_tier as enum ('free', 'pro', 'business');
create type source_kind as enum ('file', 'url', 'text');
create type source_status as enum ('pending', 'processing', 'ready', 'failed');
create type chat_channel as enum ('app', 'widget');
create type message_role as enum ('user', 'assistant');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  plan plan_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table chatbots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles on delete cascade,
  name text not null,
  public_key text not null unique default encode(gen_random_bytes(16), 'hex'),
  welcome_message text not null default '',
  accent_color text not null default '#2563eb',
  persona text not null default '',
  created_at timestamptz not null default now()
);
create index chatbots_owner_idx on chatbots (owner_id, created_at desc);

create table sources (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references chatbots on delete cascade,
  owner_id uuid not null references profiles on delete cascade,
  kind source_kind not null,
  title text not null,
  origin text not null default '',
  status source_status not null default 'pending',
  error text,
  char_count integer not null default 0,
  chunk_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index sources_chatbot_idx on sources (chatbot_id, created_at desc);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources on delete cascade,
  chatbot_id uuid not null references chatbots on delete cascade,
  owner_id uuid not null references profiles on delete cascade,
  position integer not null,
  content text not null,
  embedding vector(768) not null
);
create index chunks_chatbot_idx on chunks (chatbot_id);
create index chunks_embedding_idx on chunks using hnsw (embedding vector_cosine_ops);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  chatbot_id uuid not null references chatbots on delete cascade,
  owner_id uuid not null references profiles on delete cascade,
  channel chat_channel not null,
  visitor_label text not null default '',
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index conversations_chatbot_idx on conversations (chatbot_id, last_message_at desc);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  owner_id uuid not null references profiles on delete cascade,
  role message_role not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on messages (conversation_id, created_at);
create index messages_usage_idx on messages (owner_id, role, created_at desc);
