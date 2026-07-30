# Supabase Implementation Plan

## Phase 1 — Foundation

1. Create the Supabase project.
2. Configure environment variables.
3. Install Supabase clients for Next.js.
4. Create browser and server Supabase utilities.
5. Create `api-client.ts`.
6. Configure TanStack Query.
7. Establish migrations.

## Phase 2 — Authentication

1. Enable email and password authentication.
2. Configure Google OAuth.
3. Create `profiles`.
4. Add a new-user profile trigger.
5. Implement sign-in and sign-out.
6. Protect admin routes.
7. Seed the initial owner.

## Phase 3 — Roles and Permissions

1. Create roles and permissions.
2. Seed Owner, Manager, and Staff.
3. Seed permission keys.
4. Assign every permission to Owner.
5. Create `has_permission()`.
6. Add initial RLS policies.
7. Build access-denied UI states.

## Phase 4 — Catalog

1. Create brands.
2. Create fragrances.
3. Create notes and fragrance-note relationships.
4. Create offerings.
5. Create the fragrance image bucket.
6. Add storage policies.
7. Implement image upload, deletion, and reorder.
8. Confirm first position becomes hero.
9. Add seed data.

## Phase 5 — Inventory

1. Create suppliers.
2. Create bottles.
3. Add volume constraints.
4. Create inventory events.
5. Create a transactional volume-adjustment function.
6. Add FIFO bottle selection.
7. Add low-volume logic.
8. Add inventory RLS.

## Phase 6 — Orders and Payments

1. Create customers.
2. Create orders.
3. Create order items with snapshots.
4. Create payments.
5. Create fulfillments.
6. Create fulfillment items.
7. Implement status validation.
8. Implement payment verification.
9. Implement inventory securing.
10. Implement preparation.
11. Implement transactional fulfillment completion.
12. Implement partial fulfillment.

## Phase 7 — Packaging and Operations

1. Create packaging items.
2. Create versioned packaging profiles.
3. Add packaging adjustments.
4. Add low-stock alerts.
5. Create activity logs.
6. Add configurable settings.

## Phase 8 — Dashboard and Inbox

1. Define dashboard metrics.
2. Create views or functions.
3. Define inbox rules.
4. Return prepared dashboard data.
5. Add operational alerts.

## Phase 9 — Security Review

1. Enable RLS on every exposed table.
2. Test public catalog access.
3. Test administrative permissions.
4. Test customer isolation.
5. Test storage access.
6. Test guest tracking.
7. Keep service-role keys off the browser.
8. Test forbidden mutations.
9. Review `security definer` functions.

## Phase 10 — Seed Data

Create realistic data for:

- Roles
- Permissions
- Owner
- Brands
- Fragrances
- Notes
- Offerings
- Suppliers
- Bottles
- Customers
- Orders
- Payments
- Packaging

## Recommended Build Order

```text
Auth
  ↓
Catalog
  ↓
Inventory
  ↓
Orders and Payments
  ↓
Fulfillment
  ↓
Dashboard and Inbox
```

## First Vertical Slice

```text
Create fragrance
  ↓
Upload and reorder images
  ↓
Create offerings
  ↓
Add bottle
  ↓
Publish fragrance
```

This validates authentication, permissions, storage, schema, API architecture, forms, TanStack Query, and shared components.
