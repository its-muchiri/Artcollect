# ArtCollect — Core Features

## Title & Overview

This document defines ArtCollect’s functional scope for artwork management, physical and digital sales, enquiries, and visual-media delivery. It focuses on a curated marketplace workflow that preserves artist context and operational clarity.

## Key Specifications

### Artwork listing management

- Artists or authorised gallery staff create drafts with title, artist, medium, year, dimensions, description, category, tags, pricing, availability, edition details, and media.
- Moderation workflow: `draft` → `submitted` → `published` or `changes_requested`; staff can archive or unpublish listings with an audit record.
- Support originals, open/limited editions, prints, commissions, and digital downloads as explicit variant types.
- Prevent sales of sold/reserved original works; preserve public pages with an unavailable state for SEO and provenance unless deletion is required.

### Physical art sales workflow

1. Buyer selects an available variant and confirms delivery region, shipping estimate, and terms.
2. System creates an order snapshot and starts approved payment flow.
3. Confirmed payment reserves/sells inventory, notifies buyer and fulfiller, and records fulfilment milestones.
4. Staff tracks packing, dispatch, carrier/tracking, delivery, cancellation, and refund states.

- Shipping price, insurance, taxes/duties, framing, packaging, and delivery restrictions must be explicit before payment confirmation.
- High-value originals should support a manual verification/invoice route when risk or logistics require it.

### Digital art workflow

- Release download only after confirmed payment.
- Store protected master files privately; issue signed, expiring download links and maintain purchase/download audit history.
- Set configurable download limits, licence text, file metadata, and support resend access for verified buyers.

### Enquiry and commissions

- Artwork and artist enquiry forms capture name, contact method, message, budget/interest type, consent, and relevant artwork reference.
- Use anti-spam controls, server-side validation, response SLA status, internal assignment, and email notifications.
- Allow commission requests without exposing personal contact details publicly; support moderation and an organiser/artist response workflow.

### Media optimisation

- Accept source formats according to a defined policy; validate file type, size, dimensions, malware risk, and ownership declaration.
- Generate responsive AVIF/WebP/JPEG derivatives, blurred placeholders, thumbnails, and zoom-friendly master derivatives.
- Preserve colour profiles where practical; record photographer/artist credit, alt text, captions, copyright, and licensing fields.
- Use CDN delivery, lazy loading, and object-storage lifecycle policies; never expose private digital masters through predictable public URLs.

### Admin and analytics

- Dashboards for listing status, sales/inquiries, conversion, media-processing failures, fulfilment exceptions, and support queue.
- Track product analytics for browse, filter, artwork view, save, enquiry, add-to-cart, checkout start, purchase, and event-ticket CTA.
- Record consent and provide privacy-aware export/deletion workflows.

## Actionable Steps

- [ ] Build artist/gallery listing forms with draft, review, and publish states.
- [ ] Implement inventory, variant, and immutable order snapshots.
- [ ] Integrate a payments/fulfilment workflow for physical works and signed delivery for digital works.
- [ ] Build enquiry, commission, notification, and staff-assignment workflows.
- [ ] Implement secure media upload, derivative generation, CDN delivery, and moderation checks.
- [ ] Add analytics events and operational dashboards.

## Dependencies

- Requires schemas in `03_database_schema.md`, UI patterns in `04_artcollect_wireframes_and_ui.md`, and payment/security controls in `07_payments_and_security.md`.
- Event-specific ticket actions must conform to `08_cross_platform_integration.md`.
