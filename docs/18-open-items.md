# Final Decisions and Open Items

This document records decisions that were previously open, plus the few items that still need final confirmation.

## Finalized Decisions

### Branding

- Business name: Whiffs Maldives
- Logo direction: use the Whiffs Maldives logo once the touched-up asset is provided
- Final color palette: warm ivory, charcoal, muted gold, and deep green
- Brand accent color: deep green
- Packaging visual identity: minimal luxury

### Technical

- Backend framework and hosting direction: Next.js server endpoints with Supabase as the backend platform
- Authentication implementation: Supabase Auth with email/password and Google OAuth
- File storage provider: Supabase Storage
- Final chart implementation library: Chart.js by default

### Business

- Payment expiry duration: bank transfer orders expire after 24 hours if payment is not confirmed
- Delivery fees: configurable, with a default fee of 0 for launch
- Target gross margin: approximately 40%
- Pricing rounding rule: round final GST-inclusive customer prices up to the nearest MVR 5
- Pricing display: customer-facing prices are GST-inclusive
- Refund policy: refunds are allowed, even when a replacement is available
- Tax handling: GST must be supported and charged where legally required; launch GST rate is 8%
- Packaging material costs: each packaging material must have a configurable unit cost in admin; estimated costs may be used until final supplier costs are known
- Invoice and receipt style: generate a luxury Whiffs Maldives invoice/receipt with a refined layout, item summary, GST breakdown, total, order details, and barcode/QR-style reference; avoid playful illustrations

### Design

- Dark mode priority: not required for MVP

## Final Pricing Formula

The default target gross margin is approximately 40%.

Customer-facing prices should include GST in the final displayed price.

```text
item_cost = fragrance_cost_per_ml * decant_size_ml
          + packaging_cost
          + payment_or_operations_buffer

pre_tax_price = item_cost / (1 - target_gross_margin)

gst_inclusive_price = pre_tax_price * (1 + gst_rate)

final_customer_price = gst_inclusive_price rounded up to nearest MVR 5
```

Example using 40% target gross margin:

```text
Bottle purchase cost: MVR 1,200
Usable volume: 96 ml
Fragrance cost per ml: 1,200 / 96 = MVR 12.50

Decant size: 5 ml
Fragrance cost: 12.50 * 5 = MVR 62.50
Packaging cost: MVR 12.00
Operations buffer: MVR 5.00

Item cost: 62.50 + 12.00 + 5.00 = MVR 79.50
Pre-tax price at 40% gross margin: 79.50 / 0.60 = MVR 132.50
GST-inclusive price at 8% GST: 132.50 * 1.08 = MVR 143.10
Final customer price: rounded up to MVR 145
```

Promotions and discounts should be controlled. Since the default margin is 40%, large discounts such as 20% off should normally be limited to selected products rather than used as a broad sitewide offer.

This means the admin pricing tool should let the owner adjust:

- Usable bottle volume
- Packaging cost
- Operations buffer
- Target gross margin
- GST rate
- Final rounded selling price

## Invoice and Receipt Direction

Invoices and receipts should feel like part of the premium Whiffs Maldives experience.

The layout may take inspiration from tall receipt-style order summaries with clear spacing, a strong status headline, payment summary, itemized rows, totals, and a barcode or QR-style reference. The visual treatment should be minimal luxury rather than playful: no cartoon courier or bitmoji-style artwork.

Use the Whiffs Maldives logo in the receipt header once the final touched-up logo asset is provided.

Required information:

- Whiffs Maldives brand mark or wordmark
- Order number
- Invoice or receipt date
- Customer name and contact
- Delivery method and address or handoff details
- Itemized fragrance offerings, sizes, quantities, and prices
- Discount line when applicable
- Delivery fee line, even when MVR 0
- GST amount and GST-inclusive total
- Payment method and payment status
- Barcode or QR-style order reference

## Remaining Open Items

### Branding

- Final touched-up logo asset

### Technical

- Email and WhatsApp notification providers
- Testing tools and coverage standards
- Deployment and observability stack

### Business

- Final real-world supplier costs for each packaging material

### Design

- High-fidelity homepage
- High-fidelity fragrance page
- Admin dashboard visual design
- Workspace responsive behavior details
- Final invoice/receipt visual design after the touched-up logo is available

### Later Roadmap

- Full bottle inventory workflow
- Discovery sets
- Gift boxes
- Loyalty
- Subscriptions
- Reviews and community
- Recommendation engine
