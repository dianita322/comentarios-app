create table if not exists public.posts (
  id bigserial primary key,
  author_id uuid references auth.users (id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create index if not exists posts_slug_idx
  on public.posts (slug);

create or replace function public.set_updated_at_posts()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posts_set_updated_at on public.posts;

create trigger trg_posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at_posts();

alter table public.posts enable row level security;

drop policy if exists "Posts published are viewable by everyone" on public.posts;
create policy "Posts published are viewable by everyone"
on public.posts
for select
using (status = 'published');

drop policy if exists "Authors can view their own posts" on public.posts;
create policy "Authors can view their own posts"
on public.posts
for select
to authenticated
using (author_id = auth.uid());

drop policy if exists "Authors can insert their own posts" on public.posts;
create policy "Authors can insert their own posts"
on public.posts
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "Authors can update their own posts" on public.posts;
create policy "Authors can update their own posts"
on public.posts
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "Authors can delete their own posts" on public.posts;
create policy "Authors can delete their own posts"
on public.posts
for delete
to authenticated
using (author_id = auth.uid());