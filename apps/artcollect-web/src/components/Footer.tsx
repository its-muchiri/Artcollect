import Link from "next/link";

const COLUMNS = [
  {
    title: "TikoYetu",
    links: [
      { label: "Art & artists", href: "/" },
      { label: "Browse events", href: "/events" },
      { label: "Find my ticket", href: "/lookup" },
      { label: "For organisers", href: "/events#organisers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Refund policy", href: "#" },
      { label: "Contact support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of use", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Ticket terms", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-display text-lg font-bold text-zinc-900">TikoYetu</span>
          <p className="mt-2 text-sm text-zinc-500">
            Fast, secure ticketing for Kenyan events.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-zinc-900">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} TikoYetu. Part of the ArtCollect ecosystem.
      </div>
    </footer>
  );
}
