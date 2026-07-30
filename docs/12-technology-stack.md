# Technology Stack

## Frontend

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui using Base UI primitives
- Canela for editorial/display typography
- Manrope for interface and body typography
- Hugeicons

## Data and Forms

- Axios through `api-client.ts`
- TanStack Query
- TanStack Table where complex data tables are needed
- Zustand for global client-side UI state
- React Hook Form
- Zod

## Motion and Media

- Motion for React animations
- Yet Another React Lightbox for galleries

## Charts

Chart.js is the preferred default because it is mature, flexible, and does not impose a complete dashboard visual system.

Tremor may be reconsidered only if it materially reduces implementation and maintenance without conflicting with the custom design system.

## Architecture Principles

- Server-first where appropriate
- Client components only where interaction requires them
- Feature-owned architecture
- Composition over duplication
- Boring and maintainable technology over novelty
- Rich domain model with lean initial feature scope
