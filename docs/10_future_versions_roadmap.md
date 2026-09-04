# ArtCollect & TikoYetu — Future Versions Roadmap

## Title & Overview

This document records post-launch product versions for ArtCollect and TikoYetu. The roadmap is intentionally outcome-led: each version should solve a validated customer or operational problem, preserve the core platform boundaries, and ship behind measurable release criteria.

## Key Specifications

### Version 1.1 — Stabilisation and conversion

**Target outcome:** Make the first release dependable and easier to use.

- Improve search, filters, saved artworks, artist follows, and event reminders.
- Add buyer order history, ticket resend, clearer payment-pending recovery, and support self-service.
- Add organiser sales exports, richer attendance reports, and improved validator error handling.
- Add automated image-quality guidance and faster media processing.
- Measure browse-to-enquiry, browse-to-checkout, payment completion, ticket delivery, and scan success rates.

**Release gate:** Support volume and critical payment/ticket defects remain below agreed thresholds for at least one full event cycle.

### Version 1.2 — Marketplace and organiser tooling

**Target outcome:** Increase supply quality and reduce manual operations.

- Add artist onboarding, profile verification, collection management, commissions, and gallery collaboration workflows.
- Add discount/promo codes, complimentary ticket workflows, waitlists, and configurable organiser fees.
- Add shipping-rate integrations and fulfilment status notifications for physical art.
- Introduce a content scheduling calendar for events and editorial campaigns.

**Release gate:** New workflows have clear permissions, audit history, refund rules, and tested reporting reconciliation.

### Version 2.0 — Accounts, personalisation, and ticket flexibility

**Target outcome:** Create a connected member experience without forcing account creation at checkout.

- Offer optional shared ArtCollect/TikoYetu identity with explicit consent and account-linking controls.
- Add personalised recommendations, collections, favourites sync, artist follows, and event reminders.
- Add ticket transfer, named-attendee updates, gift tickets, and controlled resale/waitlist flows.
- Add QR wallet support for mobile home-screen access and optional Apple/Google wallet passes where commercially approved.

**Release gate:** Privacy review, identity-recovery testing, abuse controls, and support procedures are complete before enabling account linking or transfers.

### Version 2.1 — Regional payments and operations

**Target outcome:** Support broader East African event and art commerce use cases.

- Add configurable country, currency, tax, language, and venue-timezone settings.
- Add additional mobile-money and card providers after country-specific compliance review.
- Support multi-currency display while preserving one authoritative settlement currency per order.
- Add regional shipping zones, customs notes, and local fulfilment partners.
- Add organiser sub-accounts, settlement statements, and payout reconciliation.

**Release gate:** Legal, tax, payment, data-protection, and support readiness confirmed for each new market independently.

### Version 3.0 — Platform ecosystem and advanced experiences

**Target outcome:** Enable partners and richer cultural experiences at scale.

- Publish partner APIs and webhooks for approved galleries, venues, CRM systems, and event-discovery partners.
- Add embeddable ArtCollect artwork galleries and TikoYetu ticket widgets.
- Add seat-map authoring, timed entry, multi-day passes, bundles, memberships, and access zones.
- Add digital certificates/provenance records and optional licence-managed digital artwork delivery.
- Introduce advanced analytics with privacy-preserving cohort reporting and organiser benchmarks.
- Evaluate service extraction, regional hosting, and event-specific capacity architecture only when measured scale justifies the complexity.

**Release gate:** Public API governance, versioning, partner authentication, rate limits, billing, and incident ownership are defined before external access.

### Cross-version product principles

- Preserve ArtCollect as the discovery/editorial/art-commerce experience and TikoYetu as the ticketing/payment/validation authority.
- Prefer reversible feature flags and staged rollouts for payment, identity, transfer, offline scanning, and new-market features.
- Treat payment, identity, ticket, and personal-data changes as security and privacy releases—not only UI work.
- Keep public URLs and stable IDs backward compatible; provide migration and deprecation windows.
- Review roadmap priorities quarterly using revenue, conversion, reliability, support, artist/organiser adoption, and attendee feedback.

## Actionable Steps

- [ ] Convert the roadmap into quarterly objectives with an owner, target date, budget, and success metric for each item.
- [ ] Instrument the Version 1 launch metrics needed to decide Version 1.1 priorities.
- [ ] Create a feature-flag and staged-rollout policy for high-risk capabilities.
- [ ] Maintain a compatibility and migration register for database, API, URL, payment, and identity changes.
- [ ] Run a quarterly roadmap review with product, engineering, operations, finance, support, and representative artists/organisers.

## Dependencies

- Depends on the launch foundation and operating procedures in `01_project_overview.md` through `09_launch_and_maintenance.md`.
- Each future version must update the database, security, integration, testing, and maintenance documents before implementation.
- Regional expansion requires fresh legal, payment, tax, privacy, and infrastructure assessment for every target country.
