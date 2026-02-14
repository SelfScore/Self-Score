import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/user/",
        "/admin/",
        "/consultant/",
        "/auth/",
        "/api/",
        "/selfscoretest/",
        "/shared-report/",
      ],
    },
    sitemap: "https://www.selfscore.net/sitemap.xml",
  };
}
