# ArtCollect & TikoYetu — Database Schema

## Title & Overview

This document defines the PostgreSQL data model for the shared ecosystem. ArtCollect owns art, artist, editorial, and event-discovery data; TikoYetu owns inventory, orders, payments, issued tickets, and validation records. All time values use UTC and all money values use integer minor units plus an ISO currency code.

## Key Specifications

### Database conventions

- Use PostgreSQL with UUID primary keys, `created_at`, `updated_at`, and a nullable `deleted_at` where soft deletion is appropriate.
- Store money as `amount_minor BIGINT` and `currency CHAR(3)`; never use floating-point amounts.
- Use database foreign keys, unique constraints, check constraints, and transactions for inventory and payment invariants.
- Separate schemas or databases by ownership: `artcollect` for portal content and commerce; `tikoyetu` for ticketing and payment operations. Share only explicit IDs/contracts.
- Store files in object storage, retaining media metadata and object keys—not binary files—in PostgreSQL.

### Core identity tables

| Table | Purpose | Essential fields |
| --- | --- | --- |
| `users` | Account holder identity | `id`, `email`, `phone_e164`, `name`, `status`, timestamps |
| `user_roles` | Scoped role assignment | `user_id`, `role`, `scope_type`, `scope_id` |
| `sessions` | Authenticated sessions | `id`, `user_id`, `expires_at`, `ip_hash`, `user_agent` |
| `organisations` | Galleries, organisers, and businesses | `id`, `name`, `slug`, `type`, `verification_status` |
| `organisation_members` | Organisation memberships | `organisation_id`, `user_id`, `role`, `status` |
| `api_tokens` | Machine/API access | `id`, `owner_type`, `token_hash`, `scopes`, `expires_at`, `last_used_at` |

- Roles include `artist`, `curator`, `organiser`, `validator`, `support`, `moderator`, and `admin`; authorisation is enforced server-side and scoped to an organisation or event where applicable.
- Store token hashes only. Tokens must be prefix-identifiable, revocable, scoped, and never logged.

### ArtCollect content and commerce tables

| Table | Purpose | Essential fields |
| --- | --- | --- |
| `artist_profiles` | Artist/photographer public presence | `user_id`, `slug`, `bio`, `location`, `website_url`, `visibility` |
| `artworks` | Art/photography listing | `id`, `artist_id`, `title`, `slug`, `medium`, `year_created`, `description`, `status` |
| `artwork_variants` | Original, edition, print, or digital SKU | `id`, `artwork_id`, `type`, `price_minor`, `currency`, `stock_quantity`, `edition_size` |
| `artwork_media` | Ordered images/video metadata | `id`, `artwork_id`, `storage_key`, `alt_text`, `width`, `height`, `sort_order` |
| `collections` / `collection_items` | Curated groupings | ownership, slug, title, item ordering |
| `art_inquiries` | Buyer questions and leads | `artwork_id`, contact fields, message, `status`, assignee |
| `art_orders` / `art_order_items` | Art purchase records | buyer details, state, totals, fulfilment state, variant snapshot |

- Artwork statuses: `draft`, `submitted`, `published`, `reserved`, `sold`, `archived`.
- Keep immutable order item snapshots for title, artist, price, tax, and shipping details at time of purchase.

### Event and ticketing tables

| Table | Owner | Purpose |
| --- | --- | --- |
| `events` | ArtCollect | Editorial event record: title, slug, venue, schedule, imagery, organiser, publication state |
| `ticketing_event_links` | Shared contract | Maps ArtCollect `event_id` to canonical TikoYetu `ticketing_event_id`, checkout URL, sync state |
| `ticketing_events` | TikoYetu | Canonical ticketed-event settings: timezone, sales window, currency, status, terms |
| `ticket_tiers` | TikoYetu | General admission tiers: name, price, capacity, sales limits, visibility |
| `venue_sections` / `seats` | TikoYetu | Optional assigned-seat inventory | 
| `inventory_holds` | TikoYetu | Short-lived checkout reservations, expiry, quantity, tier/seat references |
| `orders` / `order_items` | TikoYetu | Ticket order and immutable price/fee/tax snapshots |
| `payments` | TikoYetu | Provider, provider reference, status, amount, webhook event IDs |
| `tickets` | TikoYetu | One record per attendee entitlement and encrypted/tokenised QR payload reference |
| `ticket_scans` | TikoYetu | Validation attempts, result, validator/device, timestamp, reason |
| `refunds` | TikoYetu | Refund amount, reason, provider reference, status |

- Ticketing event statuses: `draft`, `ready`, `on_sale`, `sales_paused`, `sold_out`, `ended`, `cancelled`, `archived`.
- Order statuses: `pending_payment`, `paid`, `payment_failed`, `expired`, `partially_refunded`, `refunded`, `cancelled`.
- Ticket statuses: `active`, `transferred`, `voided`, `checked_in`, `expired`.
- Use a transaction with row locks or a proven atomic query for capacity decrement/hold creation to prevent overselling.

### Important constraints and indexes

- Unique: normalised `users.email`, `artist_profiles.slug`, public artwork/event slugs, API-token hash, provider payment reference, QR token hash, and one ArtCollect-to-TikoYetu event link per ticketed event.
- Check: inventory quantities are non-negative; hold expiry is after creation; refunded amount cannot exceed paid amount; a ticket scan is event-compatible.
- Index: published artwork/event filters, event start times, organiser dashboards, ticket tier availability, payment provider reference, QR lookup hash, and event-scoped scans.
- Record immutable audit events for privileged actions, payment transitions, ticket issue/void/transfer, price changes, and entry scans.

### Privacy, retention, and reporting

- Keep personal data limited to what fulfilment, support, payment, and legal requirements demand.
- Separate sensitive payment-provider references from public event and ticket display data.
- Define retention schedules for failed checkouts, scans, support records, audit logs, and deleted accounts before launch.
- Use read-only reporting views/materialised views for sales, attendance, and artwork performance; do not run heavy reports on checkout-critical queries.

## Actionable Steps

- [ ] Create the Prisma schema, migration policy, naming conventions, and seed data for development.
- [ ] Implement identity, organisation, role, and API-token tables first.
- [ ] Implement ArtCollect artwork, media, inquiry, order, and event tables.
- [ ] Implement ticket tiers, holds, orders, payments, tickets, scans, refunds, and audit tables with required constraints.
- [ ] Write transactional inventory tests for simultaneous checkout requests.
- [ ] Add indexes based on primary browse, checkout, scan, and dashboard queries.
- [ ] Document data retention, export, deletion, backup, and restore procedures.

## Dependencies

- Builds on the boundaries and hosting decisions in `01_project_overview.md` and `02_tech_stack_and_infrastructure.md`.
- Must be implemented before the feature, ticketing, payment, and integration work described in documents 05–08.
- Schema details should be validated against payment-provider and legal requirements in `07_payments_and_security.md`.
