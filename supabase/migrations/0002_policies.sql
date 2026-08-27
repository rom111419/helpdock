alter table profiles enable row level security;
alter table chatbots enable row level security;
alter table sources enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy profiles_self on profiles
  for all using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy chatbots_owner on chatbots
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy sources_owner on sources
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy chunks_owner on chunks
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy conversations_owner on conversations
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy messages_owner on messages
  for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create function match_chunks(
  target_chatbot uuid,
  query_embedding vector(768),
  match_count integer
)
returns table (id uuid, source_id uuid, content text, similarity double precision)
language sql stable set search_path = public as $$
  select c.id, c.source_id, c.content, 1 - (c.embedding <=> query_embedding)
  from chunks c
  where c.chatbot_id = target_chatbot
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

create function count_messages_this_month(target_owner uuid)
returns integer
language sql stable set search_path = public as $$
  select count(*)::integer from messages
  where owner_id = target_owner
    and role = 'assistant'
    and created_at >= date_trunc('month', now());
$$;

create function count_chars_for_owner(target_owner uuid)
returns integer
language sql stable set search_path = public as $$
  select coalesce(sum(char_count), 0)::integer from sources where owner_id = target_owner;
$$;
