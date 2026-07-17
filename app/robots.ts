import type { MetadataRoute } from "next"

const SITE_URL = "https://blog.devjinlab.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/write", "/write/", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
