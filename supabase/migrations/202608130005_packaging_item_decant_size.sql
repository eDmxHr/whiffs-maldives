-- Packaging items apply either to a specific decant size (e.g. the 2ml atomizer) or to every
-- size (e.g. shipping box, ribbon, thank-you card). Null means "shared across all sizes" so
-- pricing can sum the right subset of items per offering size instead of every active item.
alter table public.packaging_items
  add column decant_size_ml numeric(8, 2) null check (decant_size_ml is null or decant_size_ml > 0);
