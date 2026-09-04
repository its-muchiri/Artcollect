"use client";

import { useMemo, useState, useTransition } from "react";
import type { initiateDonationAction } from "@/lib/actions/donation-actions";
import { formatMoney } from "@/lib/utils";

export interface DonationFormProps {
  causeId: string;
  causeTitle: string;
  currency: string;
  /** The server action, passed in from the server component. */
  action: typeof initiateDonationAction;
}

/** Preset gift amounts in minor units (KES presets for Kenyan causes). */
const PRESETS_MINOR = [10_000, 25_000, 50_000, 100_000] as const; // KES 100/250/500/1000
const CUSTOM_MIN = 1000; // KES 10

/**
 * The donate form (docs/11 Phase 5 rules apply — this is a checkout-
 * adjacent surface: calm, Inter-set, vector icons only; the eslint
 * no-restricted-imports rule in eslint.config.mjs keeps loud styles out).
 * Server-side validation re-checks everything; nothing here is trusted.
 */
export function DonationForm({ causeId, causeTitle, currency, action }: DonationFormProps) {
  const [amountMinor, setAmountMinor] = useState<number>(PRESETS_MINOR[0]);
  const [customValue, setCustomValue] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectiveAmountMinor = useMemo(() => {
    if (customValue.trim() === "") return amountMinor;
    const parsed = Number(customValue);
    if (!Number.isFinite(parsed)) return amountMinor;
    return Math.round(parsed * 100);
  }, [amountMinor, customValue]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await action({
        causeId,
        amountMinor: effectiveAmountMinor,
        donorEmail: email,
        donorName: name || undefined,
        message: message || undefined,
        anonymous,
      });
      // A successful call redirects to Flutterwave and never resolves; a
      // resolved value means a validation error came back.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-zinc-900">
        Support “{causeTitle}”
      </h2>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-zinc-700">Choose an amount</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS_MINOR.map((preset) => {
            const selected = customValue.trim() === "" && amountMinor === preset;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCustomValue("");
                  setAmountMinor(preset);
                }}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {formatMoney(preset, currency)}
              </button>
            );
          })}
        </div>
        <label htmlFor="custom-amount" className="mt-3 block text-sm font-medium text-zinc-700">
          Other amount ({currency})
        </label>
        <input
          id="custom-amount"
          type="number"
          inputMode="decimal"
          min={CUSTOM_MIN / 100}
          step="1"
          placeholder="e.g. 250"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
        />
      </fieldset>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="donor-email" className="text-sm font-medium text-zinc-700">
            Email <span className="text-zinc-400">(for your receipt)</span>
          </label>
          <input
            id="donor-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="donor-name" className="text-sm font-medium text-zinc-700">
            Name <span className="text-zinc-400">(optional — shown with your gift)</span>
          </label>
          <input
            id="donor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="donor-message" className="text-sm font-medium text-zinc-700">
            Words of support <span className="text-zinc-400">(optional, public)</span>
          </label>
          <textarea
            id="donor-message"
            rows={2}
            maxLength={280}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600"
          />
          Give anonymously (hide my name publicly)
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={effectiveAmountMinor < CUSTOM_MIN || !email || isPending}
        className="mt-4 w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
      >
        {isPending
          ? "Redirecting to payment…"
          : `Donate ${formatMoney(effectiveAmountMinor, currency)} securely`}
      </button>
      <p className="mt-2 text-center text-xs text-zinc-400">
        Payment is verified server-side before your gift is marked received.
      </p>
    </form>
  );
}
