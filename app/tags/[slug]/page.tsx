import { notFound } from "next/navigation"

import { PostList } from "@/components/blog/post-list"
import { getPublishedPosts } from "@/lib/blog/posts"
import { getTagBySlug } from "@/lib/blog/tags"

export default async function TagPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const tag = await getTagBySlug(slug)

  if (!tag) {
    notFound()
  }

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { posts, totalCount, pageSize } = await getPublishedPosts({
    page,
    tagSlug: slug,
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-signal uppercase">
        태그
      </p>
      <h1 className="mb-8 font-kr-serif text-2xl font-bold">#{tag.name}</h1>
      <PostList
        posts={posts}
        currentPage={page}
        totalCount={totalCount}
        pageSize={pageSize}
        basePath={`/tags/${slug}`}
      />
    </main>
  )
}
