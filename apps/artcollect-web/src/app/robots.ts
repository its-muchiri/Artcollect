import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artcollect-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth, checkout, and order-lookup surfaces have nothing for a
        // crawler to index and shouldn't show up as search results.
        disallow: ["/sign-in", "/sign-up", "/lookup", "/orders/", "/donations/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
