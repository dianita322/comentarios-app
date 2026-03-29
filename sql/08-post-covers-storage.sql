insert into storage.buckets (id, name, public)
values ('post-covers', 'post-covers', true)
on conflict (id) do nothing;

drop policy if exists "Post covers are publicly viewable" on storage.objects;
create policy "Post covers are publicly viewable"
on storage.objects
for select
using (bucket_id = 'post-covers');

drop policy if exists "Authenticated users can upload their own post covers" on storage.objects;
create policy "Authenticated users can upload their own post covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own post covers" on storage.objects;
create policy "Authenticated users can update their own post covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'post-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own post covers" on storage.objects;
create policy "Authenticated users can delete their own post covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);