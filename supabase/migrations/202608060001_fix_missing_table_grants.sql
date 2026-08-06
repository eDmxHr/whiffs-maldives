-- RLS policies were added across prior migrations, but the base table-level
-- GRANTs to the `anon`/`authenticated` roles were never issued. Postgres
-- checks GRANTs before RLS policies are ever evaluated, so every query was
-- failing with "permission denied for table X" regardless of policy content.

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

-- The customer-facing catalog (unauthenticated) reads published fragrances
-- directly, matching the public-read RLS policies already in place on these
-- tables (e.g. "fragrances select": is_active = true and status = 'published').
grant select on
  brands,
  fragrances,
  fragrance_images,
  fragrance_notes,
  offerings,
  notes
  to anon;
