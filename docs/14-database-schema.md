# Database Schema

## Schema Principles

- Separate catalog data from physical inventory.
- Keep inventory movements auditable.
- Support decants now and full bottles later.
- Preserve historical order pricing.
- Use transactions for inventory-sensitive operations.
- Prefer archiving over destructive deletion for operational records.

## Authentication and Access

### profiles

Application profile linked to Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key; may match `auth.users.id` |
| name | text | Display name |
| avatar_url | text | Optional |
| is_active | boolean | Default `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### roles

| Column | Type |
|---|---|
| id | uuid |
| name | text |
| description | text |
| created_at | timestamptz |

### permissions

| Column | Type |
|---|---|
| id | uuid |
| key | text |
| description | text |

Examples:

- `catalog.manage`
- `orders.view`
- `orders.update`
- `payments.verify`
- `inventory.view`
- `inventory.adjust`
- `settings.manage`

### user_roles

| Column | Type |
|---|---|
| user_id | uuid |
| role_id | uuid |

Use a composite unique constraint on `(user_id, role_id)`.

### role_permissions

| Column | Type |
|---|---|
| role_id | uuid |
| permission_id | uuid |

Use a composite unique constraint on `(role_id, permission_id)`.

## Catalog

### brands

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Required |
| slug | text | Unique |
| description | text | Optional |
| logo_url | text | Optional |
| is_active | boolean | Default `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### fragrances

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| brand_id | uuid | References `brands` |
| name | text | Required |
| slug | text | Unique |
| description | text | Optional |
| concentration | text | Optional |
| release_year | integer | Optional |
| perfumer | text | Optional |
| gender | text | Optional |
| is_active | boolean | Default `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

A fragrance can exist without available inventory.

### fragrance_images

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| fragrance_id | uuid | References `fragrances` |
| storage_path | text | Uploaded file path |
| position | integer | Starts from 1 |
| created_at | timestamptz | |

Rules:

- Images belong to the fragrance catalog.
- Images do not belong to physical bottle records.
- The image with the lowest position is the hero image.
- The first uploaded image receives the first position.
- Reordering images changes the hero image naturally.
- No separate `is_hero` field is required.

### notes

| Column | Type |
|---|---|
| id | uuid |
| name | text |
| slug | text |
| category | text |
| created_at | timestamptz |

### fragrance_notes

| Column | Type | Notes |
|---|---|---|
| fragrance_id | uuid | References `fragrances` |
| note_id | uuid | References `notes` |
| pyramid_level | text | `top`, `heart`, `base`, or optional |
| position | integer | Display order |

### offerings

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| fragrance_id | uuid | References `fragrances` |
| name | text | Example: `5ml` |
| type | text | `decant`, `full_bottle`, or future type |
| size_ml | numeric | Required when volume-based |
| price | numeric | Selling price |
| is_active | boolean | Default `true` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Initial active offerings:

- 2ml
- 5ml
- 10ml

Discovery sets remain disabled initially.

## Inventory

### suppliers

| Column | Type |
|---|---|
| id | uuid |
| name | text |
| phone | text |
| email | text |
| notes | text |
| is_active | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

### bottles

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| fragrance_id | uuid | References `fragrances` |
| supplier_id | uuid | References `suppliers` |
| original_volume_ml | numeric | Labeled bottle volume |
| usable_volume_ml | numeric | Volume after waste allowance |
| remaining_volume_ml | numeric | Current available volume |
| purchase_price | numeric | |
| purchase_date | date | |
| received_at | timestamptz | Used for FIFO |
| status | bottle_status | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Rules:

- No bottle image fields.
- Remaining volume cannot be negative.
- Remaining volume cannot exceed usable volume.
- FIFO prioritizes the earliest received available bottle.
- Waste allowance and low-volume thresholds are configurable.

### inventory_events

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| bottle_id | uuid | References `bottles` |
| type | inventory_event_type | |
| quantity_ml | numeric | Signed delta |
| balance_after_ml | numeric | Snapshot after movement |
| reference_type | text | Example: `order` |
| reference_id | uuid | Optional |
| reason | text | |
| created_by | uuid | References `profiles` |
| created_at | timestamptz | |

Every inventory change creates an event.

## Customers and Orders

### customers

| Column | Type |
|---|---|
| id | uuid |
| auth_user_id | uuid |
| name | text |
| phone | text |
| email | text |
| notes | text |
| created_at | timestamptz |
| updated_at | timestamptz |

Guest checkout is supported, so `auth_user_id` may be null.

### orders

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| order_number | text | Human-readable unique number |
| customer_id | uuid | References `customers` |
| status | order_status | |
| payment_status | payment_status | |
| subtotal | numeric | |
| discount_total | numeric | Default 0 |
| delivery_fee | numeric | Default 0 |
| total | numeric | |
| customer_name | text | Historical snapshot |
| customer_phone | text | Historical snapshot |
| customer_email | text | Historical snapshot |
| delivery_method | text | |
| delivery_address | text | Optional |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### order_items

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| order_id | uuid | References `orders` |
| offering_id | uuid | References `offerings` |
| fragrance_name | text | Historical snapshot |
| offering_name | text | Historical snapshot |
| size_ml | numeric | Historical snapshot |
| quantity | integer | |
| unit_price | numeric | Historical snapshot |
| total_price | numeric | |

### payments

| Column | Type |
|---|---|
| id | uuid |
| order_id | uuid |
| method | text |
| amount | numeric |
| status | payment_status |
| reference | text |
| proof_path | text |
| verified_by | uuid |
| paid_at | timestamptz |
| verified_at | timestamptz |
| created_at | timestamptz |
| updated_at | timestamptz |

Initial methods:

- Bank transfer
- Cash on delivery

### fulfillments

| Column | Type |
|---|---|
| id | uuid |
| order_id | uuid |
| status | fulfillment_status |
| prepared_by | uuid |
| prepared_at | timestamptz |
| completed_at | timestamptz |
| notes | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### fulfillment_items

| Column | Type |
|---|---|
| id | uuid |
| fulfillment_id | uuid |
| order_item_id | uuid |
| bottle_id | uuid |
| used_volume_ml | numeric |
| created_at | timestamptz |

An order item may use more than one bottle.

## Packaging

### packaging_items

| Column | Type |
|---|---|
| id | uuid |
| name | text |
| unit | text |
| unit_cost | numeric |
| quantity | numeric |
| minimum_quantity | numeric |
| is_active | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

`unit_cost` is configurable in admin and feeds into offering pricing calculations.

### packaging_profiles

| Column | Type |
|---|---|
| id | uuid |
| name | text |
| version | integer |
| is_active | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

### packaging_profile_items

| Column | Type |
|---|---|
| packaging_profile_id | uuid |
| packaging_item_id | uuid |
| quantity | numeric |

## System

### activity_logs

| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| action | text |
| entity_type | text |
| entity_id | uuid |
| metadata | jsonb |
| created_at | timestamptz |

### settings

| Column | Type |
|---|---|
| key | text |
| value | jsonb |
| updated_by | uuid |
| updated_at | timestamptz |

Possible settings:

- Waste allowance
- Low-volume threshold
- Order payment expiry
- First-order discount
- Delivery fee rules

## Core Enums

### bottle_status

- `available`
- `low_volume`
- `empty`
- `inactive`
- `archived`

### order_status

- `pending_payment`
- `payment_confirmed`
- `preparing`
- `partially_fulfilled`
- `ready`
- `completed`
- `cancelled`

### payment_status

- `pending`
- `paid`
- `failed`
- `partially_refunded`
- `refunded`
- `cancelled`

### fulfillment_status

- `pending`
- `preparing`
- `partially_completed`
- `completed`
- `cancelled`

### inventory_event_type

- `received`
- `allocated`
- `sale`
- `loss`
- `adjustment`
- `returned`
- `deactivated`

## Important Indexes

Create indexes for:

- `fragrances.brand_id`
- `fragrances.slug`
- `fragrance_images.fragrance_id, position`
- `offerings.fragrance_id, is_active`
- `bottles.fragrance_id, status, received_at`
- `inventory_events.bottle_id, created_at`
- `orders.status, created_at`
- `orders.payment_status, created_at`
- `orders.customer_id`
- `order_items.order_id`
- `payments.order_id`
- `fulfillment_items.bottle_id`
- `activity_logs.entity_type, entity_id, created_at`
