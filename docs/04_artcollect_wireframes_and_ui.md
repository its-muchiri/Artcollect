# ArtCollect — Wireframes and UI

## Title & Overview

This document specifies the public ArtCollect experience: an image-led, accessible portal for artworks, photography, artists, and events. The interface should feel editorial and curated while keeping browsing, purchase enquiries, and ticket hand-offs straightforward.

## Key Specifications

### Global layout

- Header: logo, primary navigation (Explore, Art, Photography, Events, Artists), search, favourites, and account entry.
- Responsive navigation collapses to an accessible mobile drawer; retain search and a prominent Events route.
- Footer: newsletter, support, policies, artist/organiser links, social channels, and TikoYetu ticketing attribution where relevant.
- Use a 12-column desktop and 4-column mobile grid, generous whitespace, responsive image crops, and persistent keyboard focus states.

### Homepage

1. Editorial hero with featured collection/exhibition and one primary action.
2. Featured artworks carousel/grid with artist, medium, price or enquiry label, and availability.
3. Curated photography story/series block.
4. Upcoming events module with date, venue, ticket state, and “Get tickets” link where applicable.
5. Artist spotlight and short editorial bio.
6. Newsletter and community/support call to action.

### Gallery / storefront

- Search and filters for artist, medium, category, price, size, availability, location, and edition type.
- Card grid with progressive image loading, visible availability, accessible metadata, and save/enquiry affordances.
- Artwork detail: gallery/media viewer, title, artist, medium, dimensions, edition/provenance information, price, fulfilment notes, inquiry/purchase action, related work, and artist link.
- Do not hide meaningful item information solely in hover states.

### Event hub

- Event index includes calendar/list controls, filters for date, city/venue, event type, free/paid, and organiser.
- Event detail contains cover art, title, schedule in venue timezone, venue/map link, programme, accessibility details, organiser profile, terms, and related artwork/artists.
- Ticket state is obtained from TikoYetu: unavailable, upcoming, on sale, low availability, sold out, sales closed, or cancelled.
- A paid/ticketed event uses a clear external hand-off button: “Get tickets on TikoYetu”; preserve UTM/source parameters.

### Artist profiles

- Header: portrait/hero work, name, discipline, location, short bio, social/website links, and verification if applicable.
- Tabs/sections: Works, About, Exhibitions & Events, Collections, and contact/enquiry action.
- Profile URLs use stable slugs and allow preview before publication.

### Design system and accessibility

- Define tokens for brand colours, typography scale, spacing, radii, shadows, breakpoints, and motion duration.
- Support reduced motion, minimum 4.5:1 text contrast, meaningful alt text, semantic headings, skip links, and visible error/success feedback.
- Use skeletons for media-rich loading and clear empty states for no results, unavailable artwork, and no upcoming events.

## Actionable Steps

- [ ] Create low-fidelity flows for homepage, gallery, artwork detail, event index/detail, and artist profile.
- [ ] Approve design tokens and responsive grid rules.
- [ ] Build the shared header, footer, cards, filters, media viewer, forms, and status badges.
- [ ] Prototype ArtCollect-to-TikoYetu ticket hand-off on mobile and desktop.
- [ ] Perform keyboard, screen-reader, contrast, and mobile usability reviews.

## Dependencies

- Depends on the design direction in `01_project_overview.md`, stack in `02_tech_stack_and_infrastructure.md`, and content schema in `03_database_schema.md`.
- Informs implementation in `05_artcollect_core_features.md` and ticket CTA integration in `08_cross_platform_integration.md`.
