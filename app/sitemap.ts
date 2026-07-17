import type { MetadataRoute } from "next"

import { getCategories } from "@/lib/blog/categories"
import { getAllPublishedPostSlugs } from "@/lib/blog/posts"
import { getTags } from "@/lib/blog/tags"

const SITE_URL = "https://blog.devjinlab.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, tags, posts] = await Promise.all([
    getCategories(),
    getTags(),
    getAllPublishedPostSlugs(),
  ])

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/tags`, changeFrequency: "weekly", priority: 0.5 },
    ...categories.map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...tags.map((tag) => ({
      url: `${SITE_URL}/tags/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
