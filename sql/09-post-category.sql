alter table public.posts
add column if not exists category text;

update public.posts
set category = 'general'
where category is null or btrim(category) = '';

alter table public.posts
alter column category set default 'general';

alter table public.posts
alter column category set not null;

alter table public.posts
drop constraint if exists posts_category_check;

alter table public.posts
add constraint posts_category_check
check (category in ('general', 'tutorial', 'proyecto', 'actualizacion', 'opinion'));

create index if not exists posts_category_status_published_at_idx
  on public.posts (category, status, published_at desc);