# ArtCollect & TikoYetu — Cross-Platform Integration

## Title & Overview

This document defines the contract that connects ArtCollect’s event discovery pages to TikoYetu’s authoritative ticketing experience. The integration is intentionally narrow, versioned, secure, and resilient to delayed updates.

## Key Specifications

### Ownership and identifiers

- ArtCollect owns public event editorial content and generates `artcollect_event_id`.
- TikoYetu owns ticket inventory and generates `ticketing_event_id`.
- The mapping table stores both immutable IDs, public slugs/URLs, integration state, last synchronisation time, and a correlation ID.
- Never use title matching as an integration key; titles and dates can change.

### Recommended integration pattern

- ArtCollect server calls a TikoYetu versioned API to create/link a ticketing event after the ArtCollect event is approved for ticket sales.
- TikoYetu returns the canonical public checkout URL and a limited ticket-status payload.
- ArtCollect uses server-side/cacheable status reads or signed TikoYetu webhooks to refresh display state. Do not proxy payment credentials or checkout requests through ArtCollect.
- Buyer clicks a direct HTTPS route to `https://tikoyetu.co.ke/events/{slug}` with source attribution, e.g. `utm_source=artcollect` and an opaque referral/correlation value.

### Contract fields

| Direction | Required data |
| --- | --- |
| ArtCollect → TikoYetu | stable event ID, title, organiser ID, timezone, start/end, venue, public URL, cover image URL, ticket terms/version |
| TikoYetu → ArtCollect | ticketing event ID, checkout URL, status, sales window, currency, minimum displayed price, remaining-status bucket, updated timestamp |
| TikoYetu webhook → ArtCollect | ticketing event ID, status/availability bucket, timestamp, event ID, signature, event type |

- Remaining status must be coarse (`available`, `low`, `sold_out`, `closed`) unless a business decision explicitly permits counts.
- ArtCollect must show a timestamped fallback state when status is unavailable and must not claim a ticket is available without a valid response.

### Security and resilience

- Authenticate service-to-service requests with short-lived signed tokens or mTLS/API keys stored in secrets management; scope credentials to the required endpoints.
- Sign webhooks, verify timestamp/replay protection, persist event IDs idempotently, and queue retries with exponential backoff.
- Version endpoints under `/v1`; make additive changes backwards compatible and deprecate with a published window.
- Include correlation IDs in logs across both platforms; redact buyer PII from cross-platform logs.
- TikoYetu remains operational if ArtCollect is unavailable; ArtCollect event pages should degrade gracefully if ticket status is delayed.

### User experience rules

- Event page CTA names TikoYetu clearly and opens the canonical ticket page in the same tab by default.
- Preserve campaign/referral attribution without exposing sensitive IDs.
- After purchase, TikoYetu confirmation links buyers to their ticket wallet; optionally include a return link to the ArtCollect event page.
- ArtCollect never displays a false “purchase complete” state; TikoYetu owns post-payment confirmation.

## Actionable Steps

- [ ] Define OpenAPI schemas and versioned endpoints for event linking and ticket-status reads.
- [ ] Implement immutable ID mapping, source attribution, correlation IDs, and signed service authentication.
- [ ] Implement signed TikoYetu-to-ArtCollect status webhooks plus polling/cache fallback.
- [ ] Build CTA states for unavailable, upcoming, on sale, low availability, sold out, closed, and cancelled events.
- [ ] Add contract, integration, resilience, and attribution tests.
- [ ] Create a shared operational runbook for mapping failures, event changes, cancellation, and ticket-status incidents.

## Dependencies

- Requires event, ticketing, API-token, and audit schemas from `03_database_schema.md`.
- Depends on TikoYetu checkout/security implementation in documents 06–07.
- Must be tested before launch procedures in `09_launch_and_maintenance.md`.
