# TikoYetu — Ticketing Engine

## Title & Overview

This document defines the ticketing engine hosted on `tikoyetu.co.ke`: event configuration, tier and seat inventory, checkout reservations, QR ticket issuance, buyer access, and venue validation.

## Key Specifications

### Event configuration

- Organisers create a ticketing event tied to a verified ArtCollect event reference or, where approved, an independent event.
- Required fields: event title, organiser, venue, timezone, start/end times, sales start/end, currency, ticket terms, contact, and cancellation policy.
- Support general-admission tiers, complimentary tickets, promotional codes, add-ons, donation amount, and optional assigned seating.
- All public copy and ticket tier changes after sales begin require an audit trail; capacity/price reductions must validate existing commitments.

### Inventory and holds

- Tier configuration includes capacity, per-order min/max, sales channel, visibility, price/fees/taxes, and sales window.
- Checkout creates a short-lived server-side inventory hold. Holds expire automatically and must be released idempotently.
- Availability is computed from capacity minus paid/issued commitments and active valid holds; never trust client-supplied availability.
- Seat assignments use a per-seat lock/hold and prohibit double allocation through database constraints and transactions.

### Checkout and order lifecycle

1. Buyer selects tier(s)/seat(s), supplies required attendee and contact information, and accepts terms.
2. Server validates sales rules and creates a pending order plus inventory hold.
3. Buyer completes payment through the selected provider.
4. Verified payment webhook marks the order paid exactly once, issues tickets, generates QR payloads, sends confirmation, and releases unused hold capacity.
5. Failed/expired payment leaves no sellable inventory permanently consumed.

- Guest checkout is supported; authenticated buyers gain wallet/history and transfer options when enabled.
- Receipt and ticket confirmation must display order reference, event details, ticket count, payment summary, support path, and entry instructions.

### QR generation and ticket delivery

- Create one unique ticket for each admission entitlement, not one QR code per order.
- QR payload contains an opaque, signed/tokenised identifier; never encode buyer name, email, payment information, or predictable ticket IDs.
- Store only a hash/reference for lookup where feasible; support key rotation and ticket void/reissue.
- Deliver tickets through email and a secure web ticket page. QR images/PDF passes are conveniences; server validation remains authoritative.

### Validator and scanning operations

- Scanner PWA requires validator sign-in and event-scoped permission.
- Scan outcomes: valid/allow entry, already checked in, invalid/unrecognised, voided/refunded, wrong event, expired, or temporary service/offline error.
- Successful scans atomically set first-entry state and record timestamp, validator, device/session, and gate where supplied.
- Offline validation is a later capability unless venues demonstrably require it; it needs signed locally cached ticket manifests, strict expiry, conflict resolution, and post-sync audits.

### Organiser console and reporting

- Event dashboard shows live sales, capacity, gross/net estimates, payment states, refunds, check-ins, sales channels, and tier breakdowns.
- Provide exports with access controls and minimum necessary personal data.
- Support customer ticket lookup/resend/void under audited support permissions.

## Actionable Steps

- [ ] Implement ticketing event, tier, seat, hold, order, ticket, and scan models.
- [ ] Build atomic capacity and seat-reservation operations with concurrency tests.
- [ ] Build mobile checkout, order confirmation, buyer ticket wallet, and ticket resend flow.
- [ ] Generate opaque signed QR tickets and build the validator PWA.
- [ ] Build organiser dashboards, support tools, reporting, and audit trails.
- [ ] Load test event on-sale and venue check-in paths.

## Dependencies

- Depends on schema and infrastructure choices in documents 02–03.
- Payment confirmation, webhook rules, and security controls are defined in `07_payments_and_security.md`.
- ArtCollect event linking is defined in `08_cross_platform_integration.md`.
