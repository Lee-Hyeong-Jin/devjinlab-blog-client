import { PostForm } from "@/components/blog/post-form"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getCategories } from "@/lib/blog/categories"

export default async function WriteNewPostPage() {
  await requireAdmin()
  const categories = await getCategories()

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-kr-serif text-2xl font-bold">새 글 작성</h1>
      <PostForm mode="create" categories={categories} />
    </main>
  )
}
