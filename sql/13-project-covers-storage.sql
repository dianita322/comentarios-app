insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-covers',
  'project-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "Public can view project covers" on storage.objects;
create policy "Public can view project covers"
on storage.objects
for select
using (bucket_id = 'project-covers');

drop policy if exists "Authenticated users can upload own project covers" on storage.objects;
create policy "Authenticated users can upload own project covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can update own project covers" on storage.objects;
create policy "Authenticated users can update own project covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Authenticated users can delete own project covers" on storage.objects;
create policy "Authenticated users can delete own project covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);