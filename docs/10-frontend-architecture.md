# Frontend Architecture

## Core Rule

> Routes handle navigation. Features handle business logic. Components handle presentation.

## Project Structure

```text
src/
├── app/
├── features/
├── components/
├── lib/
├── stores/
├── hooks/
├── types/
├── config/
└── styles/
```

## App Router

The `app` directory owns:

- Routes
- Layouts
- Route-level loading and error boundaries
- Metadata
- Provider composition

Route files should stay thin and compose feature-level screens or workspaces.

## Feature-Owned Architecture

Business hooks, API files, types, schemas, components, constants, and utilities live inside the relevant feature.

Example:

```text
features/sales/orders/
├── api/
│   └── orders.ts
├── hooks/
│   ├── use-orders.ts
│   ├── use-order.ts
│   └── use-verify-payment.ts
├── components/
│   ├── order-table.tsx
│   ├── order-details.tsx
│   └── order-timeline.tsx
├── schemas/
│   └── order.schema.ts
├── types/
│   └── index.ts
├── utils/
├── constants/
└── index.ts
```

## Naming Convention

Folder context should prevent redundant file names.

Use:

- `api/orders.ts`
- `api/bottles.ts`
- `hooks/use-orders.ts`
- `components/order-table.tsx`

Avoid:

- `orders.api.ts`
- `order-table-component.tsx`

## Global Folders

Only truly global items belong outside features.

### components

- `components/ui` — shadcn primitives
- `components/common` — shared application components
- `components/layouts` — layout patterns

### hooks

Only domain-independent hooks, such as:

- useMediaQuery
- useDebounce
- useLocalStorage

### types

Only cross-feature contracts, such as:

- API envelope
- Pagination
- Select option
- Shared identifiers

## State Boundaries

### TanStack Query

Owns server state:

- Orders
- Fragrances
- Bottles
- Customers
- Analytics

### Zustand

Owns global client state:

- Sidebar state
- Command palette
- Cart
- UI preferences
- Temporary multi-step UI state

Do not duplicate server entities into Zustand.

## Form Flow

```text
React Hook Form
→ Zod schema
→ mutation hook
→ feature API function
→ apiClient
```

## Logic Separation

- API functions communicate with the backend.
- Query hooks own caching and mutations.
- Domain services and utilities own business calculations.
- Adapters transform API data into UI-ready shapes.
- Pages coordinate.
- Components present.
