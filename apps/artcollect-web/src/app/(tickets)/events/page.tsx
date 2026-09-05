import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventBrowser } from "@/components/EventBrowser";
import { listEvents } from "@/lib/ticketing-events";

export const metadata: Metadata = {
  title: "Events & tickets — TikoYetu",
  description:
    "Find live events across Kenya and buy tickets in a few taps — M-Pesa or card, instant QR delivery, real availability.",
};

// Ticket availability must never be served from a stale build-time
// snapshot (docs/08: "must not claim a ticket is available without a
// valid response") — render this route per-request instead of statically
// prerendering it at build time.
export const dynamic = "force-dynamic";

const TRUST_ITEMS = [
  { icon: Smartphone, label: "M-Pesa checkout" },
  { icon: CreditCard, label: "Visa & Mastercard" },
  { icon: QrCode, label: "Instant QR tickets" },
  { icon: ShieldCheck, label: "Secure, verified payments" },
] as const;

const STEPS = [
  {
    title: "Find your event",
    body: "Search by city, venue, or organiser — see real ticket availability, not a guess.",
  },
  {
    title: "Pay with M-Pesa or card",
    body: "Checkout is a few taps, with a payment status you can always see clearly.",
  },
  {
    title: "Get your QR ticket instantly",
    body: "Delivered by email and in your ticket wallet the moment payment is confirmed.",
  },
] as const;

export default async function Home() {
  const events = await listEvents();

  return (
    <>
      <Header />

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            Kenya&apos;s ticketing platform for culture &amp; events
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
            Tickets you can trust, delivered instantly
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
            Fast checkout, clear pricing, and a QR ticket the moment payment
            confirms — no ambiguity, no surprises at the door.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-emerald-600" />
                {label}
              </span>
            ))}
          </div>
        </section>

        <EventBrowser events={events} />

        <section id="how-it-works" className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="text-center font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              How it works
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="organisers" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-zinc-900 px-8 py-12 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Selling tickets for an event?
              </h2>
              <p className="mt-2 max-w-md text-zinc-400 dark:text-zinc-500">
                Set up ticket tiers, track sales live, and check attendees in
                with the validator app — all from one dashboard.
              </p>
            </div>
            <Link
              href="#"
              className="whitespace-nowrap rounded-full bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors hover:bg-zinc-200"
            >
              List your event
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
