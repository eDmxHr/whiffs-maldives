# Row Level Security and Permissions

## Security Principle

The database does not trust the frontend.

All exposed tables must have Row Level Security enabled.

## Initial Access Model

The first application user is the owner.

The owner can manage all administrative data. The schema remains ready for future managers and staff.

## Roles

- Owner
- Manager
- Staff

## Permission Keys

### Catalog

- `catalog.view`
- `catalog.manage`

### Orders

- `orders.view`
- `orders.create`
- `orders.update`
- `orders.cancel`
- `orders.fulfill`

### Payments

- `payments.view`
- `payments.verify`
- `payments.refund`

### Inventory

- `inventory.view`
- `inventory.create`
- `inventory.adjust`
- `inventory.archive`

### Customers

- `customers.view`
- `customers.manage`

### Operations and Administration

- `packaging.view`
- `packaging.manage`
- `expenses.view`
- `expenses.manage`
- `reports.view`
- `settings.manage`
- `users.manage`
- `roles.manage`

## Helper Functions

Create:

```sql
is_authenticated()
```

```sql
has_role(role_name text)
```

```sql
has_permission(permission_key text)
```

Use `security definer` carefully and set a safe `search_path`.

## Public Catalog Access

Public users may read:

- Active brands
- Active fragrances
- Images belonging to active fragrances
- Notes associated with active fragrances
- Active offerings

Public users must not read:

- Bottles
- Suppliers
- Inventory events
- Payments
- Activity logs
- Internal settings
- Administrative customer data

## Administrative Access

Authenticated users require the relevant permission for each domain.

Examples:

- `catalog.manage` for catalog changes
- `inventory.view` for bottle access
- `inventory.adjust` for volume changes
- `orders.view` for order access
- `orders.fulfill` for preparation and completion
- `payments.verify` for payment verification
- `settings.manage` for business settings

## Customer Access

A signed-in customer may view only orders linked to their own auth identity.

Guest order tracking should use a secure reference through a server endpoint rather than broad database access.

## Storage Policies

### fragrance-images

- Public read for published catalog images
- Upload, update, and delete require `catalog.manage`
- Suggested path: `fragrances/{fragrance_id}/{generated_file_name}`

### payment-proofs

- Private bucket
- Access limited to the submitting customer and permitted staff
- Use signed URLs

## Protected Workflows

RLS alone is not enough for multi-step business actions.

Run these server-side or through secure database functions:

- Verify payment
- Reserve inventory
- Start preparation
- Allocate bottles
- Deduct bottle volume
- Complete fulfillment
- Process partial fulfillment
- Process refunds
- Adjust bottle volume

## UI Permission Rule

Navigation may remain visible without permission. Opening the page should show an access-denied state instead of silently hiding the settings area.

The database remains authoritative.

## Audit Requirement

Create activity logs for sensitive actions such as:

- Payment verified
- Bottle adjusted
- Order cancelled
- Refund recorded
- Permission changed
- Setting changed
