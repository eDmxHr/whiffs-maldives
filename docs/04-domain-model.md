# Domain Model

## Domain Boundaries

### Catalog

- Brand
- Fragrance
- Product
- Offering
- Fragrance Image
- Note
- Accord
- Perfumer
- Collection

### Inventory

- Bottle
- Bottle Event / Inventory Event
- Packaging Item
- Packaging Profile
- Supplier

### Commerce

- Customer
- Address
- Order
- Order Item
- Payment

### Fulfillment

- Fulfillment
- Fulfillment Step
- Packaging Checklist
- Shipment / Delivery

### Platform

- Admin User
- Role
- Permission
- Setting
- Audit Event
- Inbox Item
- Attachment
- Internal Note

## Core Relationships

```text
Brand
  └── has many Fragrances

Fragrance
  ├── belongs to Brand
  ├── has many Images
  ├── has many Notes
  ├── has many Accords
  ├── has many Products
  └── has many Bottles

Product
  ├── belongs to Fragrance
  └── has many Offerings

Offering
  ├── belongs to Product
  ├── references a Packaging Profile
  └── can appear in Order Items

Bottle
  ├── belongs to Fragrance or Product
  ├── belongs to Supplier
  └── has many Inventory Events

Customer
  ├── has many Addresses
  └── has many Orders

Order
  ├── belongs to Customer or Guest Identity
  ├── has many Order Items
  ├── has one or more Payments
  ├── has one Fulfillment
  └── has one Shipment or Delivery record
```

## Entity Responsibilities

### Fragrance

The knowledge entity. It contains:

- Brand and name
- Concentration
- Release year
- Perfumer
- Notes and accords
- Editorial content
- Performance
- season, occasion, and climate suitability
- Rich fragrance DNA metadata
- Images
- SEO information

It does not own stock or transactional prices.

### Product

The commercial catalog layer under a fragrance. It allows the platform to support more than one commercial product related to a fragrance over time.

### Offering

The actual purchasing option, such as:

- 2 ml decant
- 5 ml decant
- 10 ml decant
- 100 ml full bottle
- Gift set

An offering owns price, visibility, status, display order, and packaging rules.

### Bottle

A physical asset owned by the business. It owns procurement information, volume, health, status, cost, and inventory history.

### Inventory Event

The audit trail for bottle volume movements:

- Initial usable volume
- Order deduction
- Spill
- Correction
- Adjustment
- Depletion

The bottle ledger is the source of truth. A cached remaining volume may be stored for performance.

### Packaging Profile

A versioned fulfillment recipe containing the resources required to prepare an order.

### Order Item

A snapshot of the purchased offering and its commercial values at the time of purchase.
