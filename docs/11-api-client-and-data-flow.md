# API Client and Data Flow

## API Client

Use a single `src/lib/api-client.ts` file that exports the configured Axios instance.

Responsibilities:

- Base URL
- Default headers
- Authentication token or cookie behavior
- Request interceptors
- Response interceptors
- Shared timeout behavior
- Common error normalization

## Data Flow

```text
Component
→ callback from page or feature container
→ TanStack Query hook
→ feature API function
→ apiClient
→ backend
```

## Feature API File

Example:

```text
features/sales/orders/api/orders.ts
```

The file contains typed HTTP functions only.

```ts
export async function getOrders(params: GetOrdersParams): Promise<PaginatedResponse<Order>> {
  const { data } = await apiClient.get("/orders", { params });
  return data;
}
```

Hooks consume typed data rather than raw `AxiosResponse` values.

## Query Hooks

Hooks own:

- Query keys
- Queries
- Mutations
- Cache invalidation
- Optimistic updates where safe
- Mutation loading and errors

## Component Rule

Components never call Axios, `fetch`, or `apiClient` directly.

## Error Contract

The frontend should expect a consistent backend error shape:

```ts
interface ApiError {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}
```

Business errors should use stable codes such as:

- `INSUFFICIENT_VOLUME`
- `PAYMENT_ALREADY_VERIFIED`
- `ORDER_LOCKED`
- `OFFERING_UNAVAILABLE`

## Adapters

Adapters may convert API entities into UI-ready view models.

Example output:

```ts
{
  displayName: "Dior · Homme Intense",
  remainingVolumeLabel: "72.5 ml",
  health: "warning"
}
```
