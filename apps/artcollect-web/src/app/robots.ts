import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Checkout surfaces and API routes have nothing for a crawler.
      disallow: ["/api/", "/orders/", "/donations/", "/lookup", "/studio", "/sign-in", "/sign-up"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
