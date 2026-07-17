import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommentThread } from "@/components/blog/comments/comment-thread"
import { MarkdownViewer } from "@/components/blog/markdown-viewer-loader"
import { isAdminEmail } from "@/lib/auth/is-admin"
import { getCommentsByPostId } from "@/lib/blog/comments"
import { getPublishedPostBySlug } from "@/lib/blog/posts"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return { title: "글을 찾을 수 없습니다" }
  }

  const description = post.excerpt ?? undefined
  const images = post.coverImageUrl ? [post.coverImageUrl] : undefined

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images,
    },
  }
}

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
  const comments = await getCommentsByPostId(post.id)

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

      <CommentThread
        postId={post.id}
        postSlug={post.slug}
        comments={comments}
        currentUserId={user?.id ?? null}
        isAdmin={isAdmin}
      />
    </main>
  )
}
