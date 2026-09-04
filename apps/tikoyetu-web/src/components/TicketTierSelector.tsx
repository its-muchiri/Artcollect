"use client";

import { useMemo, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import type { EventTierView } from "@/lib/events";
import { initiateCheckoutAction } from "@/lib/actions/checkout-actions";
import { formatMoney } from "@/lib/utils";

export interface TicketTierSelectorProps {
  eventId: string;
  tiers: EventTierView[];
  currency: string;
}

/**
 * Ticket tier picker with a live-computed total, wired to the real
 * checkout server action.
 *
 * Quantity is clamped client-side to each tier's `minPerOrder`/`maxPerOrder`
 * and the availability already computed server-side in `tiers` — but that
 * clamping is a UX convenience only. `initiateCheckoutAction` re-validates
 * everything against live capacity inside a database transaction before
 * creating an order or hold; nothing here is trusted as inventory truth.
 *
 * Calm-surface guarantee (docs/11): this component accepts ONLY the data
 * props above — no decorative props exist to pass, and the eslint
 * no-restricted-imports rule keeps pixel/graffiti/3D modules out of here
 * entirely.
 */
export function TicketTierSelector({ eventId, tiers, currency }: TicketTierSelectorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setQuantity(tier: EventTierView, next: number) {
    const clamped = Math.max(0, Math.min(next, tier.maxPerOrder, tier.remaining));
    setQuantities((prev) => ({ ...prev, [tier.id]: clamped }));
  }

  const totalMinor = useMemo(
    () => tiers.reduce((sum, tier) => sum + (quantities[tier.id] ?? 0) * tier.priceMinor, 0),
    [tiers, quantities],
  );
  const totalQuantity = useMemo(
    () => Object.values(quantities).reduce((sum, q) => sum + q, 0),
    [quantities],
  );

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await initiateCheckoutAction({
        eventId,
        buyerEmail: email,
        buyerName: name || undefined,
        selections: tiers.map((tier) => ({ tierId: tier.id, quantity: quantities[tier.id] ?? 0 })),
      });
      // A successful call redirects and never resolves back here; reaching
      // this line means it returned an error instead.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-zinc-900">Select tickets</h2>

      <div className="mt-4 divide-y divide-zinc-100">
        {tiers.map((tier) => {
          const soldOut = tier.availability === "sold_out";
          const qty = quantities[tier.id] ?? 0;

          return (
            <div key={tier.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-zinc-900">{tier.name}</p>
                <p className="text-sm text-zinc-500">
                  {formatMoney(tier.priceMinor, currency)}
                  {tier.availability === "low" && (
                    <span className="ml-2 text-amber-600">Only {tier.remaining} left</span>
                  )}
                  {soldOut && <span className="ml-2 text-zinc-400">Sold out</span>}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Decrease ${tier.name} quantity`}
                  disabled={qty <= 0}
                  onClick={() => setQuantity(tier, qty - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm font-medium text-zinc-900">{qty}</span>
                <button
                  type="button"
                  aria-label={`Increase ${tier.name} quantity`}
                  disabled={soldOut || qty >= tier.maxPerOrder || qty >= tier.remaining}
                  onClick={() => setQuantity(tier, qty + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
        <span className="text-sm text-zinc-500">Total</span>
        <span className="font-display text-lg font-bold text-zinc-900">
          {formatMoney(totalMinor, currency)}
        </span>
      </div>

      {totalQuantity > 0 && (
        <div className="mt-4 space-y-3 border-t border-zinc-100 pt-4">
          <div>
            <label htmlFor="buyer-email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="buyer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="buyer-name" className="text-sm font-medium text-zinc-700">
              Name (optional)
            </label>
            <input
              id="buyer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={totalQuantity === 0 || !email || isPending}
        onClick={handleCheckout}
        className="mt-4 w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
      >
        {isPending
          ? "Redirecting to payment…"
          : totalQuantity === 0
            ? "Select a ticket"
            : `Continue — ${totalQuantity} ticket${totalQuantity > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
