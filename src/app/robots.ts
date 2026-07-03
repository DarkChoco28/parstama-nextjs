import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/cek-status"],
      },
    ],
    sitemap: "https://parstama.my.id/sitemap.xml",
  }
}
