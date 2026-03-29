alter table public.comments
add column if not exists post_id bigint references public.posts(id) on delete cascade;

create index if not exists comments_post_id_created_at_idx
  on public.comments (post_id, created_at asc);

create unique index if not exists reactions_user_target_unique
  on public.reactions (user_id, target_type, target_id);

alter table public.comments enable row level security;
alter table public.reactions enable row level security;

drop policy if exists "Public can read post comments" on public.comments;
create policy "Public can read post comments"
on public.comments
for select
using (
  post_id is not null
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.status = 'published'
  )
);

drop policy if exists "Authenticated users can comment published posts" on public.comments;
create policy "Authenticated users can comment published posts"
on public.comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and post_id is not null
  and exists (
    select 1
    from public.posts
    where posts.id = comments.post_id
      and posts.status = 'published'
  )
);

drop policy if exists "Owners or admin can update comments" on public.comments;
create policy "Owners or admin can update comments"
on public.comments
for update
to authenticated
using (
  user_id = auth.uid()
  or lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
)
with check (
  user_id = auth.uid()
  or lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
);

drop policy if exists "Owners or admin can delete comments" on public.comments;
create policy "Owners or admin can delete comments"
on public.comments
for delete
to authenticated
using (
  user_id = auth.uid()
  or lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
);

drop policy if exists "Public can read reactions" on public.reactions;
create policy "Public can read reactions"
on public.reactions
for select
using (true);

drop policy if exists "Authenticated users can insert reactions" on public.reactions;
create policy "Authenticated users can insert reactions"
on public.reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and target_type in ('post', 'comment')
);

drop policy if exists "Authenticated users can delete own reactions" on public.reactions;
create policy "Authenticated users can delete own reactions"
on public.reactions
for delete
to authenticated
using (user_id = auth.uid());
