"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type CommentActionState = { error?: string }

const commentInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "댓글 내용을 입력하세요")
    .max(2000, "댓글은 2000자 이내로 입력하세요"),
})

export async function createComment(
  postId: string,
  postSlug: string,
  parentId: string | null,
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const parsed = commentInputSchema.safeParse({
    body: formData.get("body"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "로그인이 필요합니다" }
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    parent_id: parentId,
    author_id: user.id,
    body: parsed.data.body,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/posts/${postSlug}`)

  return {}
}

// Soft-deletes only: RLS (comments_update_own_or_admin) is what actually
// restricts this to the comment's own author or the admin — an
// unauthorized attempt just matches 0 rows rather than erroring, and
// revalidatePath re-fetching the real, unchanged row is what makes that
// visible in the UI, so no extra ownership check is needed here.
export async function softDeleteComment(commentId: string, postSlug: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)

  if (error) throw error

  revalidatePath(`/posts/${postSlug}`)
}
