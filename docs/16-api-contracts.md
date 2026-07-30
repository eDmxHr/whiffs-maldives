# API Contracts

## Architecture

```text
Component
  ↓
Feature Hook
  ↓
Feature API Module
  ↓
apiClient
  ↓
Next.js Server Endpoint / Supabase Function
  ↓
Database
```

## API Client

Shared HTTP infrastructure lives in:

```text
src/lib/api-client.ts
```

Feature API modules use:

```ts
apiClient.get("")
apiClient.post("")
apiClient.patch("")
apiClient.delete("")
```

Components never import Axios or call endpoints directly.

## File Naming

Folder context provides responsibility.

```text
features/sales/orders/api/orders.ts
features/inventory/bottles/api/bottles.ts
features/catalog/fragrances/api/fragrances.ts
```

Do not use redundant names such as `orders.api.ts`.

## Response Format

Success:

```json
{
  "data": {}
}
```

Collection:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Error:

```json
{
  "error": {
    "code": "INSUFFICIENT_VOLUME",
    "message": "There is not enough available volume to fulfill this item.",
    "details": {}
  }
}
```

Use stable error codes rather than matching message text.

## Query Conventions

Pagination:

```text
?page=1&perPage=20
```

Sorting:

```text
?sort=createdAt&direction=desc
```

Filtering:

```text
/orders?status=preparing
/orders?paymentStatus=pending
/bottles?status=low_volume
/bottles?fragranceId={id}
/fragrances?brandId={id}
```

## Catalog Endpoints

```text
GET    /api/brands
GET    /api/brands/:id
POST   /api/brands
PATCH  /api/brands/:id
POST   /api/brands/:id/archive

GET    /api/fragrances
GET    /api/fragrances/:id
POST   /api/fragrances
PATCH  /api/fragrances/:id
POST   /api/fragrances/:id/publish
POST   /api/fragrances/:id/unpublish
```

### Images

```text
POST   /api/fragrances/:id/images
PATCH  /api/fragrances/:id/images/reorder
DELETE /api/fragrances/:id/images/:imageId
```

The first-position image is the hero image. No separate hero-image endpoint is needed.

### Offerings

```text
GET    /api/fragrances/:id/offerings
POST   /api/fragrances/:id/offerings
PATCH  /api/offerings/:id
POST   /api/offerings/:id/activate
POST   /api/offerings/:id/deactivate
```

## Inventory Endpoints

```text
GET    /api/bottles
GET    /api/bottles/:id
POST   /api/bottles
PATCH  /api/bottles/:id
POST   /api/bottles/:id/adjust-volume
POST   /api/bottles/:id/deactivate
POST   /api/bottles/:id/archive
```

Do not expose unrestricted direct editing of `remaining_volume_ml`.

### Adjust Volume

```text
POST /api/bottles/:id/adjust-volume
```

```json
{
  "quantityMl": -2,
  "reason": "Accidental spill"
}
```

This must validate, update the bottle, create an inventory event, and create an activity log in one protected operation.

## Customer Endpoints

```text
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PATCH  /api/customers/:id
```

## Order Endpoints

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PATCH  /api/orders/:id
POST   /api/orders/:id/cancel
```

Orders may be edited by the administrator before payment confirmation.

### Verify Payment

```text
POST /api/orders/:id/verify-payment
```

The operation must update payment and order state, record the verifier, secure inventory as defined, and create an activity log.

### Start Preparation

```text
POST /api/orders/:id/start-preparation
```

### Allocate Bottles

```text
POST /api/orders/:id/allocate
```

FIFO is used by default.

### Complete Fulfillment

```text
POST /api/orders/:id/complete-fulfillment
```

This must run transactionally and deduct inventory only after validation.

### Partial Fulfillment

```text
POST /api/orders/:id/partial-fulfillment
```

Requires customer agreement and adjusts totals or refunds where required.

## Payments

```text
GET  /api/orders/:id/payments
POST /api/orders/:id/payments
POST /api/payments/:id/verify
POST /api/payments/:id/refund
```

## Packaging

```text
GET    /api/packaging-items
POST   /api/packaging-items
PATCH  /api/packaging-items/:id
POST   /api/packaging-items/:id/adjust
```

## Dashboard

```text
GET /api/dashboard
```

The server returns prepared metrics and action counts rather than making the client calculate business data.

## Inbox

```text
GET  /api/inbox
POST /api/inbox/:id/complete
```

Inbox items represent actionable work such as payment verification, preparation, stock issues, and packaging restocking.

## Transactional Operations

Use PostgreSQL transactions or secure functions for:

- Inventory adjustment
- Payment verification
- Bottle allocation
- Fulfillment completion
- Partial fulfillment
- Refund processing

## Idempotency

Protect critical actions from duplicate submission.

## Error Codes

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `ORDER_NOT_EDITABLE`
- `PAYMENT_ALREADY_VERIFIED`
- `PAYMENT_REQUIRED`
- `INSUFFICIENT_VOLUME`
- `BOTTLE_INACTIVE`
- `FULFILLMENT_ALREADY_COMPLETED`
- `INVALID_STATUS_TRANSITION`
- `DUPLICATE_OPERATION`
