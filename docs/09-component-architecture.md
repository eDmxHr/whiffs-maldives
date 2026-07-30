# Component Architecture

## Component Layers

```text
Base UI primitives
→ shadcn components
→ application UI components
→ capability components
→ domain components
→ page patterns
→ routes/pages
```

## Primitive Layer

Built using shadcn and Base UI:

- Button
- Badge
- Input
- Textarea
- Checkbox
- Select
- Combobox
- Dialog
- Drawer
- Popover
- Tooltip
- Tabs
- Card
- Table

Primitive variants such as `default`, `outline`, `secondary`, `ghost`, `link`, and `destructive` remain available.

## Application Components

Reusable components that compose primitives:

- Page
- PageHeader
- Container
- Section
- SectionHeader
- EmptyState
- DataTable
- MetricCard
- Timeline
- ActivityFeed
- ConfirmDialog
- SearchInput
- Loading and skeleton components

## StatusBadge

`StatusBadge` must be built using the shadcn `Badge` component.

The consumer passes business status, not styling details.

```tsx
<StatusBadge status={order.status} config={orderStatusConfig} />
```

The configuration resolves:

- Label
- Badge variant
- Hugeicon
- Optional semantic classes
- Description

The same component supports order, payment, bottle, fulfillment, customer, and shipment statuses.

## Button Rules

### Extend the base Button for universal behavior

The shadcn Button should support loading behavior:

```tsx
<Button loading={isPending} loadingText="Saving...">
  Save Changes
</Button>
```

Loading must:

- Disable the button
- Prevent repeated submission
- Show a spinner
- Optionally replace the label
- Preserve button width where practical

### Repeated CTA patterns

A dedicated CTA component can wrap the base Button when it encapsulates repeated design decisions.

```tsx
<CTAButton>Browse Fragrances</CTAButton>
```

Do not create wrappers such as `SaveButton` or `DeleteButton` when they add no reusable behavior or design decision.

## Domain Components

Examples:

- FragranceCard
- OfferingCard
- NotePyramid
- AccordMeter
- PerformanceMeter
- BottleGauge
- InventoryHealth
- PackagingProfileCard
- ReadinessCard
- OrderTimeline

## Presentation Rule

Components receive data and callbacks through props.

They should not fetch data or own business rules.

```text
Feature hook owns data and mutations
→ page coordinates
→ components render props
```

## Component Contract

Each reusable component documents:

- Purpose
- Props
- Events/callbacks
- Variants
- Loading, empty, error, disabled states
- Accessibility
- Dependencies
- Tokens used
