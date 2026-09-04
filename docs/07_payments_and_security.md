# TikoYetu — Payments and Security

## Title & Overview

This document specifies secure payment processing for M-Pesa and card payments, verified webhooks, refunds, access control, and ticket validation. Payment status comes only from trusted server-to-server provider confirmation.

## Key Specifications

### Payment methods

- Prioritise M-Pesa through an approved integration/provider suitable for the launch merchant, with card payments via a PCI-compliant gateway such as Stripe, Flutterwave, Paystack, Pesapal, or another approved provider after commercial and country support validation.
- Use hosted payment pages or provider SDK/tokenisation so TikoYetu never stores raw card numbers, CVV, or M-Pesa PINs.
- Show total price, fees, taxes, currency, terms, and refund conditions before payment initiation.
- Use payment intents/references mapped uniquely to internal orders; preserve provider status and raw webhook payloads in protected, redacted storage.

### M-Pesa flow

1. Server creates a pending order and inventory hold, then requests an STK push or payment initiation with the provider.
2. Buyer approves payment on their phone; the UI displays a pending state and provides a safe retry/help path.
3. Provider sends a signed/authenticated callback to a dedicated HTTPS webhook endpoint.
4. Server verifies source/signature where supported, validates amount/currency/reference, records idempotently, and issues tickets only after success.
5. Reconciliation jobs resolve pending transactions using provider query APIs without duplicating ticket issuance.

### Webhook and order safety

- Verify each provider signature using secrets stored only in the server environment. Reject unsigned, malformed, stale, or replayed requests.
- Use an idempotency key/provider-event unique constraint and transactional order updates.
- Never let client redirects, success URLs, screenshots, or browser state mark an order paid.
- Queue email/QR generation after the committed payment transition and retry safely; payment success must remain durable if notifications fail.
- Record payment state transitions, provider references, actor/system source, and reconciliation outcome in audit logs.

### Refunds and disputes

- Refund initiation requires appropriate support/finance permission, recorded reason, amount validation, and provider refund reference.
- Void/revoke associated tickets once the refund policy requires it; communicate the outcome to the buyer.
- Define clear operational ownership for partial refunds, cancellation, chargebacks, duplicate payments, and M-Pesa pending-payment escalation.

### Access control and application security

- Use least-privilege RBAC with organisation/event scope. Validators cannot alter inventory, prices, payments, or personal-data exports.
- Enforce authenticated, server-side authorisation for all dashboard, scan, refund, export, and support operations.
- Protect sessions using secure HttpOnly cookies, CSRF defenses for state-changing browser requests, password hashing through a vetted library, MFA for administrative roles, and rate limiting.
- Validate all input, use parameterised database access, encode rendered output, restrict CORS, apply CSP, and protect uploads from unsafe content.
- Store secrets in managed secret stores, rotate them, redact logs, patch dependencies, and scan code/dependencies in CI.

### Ticket scanning security

- QR tokens must be high-entropy, signed or server-verifiable, revocable, and non-sequential.
- Scanner requires event-scoped authentication and logs every validation attempt.
- First valid check-in is atomic. Later scans return a clear duplicate result without leaking buyer data.
- Limit scanning API abuse by device/session/event and retain evidence suitable for support review.

### Compliance and privacy

- Confirm applicable Kenyan data-protection, consumer-protection, tax/receipt, and payment-provider obligations with qualified local counsel before launch.
- Publish privacy, terms, refund/cancellation, cookie, and acceptable-use notices; obtain consent where required.
- Maintain data-processing agreements with hosting, analytics, email, and payment vendors as needed.

## Actionable Steps

- [ ] Select and contract approved M-Pesa and card-payment providers after compliance and commercial review.
- [ ] Implement payment intent/reference, signed webhook, idempotency, and reconciliation services.
- [ ] Build tested success, failure, pending, expiry, refund, cancellation, and duplicate-payment paths.
- [ ] Add RBAC, MFA for privileged roles, rate limits, secure headers, secret rotation, and audit logging.
- [ ] Conduct penetration testing and payment-flow security review before production processing.
- [ ] Create incident, refund, dispute, and data-breach response runbooks.

## Dependencies

- Requires the infrastructure and schema foundations in documents 02–03 and ticket lifecycle in `06_tikoyetu_ticketing_engine.md`.
- Must be completed before public checkout launch and integration release in `08_cross_platform_integration.md`.
