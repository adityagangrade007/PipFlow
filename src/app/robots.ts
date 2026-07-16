import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/portfolio",
        "/bots",
        "/trades",
        "/analytics",
        "/notifications",
        "/settings",
        "/profile",
        "/admin",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
