import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TicketLookupForm } from "@/components/TicketLookupForm";

export const metadata: Metadata = {
  title: "Find my ticket — TikoYetu",
  description: "Look up your TikoYetu order and re-access your QR tickets.",
};

/**
 * Guest order/ticket lookup. The form itself is an honest
 * not-connected-yet surface until order lookup ships (see
 * TicketLookupForm); the page exists so buyers have a stable URL.
 */
export default function LookupPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <TicketLookupForm />
      </main>
      <Footer />
    </>
  );
}
