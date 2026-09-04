import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TicketLookupForm } from "@/components/TicketLookupForm";

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
