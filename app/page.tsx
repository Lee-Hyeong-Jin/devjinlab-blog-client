import { PostList } from "@/components/blog/post-list"
import { getPublishedPosts } from "@/lib/blog/posts"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { posts, totalCount, pageSize } = await getPublishedPosts({ page })

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PostList
        posts={posts}
        currentPage={page}
        totalCount={totalCount}
        pageSize={pageSize}
        basePath="/"
      />
    </main>
  )
}
