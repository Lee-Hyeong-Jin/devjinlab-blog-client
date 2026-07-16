import { notFound } from "next/navigation"

import { PostList } from "@/components/blog/post-list"
import { getCategoryBySlug } from "@/lib/blog/categories"
import { getPublishedPosts } from "@/lib/blog/posts"

export default async function CategoryPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { posts, totalCount, pageSize } = await getPublishedPosts({
    page,
    categorySlug: slug,
  })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-signal uppercase">
        카테고리
      </p>
      <h1 className="mb-8 font-kr-serif text-2xl font-bold">{category.name}</h1>
      <PostList
        posts={posts}
        currentPage={page}
        totalCount={totalCount}
        pageSize={pageSize}
        basePath={`/categories/${slug}`}
      />
    </main>
  )
}
