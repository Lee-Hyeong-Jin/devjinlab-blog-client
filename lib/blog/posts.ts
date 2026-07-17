import { createClient } from "@/lib/supabase/server"

export type PostSummary = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  category: { name: string; slug: string } | null
  tags: { name: string; slug: string }[]
}

export type PostDetail = PostSummary & {
  contentMd: string
}

type PostRow = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  content_md?: string
  category: { name: string; slug: string } | null
  post_tags: { tags: { name: string; slug: string } | null }[]
}

const POST_SUMMARY_FIELDS = `
  id,
  slug,
  title,
  excerpt,
  cover_image_url,
  published_at,
  post_tags(tags(name, slug))
`

export const POSTS_PAGE_SIZE = 10

function toPostSummary(row: PostRow): PostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
    category: row.category,
    tags: row.post_tags
      .map((postTag) => postTag.tags)
      .filter((tag): tag is { name: string; slug: string } => tag !== null),
  }
}

export async function getPublishedPosts({
  page = 1,
  categorySlug,
  tagSlug,
}: {
  page?: number
  categorySlug?: string
  tagSlug?: string
} = {}): Promise<{
  posts: PostSummary[]
  totalCount: number
  pageSize: number
}> {
  const supabase = await createClient()
  const from = (page - 1) * POSTS_PAGE_SIZE
  const to = from + POSTS_PAGE_SIZE - 1

  // Many-to-many tag filtering can't be expressed as a single embedded-resource
  // filter without truncating the returned tags list to just the matched tag,
  // so resolve matching post ids separately first.
  let tagPostIds: string[] | null = null
  if (tagSlug) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tagSlug)
      .maybeSingle()

    if (!tag) {
      return { posts: [], totalCount: 0, pageSize: POSTS_PAGE_SIZE }
    }

    const { data: postTags, error: postTagsError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tag.id)

    if (postTagsError) throw postTagsError

    tagPostIds = (postTags ?? []).map((row) => row.post_id)

    if (tagPostIds.length === 0) {
      return { posts: [], totalCount: 0, pageSize: POSTS_PAGE_SIZE }
    }
  }

  // category is a plain to-one FK, so !inner + .eq is safe here (no risk of
  // truncating anything, unlike the tags case above).
  const categoryField = categorySlug
    ? "category:categories!inner(name, slug)"
    : "category:categories(name, slug)"

  let query = supabase
    .from("posts")
    .select(`${POST_SUMMARY_FIELDS}, ${categoryField}`, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to)

  if (categorySlug) {
    query = query.eq("category.slug", categorySlug)
  }

  if (tagPostIds) {
    query = query.in("id", tagPostIds)
  }

  const { data, count, error } = await query

  if (error) throw error

  return {
    posts: ((data ?? []) as unknown as PostRow[]).map(toPostSummary),
    totalCount: count ?? 0,
    pageSize: POSTS_PAGE_SIZE,
  }
}

export type AdminPostRecord = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  contentMd: string
  coverImageUrl: string | null
  categoryId: string | null
  tagNames: string[]
  status: "draft" | "published"
}

// Unlike getPublishedPostBySlug, this intentionally doesn't filter by
// status — it's for the admin write flow (/write/[id]), where RLS itself
// is what allows the admin to see drafts (posts_select_published_or_admin).
export async function getPostById(id: string): Promise<AdminPostRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
        id,
        slug,
        title,
        excerpt,
        content_md,
        cover_image_url,
        category_id,
        status,
        post_tags(tags(name))
      `
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as {
    id: string
    slug: string
    title: string
    excerpt: string | null
    content_md: string
    cover_image_url: string | null
    category_id: string | null
    status: "draft" | "published"
    post_tags: { tags: { name: string } | null }[]
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentMd: row.content_md,
    coverImageUrl: row.cover_image_url,
    categoryId: row.category_id,
    tagNames: row.post_tags
      .map((postTag) => postTag.tags?.name)
      .filter((name): name is string => Boolean(name)),
    status: row.status,
  }
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<PostDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      `${POST_SUMMARY_FIELDS}, content_md, category:categories(name, slug)`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as PostRow
  return { ...toPostSummary(row), contentMd: row.content_md ?? "" }
}
