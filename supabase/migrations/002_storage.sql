-- Storage buckets (run in Supabase dashboard SQL editor or via CLI)
insert into storage.buckets (id, name, public) values ('card-images', 'card-images', false);
insert into storage.buckets (id, name, public) values ('card-audio', 'card-audio', false);

-- Storage RLS: owner can upload/delete, owner can read their own files
create policy "Owner can upload card images"
  on storage.objects for insert
  with check (bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner can read card images"
  on storage.objects for select
  using (bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner can delete card images"
  on storage.objects for delete
  using (bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner can upload card audio"
  on storage.objects for insert
  with check (bucket_id = 'card-audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner can read card audio"
  on storage.objects for select
  using (bucket_id = 'card-audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner can delete card audio"
  on storage.objects for delete
  using (bucket_id = 'card-audio' and auth.uid()::text = (storage.foldername(name))[1]);
