# ArtCollect & TikoYetu — Launch and Maintenance

## Title & Overview

This document sets the release gate, deployment process, testing programme, security review, monitoring, and operational cadence for both platforms. Launch is complete only when users can safely browse, buy, receive, and validate tickets under realistic conditions.

## Key Specifications

### Pre-launch checklist

- Complete content readiness: public pages, artwork metadata, artist permissions, events, venues, ticket terms, help pages, privacy policy, and refund/cancellation policy.
- Complete operational readiness: merchant accounts, production payment credentials, email sender verification, support ownership, refund authority, validator staffing, and event-day contacts.
- Complete technical readiness: production domains/TLS, DNS, backups, monitoring, alerts, WAF/rate limits, secrets, error tracking, analytics consent, and documented rollback.

### Testing programme

- Unit tests for pricing, inventory, holds, QR verification, permissions, webhook idempotency, and order/refund transitions.
- Integration tests for ArtCollect event linking, TikoYetu checkout, M-Pesa/card callbacks, ticket email, wallet access, scan outcomes, and refunds.
- End-to-end browser tests for mobile and desktop purchase flows, including pending payment and duplicate-scan paths.
- Accessibility tests: keyboard, screen-reader smoke tests, contrast, focus, form errors, and responsive layout.
- Performance/load tests: event discovery, ticket-sale opening, concurrent last-ticket attempts, scan throughput, and webhook burst handling.
- Security assessment: dependency scanning, configuration review, authenticated-authorisation tests, webhook signature tests, OWASP testing, and independent penetration testing before payment launch.

### Deployment and release process

1. Merge reviewed changes to protected branches after automated checks pass.
2. Deploy to staging, run smoke tests with sandbox payments and staging webhooks, then obtain release approval.
3. Create a tagged production release and deploy ArtCollect and TikoYetu independently in a defined order for integration changes.
4. Run production smoke tests: canonical domains, event links, payment initiation/callback, email delivery, QR wallet, and scanner validation.
5. Monitor error, payment, queue, database, and scan dashboards through the launch window; keep rollback owner and decision criteria explicit.

### Monitoring and incident response

- Alert on web/API availability, checkout errors, webhook verification failures, payment pending backlog, email failures, inventory anomalies, scan errors, database health, and certificate expiry.
- Maintain severity levels, on-call contacts, incident channel, customer communications owner, and post-incident review template.
- Retain structured/redacted logs and audit trails needed to investigate payment, ticket, and access issues.

### Maintenance cadence

| Cadence | Activities |
| --- | --- |
| Daily | Review errors, payment exceptions, failed jobs, ticket-support queue, and backups |
| Weekly | Dependency updates, fraud/refund review, content moderation, performance signals, and event readiness |
| Monthly | Access review, secret/key rotation review, analytics/product review, restore-check sampling, and cost review |
| Quarterly | Full restore test, disaster-recovery exercise, penetration/security review, permission audit, and roadmap review |
| Per event | Dry-run ticket flow, staff/device setup, connectivity check, scan-plan briefing, and post-event reconciliation |

### Post-launch iteration

- Prioritise fixes from user support, payment failures, abandonment data, organiser feedback, and scanning observations.
- Release features behind flags where operational risk is material, especially seat maps, ticket transfer, offline scanning, and new payment methods.
- Revisit retention, privacy, provider pricing, and capacity assumptions as transaction volume grows.

## Actionable Steps

- [ ] Assign launch owner, technical owner, support owner, finance/refund owner, and event-day escalation contacts.
- [ ] Convert the testing programme into automated test suites and a signed manual release checklist.
- [ ] Configure production monitoring, alerts, status page, backups, and rollback procedures.
- [ ] Run a full staging rehearsal with test artwork order, paid ticket order, webhook, email, QR scan, refund, and cross-platform event link.
- [ ] Conduct production domain/payment/email/scanner smoke tests before public announcement.
- [ ] Schedule daily launch monitoring and the recurring maintenance calendar.

## Dependencies

- Requires completion of documents 01–08, production infrastructure, legal/merchant approvals, and verified operational owners.
- Marks the planning sequence complete; implementation should use this document as the release gate and continuing operating playbook.
