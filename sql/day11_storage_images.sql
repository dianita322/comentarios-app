create policy "Allow authenticated uploads to feed-images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "Allow users to delete their own files in feed-images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'feed-images'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);