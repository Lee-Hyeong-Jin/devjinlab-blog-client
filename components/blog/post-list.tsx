import Link from "next/link"

import { PostCard } from "@/components/blog/post-card"
import { cn } from "@/lib/utils"
import type { PostSummary } from "@/lib/blog/posts"

export function PostList({
  posts,
  currentPage,
  totalCount,
  pageSize,
  basePath,
}: {
  posts: PostSummary[]
  currentPage: number
  totalCount: number
  pageSize: number
  basePath: string
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        아직 글이 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="페이지네이션"
          className="flex items-center justify-center gap-2 font-mono text-xs"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Link
                key={pageNum}
                href={pageNum === 1 ? basePath : `${basePath}?page=${pageNum}`}
                aria-current={pageNum === currentPage ? "page" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg border border-border transition-colors hover:border-signal hover:text-signal",
                  pageNum === currentPage &&
                    "border-signal bg-signal/10 text-signal"
                )}
              >
                {pageNum}
              </Link>
            )
          )}
        </nav>
      )}
    </div>
  )
}
