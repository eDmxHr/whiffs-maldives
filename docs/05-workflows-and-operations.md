# Workflows and Operations

## Bottle Acquisition Workflow

```text
Purchase locally
→ Record supplier and purchase details
→ Receive and inspect
→ Verify trusted source
→ Create or select fragrance
→ Add bottle inventory
→ Configure offerings and pricing
→ Upload fragrance images
→ Complete metadata
→ Publish
```

## Customer Shopping Workflow

```text
Homepage
→ Browse or search
→ Open fragrance page
→ Learn about fragrance
→ Select offering
→ Add to cart
→ Checkout
→ Choose delivery
→ Choose payment method
→ Place order
```

## Payment Workflow

### Bank Transfer

```text
Order created
→ Awaiting payment
→ Customer submits payment information
→ Admin reviews
→ Payment confirmed
→ Order ready for preparation
```

### Cash on Delivery

The order follows the configured COD policy and can proceed according to business rules.

## Fulfillment Workflow

```text
Payment confirmed
→ System suggests FIFO bottle allocation
→ Admin starts preparation
→ Inventory volume deducted
→ Collect atomizers and packaging materials
→ Print labels manually
→ Fill decants
→ Quality check
→ Package using snapshotted packaging checklist
→ Mark ready
→ Dispatch or hand over
→ Mark delivered/completed
```

## Partial Fulfillment Workflow

```text
Insufficient stock discovered
→ Pause affected line
→ Check next approved bottle
→ If unavailable, contact customer
→ Replace, wait, or remove item
→ Recalculate order total
→ Record customer agreement
→ Continue fulfillment
```

## Inventory Adjustment Workflow

```text
Discrepancy or loss found
→ Create inventory adjustment
→ Select reason
→ Enter volume change
→ Add internal note
→ Record staff member and timestamp
→ Update bottle balance and timeline
```

## Inbox Workflow

The inbox is action-oriented rather than a simple notification center.

Inbox categories:

- Urgent
- Action required
- Needs review
- Reminder
- Informational
- Completed

Example inbox items:

- Payment awaiting verification
- Order ready for preparation
- Bottle reached 50%
- Packaging inventory below threshold
- Order blocked by insufficient stock

Each item links directly to the related workspace and action.
