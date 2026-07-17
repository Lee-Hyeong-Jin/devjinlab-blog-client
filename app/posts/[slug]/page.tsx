import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownViewer } from "@/components/blog/markdown-viewer-loader"
import { isAdminEmail } from "@/lib/auth/is-admin"
import { getPublishedPostBySlug } from "@/lib/blog/posts"
import { createClient } from "@/lib/supabase/server"

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAdmin = isAdminEmail(user?.email)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <article>
        <header className="mb-8">
          {post.category && (
            <Badge
              asChild
              variant="outline"
              className="mb-3 font-mono text-[11px] text-signal"
            >
              <Link href={`/categories/${post.category.slug}`}>
                {post.category.name}
              </Link>
            </Badge>
          )}

          <h1 className="font-kr-serif text-3xl font-bold text-balance sm:text-4xl">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
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
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            {post.publishedAt && (
              <time
                dateTime={post.publishedAt}
                className="font-mono text-xs text-muted-foreground"
              >
                {format(new Date(post.publishedAt), "yyyy.MM.dd", {
                  locale: ko,
                })}
              </time>
            )}

            {isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="font-mono text-xs"
              >
                <Link href={`/write/${post.id}`}>수정</Link>
              </Button>
            )}
          </div>
        </header>

        <MarkdownViewer content={post.contentMd} />
      </article>
    </main>
  )
}
