import { createClient } from "@/lib/supabase/server"

export type CommentRecord = {
  id: string
  parentId: string | null
  authorId: string
  authorName: string
  authorAvatarUrl: string | null
  body: string
  isDeleted: boolean
  createdAt: string
}

// comments.author_id and profiles.id both reference auth.users(id), but
// there's no FK directly between comments and profiles, so PostgREST can't
// embed profiles via a nested select — resolved with a second query instead.
export async function getCommentsByPostId(
  postId: string
): Promise<CommentRecord[]> {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, parent_id, author_id, body, deleted_at, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) throw error
  if (!comments || comments.length === 0) return []

  const authorIds = Array.from(new Set(comments.map((c) => c.author_id)))
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", authorIds)

  if (profilesError) throw profilesError

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  return comments.map((comment) => {
    const profile = profileById.get(comment.author_id)
    const isDeleted = comment.deleted_at !== null

    return {
      id: comment.id,
      parentId: comment.parent_id,
      authorId: comment.author_id,
      authorName: profile?.display_name ?? "알 수 없음",
      authorAvatarUrl: profile?.avatar_url ?? null,
      body: isDeleted ? "" : comment.body,
      isDeleted,
      createdAt: comment.created_at,
    }
  })
}
