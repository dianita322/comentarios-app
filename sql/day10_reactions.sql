create table public.reactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('comment', 'reply')),
  target_id bigint not null,
  reaction_type text not null check (reaction_type in ('like')),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, reaction_type)
);

create index reactions_target_idx
on public.reactions (target_type, target_id);

create index reactions_user_idx
on public.reactions (user_id);

alter table public.reactions enable row level security;

create policy "reactions are viewable by everyone"
on public.reactions
for select
using (true);

create policy "authenticated users can insert reactions"
on public.reactions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete own reactions"
on public.reactions
for delete
to authenticated
using (auth.uid() = user_id);