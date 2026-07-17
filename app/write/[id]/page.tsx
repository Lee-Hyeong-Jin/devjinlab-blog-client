import { notFound } from "next/navigation"

import { PostForm } from "@/components/blog/post-form"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getCategories } from "@/lib/blog/categories"
import { getPostById } from "@/lib/blog/posts"

export default async function WriteEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const [categories, post] = await Promise.all([
    getCategories(),
    getPostById(id),
  ])

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-kr-serif text-2xl font-bold">글 수정</h1>
      <PostForm
        mode="edit"
        postId={post.id}
        categories={categories}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          contentMd: post.contentMd,
          coverImageUrl: post.coverImageUrl ?? "",
          categoryId: post.categoryId ?? "",
          tagNames: post.tagNames,
        }}
      />
    </main>
  )
}
