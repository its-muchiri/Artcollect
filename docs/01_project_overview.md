# ArtCollect & TikoYetu — Project Overview

## Title & Overview

ArtCollect is a curated digital destination for discovering, showcasing, and purchasing art and photography, while also promoting cultural events. TikoYetu (`tikoyetu.co.ke`) is the dedicated ticketing service for those events, providing a secure purchase, delivery, validation, and attendance-management experience.

Together, the platforms form one connected cultural-commerce ecosystem: ArtCollect builds discovery and audience interest; TikoYetu converts event interest into verified attendance. They should feel visually and operationally connected while remaining independently deployable products with clear responsibilities.

## Key Specifications

### Product vision

- Position ArtCollect as a trusted, contemporary home for East African and global visual culture, including original art, limited editions, photography, artist stories, exhibitions, workshops, and cultural events.
- Position TikoYetu as a reliable, mobile-first Kenyan ticketing platform for event organisers and attendees, with fast checkout, QR tickets, and door validation.
- Support future expansion beyond Kenya without coupling core business logic to a single market or payment provider.
- Design every primary attendee flow for mobile use first, while providing polished desktop experiences for collectors, artists, curators, organisers, and administrators.

### Platform responsibilities

| Area | ArtCollect | TikoYetu |
| --- | --- | --- |
| Art discovery and sales | Primary owner | Not included |
| Artist, gallery, and photographer profiles | Primary owner | Referenced only when relevant to an event |
| Event editorial and discovery | Primary owner | Receives linked event data |
| Ticket inventory and pricing | Displays availability supplied by TikoYetu | Primary owner |
| Ticket checkout and payment | Sends users to the ticket purchase flow | Primary owner |
| QR ticket creation and delivery | Not included | Primary owner |
| Entrance scanning and attendance reports | Displays optional summary data | Primary owner |
| Shared identity and branding | Shared design language; future SSO-ready | Shared design language; future SSO-ready |

### Core user personas

#### ArtCollect visitors and buyers

- **Art lover / collector:** Browses curated work, discovers artists, saves favourites, submits enquiries, and purchases physical or digital work.
- **Photography enthusiast:** Explores photographic series, prints, exhibitions, and artist narratives; may purchase prints or attend related events.
- **Casual cultural explorer:** Arrives through social media or search, discovers an exhibition or event, and needs a clear path to ticket purchase.

#### ArtCollect contributors

- **Artist / photographer:** Builds a profile, presents a portfolio, lists available work, manages availability, and receives sales or enquiry notifications.
- **Gallery / curator:** Publishes collections, exhibitions, and editorial context; may collaborate with artists and organisers.
- **Event organiser:** Creates or submits events for discovery on ArtCollect and manages ticket settings, sales, scans, and reporting in TikoYetu.

#### TikoYetu users

- **Ticket buyer / attendee:** Selects a ticket tier or seat, checks out using a trusted payment method, receives a QR ticket, and presents it at entry.
- **Door staff / validator:** Uses a restricted scanning interface to verify ticket authenticity and prevent duplicate entry.
- **Platform administrator:** Reviews listings, manages users and permissions, resolves payment or ticket issues, and monitors platform health.

### Brand identity and experience principles

- **ArtCollect personality:** Editorial, warm, intelligent, expressive, and premium without becoming exclusive or intimidating.
- **TikoYetu personality:** Clear, dependable, welcoming, fast, and reassuring—especially at payment and entry moments.
- **Shared visual system:** Use aligned typography, colour foundations, spacing, iconography, and accessibility standards so users recognise both services as part of one ecosystem.
- **Product distinction:** ArtCollect should favour immersive imagery and storytelling; TikoYetu should prioritise clarity, conversion, and operational reliability.
- **Accessibility baseline:** Meet WCAG 2.2 AA where practical, including keyboard support, meaningful image alternatives, adequate colour contrast, visible focus states, and mobile-friendly target sizes.
- **Trust signals:** Clearly identify organisers, ticket terms, payment status, refund/cancellation policies, secure checkout indicators, and customer support routes.

### Ecosystem workflow

1. An artist, curator, gallery, or organiser publishes an artwork, exhibition, or event for ArtCollect discovery.
2. ArtCollect presents the event page with editorial details: date, venue, programme, artist/organiser information, imagery, and ticket availability summary.
3. If the event requires tickets, the primary call to action routes the visitor to the matching TikoYetu purchase page, carrying a verified event reference and source attribution.
4. TikoYetu shows live ticket tiers, availability, fees, checkout terms, and payment methods. It completes payment and issues a unique QR ticket after confirmed payment.
5. TikoYetu sends the buyer confirmation through the selected delivery channels, initially email and a web-based ticket wallet; SMS/WhatsApp can be introduced when operationally approved.
6. At the venue, authorised staff scan the QR ticket. TikoYetu records the validation outcome, time, device/staff context, and prevents repeat admission.
7. TikoYetu makes selected aggregate outcomes available to ArtCollect, such as sold-out status or remaining-ticket messaging, without exposing buyer personal data.

### Key product boundaries

- ArtCollect must never treat an event as ticketed until TikoYetu has created the canonical ticketing event and returned a stable event identifier.
- TikoYetu is the source of truth for ticket types, inventory, order state, payment state, QR token status, check-in status, and refunds.
- ArtCollect is the source of truth for art listings, artist content, editorial event presentation, and non-ticket event discovery metadata.
- Each platform must have independently versioned APIs, separate operational roles, and auditable data access.
- A user should not need to create duplicate accounts for the first release if guest ticket checkout is enabled; shared authentication can be introduced after privacy, consent, and account-linking requirements are defined.

### Success measures for the initial release

- Visitors can discover an artwork, artist, exhibition, or event from a mobile device in a small number of clear navigation steps.
- An event visitor can reach the correct TikoYetu checkout from ArtCollect with no ambiguous hand-off or duplicate event pages.
- Confirmed payments produce one valid, scannable ticket per ticket quantity, with reliable delivery and support recovery options.
- Door staff can validate tickets quickly with clear valid, invalid, already-used, and offline/error states.
- Organisers and administrators can see event sales, payment, and attendance status without manual reconciliation for ordinary orders.

## Actionable Steps

- [ ] Confirm the initial launch geography, currencies, languages, and tax/receipt requirements.
- [ ] Approve the ArtCollect and TikoYetu positioning statements and shared brand direction.
- [ ] Define launch roles, permissions, and account onboarding requirements for artists, organisers, validators, and administrators.
- [ ] Establish a canonical event lifecycle: draft, submitted, approved, published, ticketing active, closed, cancelled, and archived.
- [ ] Agree on the minimum event data ArtCollect sends to TikoYetu and the availability/status data TikoYetu returns.
- [ ] Define customer-support ownership for artwork orders, ticket orders, refunds, event cancellation, and entry disputes.
- [ ] Document legal pages required for launch: terms of use, privacy policy, ticket terms, refund policy, and organiser agreement.
- [ ] Validate the launch success measures with stakeholders and convert them into measurable analytics events.

## Dependencies

- This overview guides all subsequent architecture, data model, UX, ticketing, security, integration, and launch documents.
- The next document, `02_tech_stack_and_infrastructure.md`, depends on the agreed platform boundaries, mobile-first requirements, and domain roles established here.
- `03_database_schema.md` will formalise the users, event ownership, art listings, tickets, orders, and roles described in this document.
- The content, visual direction, and operating policies defined here should be approved before finalising public UI copy, payment flows, and contractual terms.
