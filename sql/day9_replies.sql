create table public.replies (
  id bigint generated always as identity primary key,
  comment_id bigint not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.replies enable row level security;

create policy "replies are viewable by everyone"
on public.replies
for select
using (true);

create policy "authenticated users can insert replies"
on public.replies
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own replies"
on public.replies
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own replies"
on public.replies
for delete
to authenticated
using (auth.uid() = user_id);   