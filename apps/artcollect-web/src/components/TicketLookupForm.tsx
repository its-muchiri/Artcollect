"use client";

import { type FormEvent, useState } from "react";
import { Search } from "lucide-react";

/**
 * Guest order/ticket lookup — the "secure order lookup and ticket-access
 * method" docs/02 requires alongside guest checkout, so buyers who skip
 * account creation can still recover their tickets.
 *
 * Not wired to a real order store yet (no checkout/payment flow exists to
 * produce a real order reference against). Submitting shows an honest
 * "not available yet" state rather than a fabricated result.
 */
export function TicketLookupForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8">
      <h1 className="font-display text-2xl font-bold text-zinc-900">Find my ticket</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Enter your order reference and the email you booked with.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="order-ref" className="text-sm font-medium text-zinc-700">
            Order reference
          </label>
          <input
            id="order-ref"
            required
            placeholder="e.g. TY-4F82A1"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 active:scale-[0.98]"
        >
          <Search size={16} />
          Find ticket
        </button>
      </form>

      {submitted && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Order lookup isn&apos;t connected yet — this ships alongside the
          checkout and payments phase.
        </p>
      )}
    </div>
  );
}
