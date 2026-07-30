# Business Rules and Decision Log

## Catalog and Offerings

- Fragrance is the primary entity customers browse.
- Customers select an offering from the fragrance page.
- Initial decant sizes are 2 ml, 5 ml, and 10 ml.
- The architecture supports future full bottle and gift offerings.
- A fragrance can remain in the catalog even when unavailable.
- A fragrance may be set to draft, active, inactive, or archived.
- Fragrance records are not permanently deleted when they have history.

## Bottle Inventory

- Each physical bottle is tracked individually.
- One fragrance can have multiple bottles.
- The first received bottle is used first.
- This is a FIFO allocation strategy.
- One bottle can fulfill multiple orders.
- A new bottle is added to an existing fragrance rather than recreating the fragrance.
- A bottle can later be made inactive or archived.
- The low-stock alert defaults to 50% remaining and should be configurable.
- A 100 ml bottle is expected to provide approximately 95–97 ml of usable volume.
- Expected usable volume is configurable rather than hardcoded.
- Inventory adjustments cover spills, evaporation, residue, corrections, and discrepancies.
- Tester sprays are not included in the MVP.

## Inventory Timing

- Placing an unpaid order does not reserve fragrance volume.
- Inventory becomes committed after payment is confirmed.
- Actual volume deduction occurs when preparation starts and the decant is filled.
- If payment is not fulfilled within the configured period, the order is cancelled.
- If insufficient volume is discovered during preparation, another approved bottle is used when available.
- When another bottle is unavailable, the customer may wait, choose a replacement, or receive a partial fulfillment and adjusted total.

## Orders

- Customers can order different decant sizes in one order.
- Customers cannot order an offering when sufficient volume is unavailable.
- Unavailable offerings remain visible and are marked out of stock.
- Before payment confirmation, an order may be edited.
- After payment confirmation, additional items should normally be placed in a separate order.
- Orders can be partially fulfilled.
- Partial fulfillment requires recalculating the total and handling the difference.
- Customer agreement should be recorded before removing or replacing paid items.
- Labels are generated and printed manually by the owner.

## Payments

- Initial payment methods are bank transfer and cash on delivery.
- Manual payment confirmation is required for bank transfers.
- Payment proof, reference, verifier, and confirmation timestamp should be recorded.

## Delivery

- Male' delivery is supported.
- Island orders can be delivered to a boat or speedboat.
- Delivery configuration should be flexible enough for future courier integrations.

## Packaging

- One standardized atomizer is used for each decant size.
- Packaging is defined through configurable packaging profiles.
- A packaging profile acts like a recipe.
- Packaging items can include atomizers, labels, boxes, shredded paper, ribbon, thank-you cards, stickers, and future additions.
- Packaging profiles should be versioned or snapshotted on orders so historical orders retain their original checklist.
- Packaging components can be required or optional.
- Each packaging material should have a configurable cost in admin.
- Packaging material costs feed into pricing calculations.
- Exact packaging costs may remain estimated until supplier sourcing is finalized.

## Procurement

- Initial bottles are sourced from trusted genuine local retailers.
- Supplier must be recorded for every bottle.
- Full procurement and purchase-order management is postponed.
- The MVP records supplier, cost, date, bottle size, and optional receipt/reference.
