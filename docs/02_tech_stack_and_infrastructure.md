# ArtCollect & TikoYetu — Technology Stack and Infrastructure

## Title & Overview

This document defines a pragmatic, production-ready technical foundation for ArtCollect and TikoYetu. The recommendation is a TypeScript-based monorepo with independently deployable web applications, a shared component and API-contract layer, PostgreSQL as the transactional database, managed object storage for media, and a secure deployment model that supports Kenya-first ticket sales and future regional growth.

## Key Specifications

### Recommended application architecture

- Use a **monorepo** managed with Turborepo and pnpm. This allows ArtCollect and TikoYetu to share types, UI primitives, validation schemas, authentication helpers, and API clients without forcing them into one deployment.
- Build ArtCollect and TikoYetu as separate **Next.js** applications using the App Router, TypeScript, and server-side rendering for SEO-sensitive public pages.
- Deploy each application independently so ticketing releases do not require redeploying the art marketplace, and vice versa.
- Keep business logic behind versioned HTTPS APIs. TikoYetu must expose ticket availability and purchase entry points through a dedicated ticketing API; ArtCollect consumes only the fields required for event presentation.
- Start with a modular monolith per platform rather than microservices. Extract a service only when operational scale, security isolation, or independent workload demands it.

### Proposed repository layout

```text
artcollect/
├── apps/
│   ├── artcollect-web/       # Public art, photography, artist, and event portal
│   ├── tikoyetu-web/         # Ticket storefront, buyer wallet, organiser console
│   ├── api/                  # Optional shared API gateway / backend modules
│   └── scanner/              # Progressive web app for ticket validation
├── packages/
│   ├── ui/                   # Shared accessible UI primitives and design tokens
│   ├── database/             # Prisma schema, migrations, and database client
│   ├── contracts/            # API DTOs, Zod schemas, and shared TypeScript types
│   ├── auth/                 # Session, roles, and authorization utilities
│   ├── config/               # Shared lint, TypeScript, and environment conventions
│   └── analytics/            # Event naming and analytics client helpers
├── infrastructure/           # IaC, deployment configuration, and runbooks
└── docs/                     # Product and technical documentation
```

### Frontend and user-interface choices

- **Framework:** Next.js (current stable release at implementation time) with React and TypeScript.
- **Styling:** Tailwind CSS with a shared token layer for colours, typography, spacing, elevation, and responsive breakpoints.
- **Components:** Build a small internal component library on accessible primitives such as Radix UI. Avoid adopting a large visual library that constrains ArtCollect’s editorial identity.
- **Forms and validation:** React Hook Form with Zod schemas, reusing validation rules on client and server.
- **Data fetching:** Server Components for public/read-heavy pages; TanStack Query only for interactive authenticated dashboards where cache invalidation and optimistic updates add value.
- **Image delivery:** Use responsive image components backed by an image CDN; preserve high-resolution source files while serving format- and viewport-appropriate derivatives.
- **Scanner:** A mobile-first PWA using the device camera, with a clearly bounded offline-capable validation queue if offline door operation is needed.

### Backend and API choices

- **Runtime:** Node.js LTS with TypeScript.
- **API style:** REST/JSON for public and operational APIs, documented through OpenAPI. Use webhooks for asynchronous payment and ticket-status events.
- **Validation:** Zod at every external boundary: form input, API requests, webhooks, environment variables, and job payloads.
- **ORM and migrations:** Prisma with explicit, reviewed migrations. Use raw SQL selectively for database constraints, reporting views, or performance-critical queries.
- **Background jobs:** Use a managed queue such as Upstash QStash or a Redis-backed worker for email delivery, QR generation, payment reconciliation, media processing, and retries.
- **Email:** Use a transactional provider such as Resend, Postmark, or Amazon SES. Email templates must be version-controlled and support ticket resend flows.
- **API documentation:** Publish an internal OpenAPI reference plus integration examples for ArtCollect-to-TikoYetu event links.

### Data, storage, and caching

- **Primary database:** Managed PostgreSQL, initially one production cluster with logically separated schemas or databases for ArtCollect and TikoYetu. Ticketing tables should be isolated enough to permit stricter access controls and later separation.
- **Provider options:** Neon, Supabase Postgres, AWS RDS, or a managed PostgreSQL service supported by the selected hosting region. Select based on regional latency, backups, point-in-time recovery, pricing, and team operating comfort.
- **Media storage:** S3-compatible object storage such as Cloudflare R2, AWS S3, or Supabase Storage. Store originals privately where appropriate and public derivatives behind a CDN.
- **CDN and edge controls:** Cloudflare for DNS, TLS, caching, WAF, bot controls, rate limiting, and media delivery. Use cache tags/revalidation for ArtCollect content updates.
- **Cache/session support:** Managed Redis only when needed for rate limits, queue work, short-lived inventory holds, or high-volume caching. Do not place permanent order or ticket truth in Redis.
- **Backups:** Enable daily backups, point-in-time recovery, encryption at rest, and a documented restore test at least quarterly.

### Hosting and environments

| Concern | Recommended approach |
| --- | --- |
| Web hosting | Vercel for both Next.js web apps, with independent projects and production deployments |
| API and workers | Begin with Next.js route handlers/server actions where suitable; deploy long-running workers to Railway, Render, Fly.io, or a cloud container service if needed |
| Database | Managed PostgreSQL with production, staging, and development isolation |
| Object storage | S3-compatible storage with separate production and non-production buckets |
| DNS, CDN, WAF | Cloudflare |
| Secrets | Vercel encrypted environment variables plus provider-native secret stores for workers; never commit secrets |
| Observability | Sentry for errors, structured logs, uptime monitoring, and privacy-conscious product analytics |

- Maintain three environments: **development**, **staging**, and **production**.
- Staging must use separate payment credentials, database, storage bucket, webhook endpoints, and email sender configuration from production.
- Require pull-request preview deployments for public UI review; production deployment must use protected branches and an approval path.
- Configure infrastructure through version-controlled configuration and, where appropriate, infrastructure-as-code rather than manual undocumented console changes.

### Domain and routing plan

| Domain / host | Purpose | Target |
| --- | --- | --- |
| `artcollect.co.ke` (or chosen primary domain) | ArtCollect public portal | ArtCollect web deployment |
| `www.artcollect.co.ke` | Canonical redirect or alternate public host | Redirect to primary ArtCollect host |
| `tikoyetu.co.ke` | TikoYetu public ticketing storefront | TikoYetu web deployment |
| `www.tikoyetu.co.ke` | Canonical redirect or alternate public host | Redirect to `tikoyetu.co.ke` |
| `api.tikoyetu.co.ke` | Optional public ticketing API | API gateway/service |
| `status.tikoyetu.co.ke` | Public uptime page | Monitoring provider |

### `tikoyetu.co.ke` configuration sequence

1. Register or transfer `tikoyetu.co.ke` with an approved registrar and ensure the organisation controls the registrar account, recovery email, and renewal method.
2. Add the domain to Cloudflare and update the registrar nameservers to the Cloudflare-assigned nameservers.
3. In the selected hosting provider, add `tikoyetu.co.ke` and `www.tikoyetu.co.ke` as custom domains for the production TikoYetu project.
4. Create the provider-required DNS records in Cloudflare—typically an apex `A`/`ALIAS` record and a `www` `CNAME`; use the exact target values displayed by the host rather than copying generic records.
5. Configure one canonical host: serve `https://tikoyetu.co.ke` and permanently redirect `https://www.tikoyetu.co.ke` to it.
6. Enable Full (strict) TLS in Cloudflare only after the origin certificate is valid. Enforce HTTPS and enable HSTS after confirming all subdomains and integrations work securely.
7. Create `api.tikoyetu.co.ke` only when the API is externally hosted; otherwise keep internal server APIs behind the primary application until separation is necessary.
8. Add SPF, DKIM, and DMARC DNS records for the approved ticket-email provider before sending production confirmations.
9. Configure payment-provider callback and webhook URLs on the canonical HTTPS domain; do not use temporary preview URLs in production payment settings.
10. Test DNS propagation, TLS, redirects, checkout callbacks, ticket email links, and QR-ticket links from mobile networks before launch.

### Authentication and authorization foundation

- Use an established authentication solution compatible with Next.js and PostgreSQL, such as Auth.js or Clerk, selected after evaluating local login, social login, account recovery, roles, data residency, and cost.
- Support guest ticket checkout at launch while retaining a secure order lookup and ticket-access method.
- Model roles explicitly: visitor, buyer, artist, gallery/curator, organiser, validator, support agent, content moderator, and administrator.
- Enforce least privilege in application code and database access. Door validators receive only the event-scoped permissions needed to scan tickets.
- Keep customer-facing sessions in secure, HttpOnly, SameSite cookies. Protect dashboard and scanner actions with server-side authorization checks, never UI-only checks.

### Reliability, security, and operational baseline

- Apply rate limits to authentication, checkout initiation, ticket lookup, scanning, upload, and public API endpoints.
- Verify cryptographic signatures on every payment webhook and make processing idempotent using provider event IDs.
- Use immutable audit records for payment status changes, refunds, ticket issuance, ticket transfers, and scans.
- Encrypt traffic with TLS; encrypt sensitive data at rest through managed providers; minimise collection of personally identifiable information.
- Configure error tracking, structured logging with redaction, uptime checks, alert routing, and a documented incident-response contact list.
- Set performance targets: fast mobile public pages, cached event discovery, and a ticket-scan response that remains usable during venue peak demand.

## Actionable Steps

- [ ] Create the Turborepo/pnpm workspace and initialise the ArtCollect and TikoYetu Next.js applications.
- [ ] Establish the shared `ui`, `contracts`, `database`, `auth`, and `config` packages.
- [ ] Select managed PostgreSQL, object storage, email, queue, observability, and hosting providers using cost, regional performance, support, and compliance criteria.
- [ ] Create isolated development, staging, and production accounts/projects, databases, buckets, and credentials.
- [ ] Configure branch protections, pull-request checks, preview deployments, and production release approval rules.
- [ ] Add environment-variable validation and create a secure secrets-management runbook.
- [ ] Register or verify ownership of `tikoyetu.co.ke`, then configure Cloudflare DNS, TLS, canonical redirects, and mail-authentication records.
- [ ] Define API versioning, OpenAPI publication, webhook signature verification, retry, and idempotency conventions.
- [ ] Implement initial security controls: role checks, audit logging, rate limits, error tracking, backups, and restore-test procedures.
- [ ] Run an end-to-end staging test covering an ArtCollect event link, TikoYetu checkout, payment callback, ticket delivery, and scanner validation.

## Dependencies

- Requires approval of the platform boundaries, audience, roles, and release goals in `01_project_overview.md`.
- The provider selections and environment layout here must be settled before implementing the migrations and access boundaries in `03_database_schema.md`.
- ArtCollect UI and feature work in `04_artcollect_wireframes_and_ui.md` and `05_artcollect_core_features.md` depend on the shared frontend, media, and authentication foundations.
- Ticketing, payment, and cross-platform integration specifications in `06_tikoyetu_ticketing_engine.md`, `07_payments_and_security.md`, and `08_cross_platform_integration.md` depend on the API, domain, queue, security, and environment conventions defined here.
