create table if not exists public.projects (
  id bigserial primary key,
  author_id uuid references auth.users (id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  description text not null,
  cover_image_url text,
  demo_url text,
  repo_url text,
  tech_stack text,
  category text not null default 'general'
    check (category in ('general', 'web', 'automatizacion', 'academico', 'herramienta', 'experimento')),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_published_at_idx
  on public.projects (status, published_at desc);

create index if not exists projects_category_status_published_at_idx
  on public.projects (category, status, published_at desc);

create index if not exists projects_slug_idx
  on public.projects (slug);

create or replace function public.set_updated_at_projects()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_set_updated_at on public.projects;

create trigger trg_projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at_projects();

alter table public.projects enable row level security;

drop policy if exists "Projects published are viewable by everyone" on public.projects;
create policy "Projects published are viewable by everyone"
on public.projects
for select
using (status = 'published');

drop policy if exists "Admin can view own projects" on public.projects;
create policy "Admin can view own projects"
on public.projects
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
);

drop policy if exists "Admin can insert projects" on public.projects;
create policy "Admin can insert projects"
on public.projects
for insert
to authenticated
with check (
  lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
  and author_id = auth.uid()
);

drop policy if exists "Admin can update projects" on public.projects;
create policy "Admin can update projects"
on public.projects
for update
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
  and author_id = auth.uid()
)
with check (
  lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
  and author_id = auth.uid()
);

drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects"
on public.projects
for delete
to authenticated
using (
  lower(auth.jwt() ->> 'email') = lower('kevn1231@gmail.com')
  and author_id = auth.uid()
);