import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import type { PostSummary } from "@/lib/blog/posts"

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-signal/40">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.category && (
          <Badge
            asChild
            variant="outline"
            className="mb-2 font-mono text-[11px] text-signal"
          >
            <span>{post.category.name}</span>
          </Badge>
        )}
        <h2 className="font-kr-serif text-lg font-bold text-balance">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {post.tags.map((tag) => (
          <Badge
            key={tag.slug}
            asChild
            variant="secondary"
            className="font-mono text-[11px]"
          >
            <Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>
          </Badge>
        ))}
      </div>

      {post.publishedAt && (
        <time
          dateTime={post.publishedAt}
          className="mt-3 block font-mono text-xs text-muted-foreground"
        >
          {format(new Date(post.publishedAt), "yyyy.MM.dd", { locale: ko })}
        </time>
      )}
    </article>
  )
}
