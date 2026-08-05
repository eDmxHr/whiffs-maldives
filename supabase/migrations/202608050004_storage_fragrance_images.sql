insert into storage.buckets (id, name, public)
values ('fragrance-images', 'fragrance-images', true)
on conflict (id) do nothing;

create policy "Public read fragrance-images" on storage.objects for select
  using (bucket_id = 'fragrance-images');

create policy "catalog.manage can write fragrance-images" on storage.objects for insert
  with check (bucket_id = 'fragrance-images' and public.has_permission('catalog.manage'));

create policy "catalog.manage can update fragrance-images" on storage.objects for update
  using (bucket_id = 'fragrance-images' and public.has_permission('catalog.manage'));

create policy "catalog.manage can delete fragrance-images" on storage.objects for delete
  using (bucket_id = 'fragrance-images' and public.has_permission('catalog.manage'));
