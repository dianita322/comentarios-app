alter table public.projects enable row level security;

drop policy if exists "Projects published are viewable by everyone" on public.projects;
create policy "Projects published are viewable by everyone"
on public.projects
for select
using (status = 'published');

drop policy if exists "Authors can view their own projects" on public.projects;
drop policy if exists "Authors can insert their own projects" on public.projects;
drop policy if exists "Authors can update their own projects" on public.projects;
drop policy if exists "Authors can delete their own projects" on public.projects;

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
