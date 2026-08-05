-- The "fragrance-images" bucket is public, so object downloads via the public
-- URL never go through RLS at all -- this policy only controlled the storage
-- API's list/read-metadata operations, letting anyone enumerate every file
-- path in the bucket. Public buckets don't need that for URL-based access,
-- so drop it; getPublicUrl() keeps working without it.
drop policy if exists "Public read fragrance-images" on storage.objects;
