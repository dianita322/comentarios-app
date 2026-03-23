create table public.comments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_url text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_comment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_comments_updated_at
before update on public.comments
for each row
execute procedure public.handle_comment_updated_at();

alter table public.comments enable row level security;

create policy "comments are viewable by everyone"
on public.comments
for select
using (true);

create policy "authenticated users can insert comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own comments"
on public.comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can delete own comments"
on public.comments
for delete
to authenticated
using (auth.uid() = user_id);