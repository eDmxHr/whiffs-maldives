# Supabase Architecture

## Decision

Supabase is the backend platform for the application.

It provides:

- PostgreSQL
- Supabase Auth
- OAuth providers
- Supabase Storage
- Row Level Security
- Database functions
- Edge Functions when needed

## Architecture

```text
Next.js
  ↓
Feature Hooks
  ↓
Feature API Modules
  ↓
Server Logic / Supabase
  ↓
PostgreSQL
```

## Authentication

Supabase Auth manages authentication identities through `auth.users`.

The application keeps its own profile record in `public.profiles`.

```text
auth.users
  ↓
profiles
  ↓
roles and permissions
```

## Initial Authentication Providers

- Email and password
- Google OAuth

Additional OAuth providers can be added later.

## Application User Model

`auth.users` is controlled by Supabase.

`profiles` contains application-specific user information such as:

- Display name
- Avatar
- Account status
- Created and updated timestamps

## Storage

Supabase Storage is used for fragrance images.

Suggested bucket:

```text
fragrance-images
```

The database stores the uploaded file path or URL and its position.

## Business Logic Placement

Business-critical workflows must not live only in React components.

Examples:

- Payment verification
- Bottle allocation
- Inventory deduction
- Order completion
- Permission checks
- Activity logging

These should be enforced through server-side logic, database functions, transactions, API routes, or Edge Functions.

## Direct Database Access

Frontend components must not directly call:

```ts
supabase.from("orders").select()
```

Access remains behind feature API modules so the application keeps a consistent boundary.

## Final Rule

Supabase provides the backend foundation, while the application preserves its feature API architecture and server-side business rules.
