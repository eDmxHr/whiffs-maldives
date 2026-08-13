-- Adds admin-curated flags so the storefront can surface a "Featured" set within the homepage
-- collection grid and a "Best sellers" view without waiting on real sales volume or a full
-- Collections concept. "New arrivals" needs no new column -- it's derived from created_at.
alter table public.fragrances
  add column is_featured boolean not null default false,
  add column is_best_seller boolean not null default false;
