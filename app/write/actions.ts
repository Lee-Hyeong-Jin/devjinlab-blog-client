"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

export type PostActionState = { error?: string }

const postInputSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요")
    .regex(
      /^[a-z0-9-]+$/,
      "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다"
    ),
  excerpt: z.string().max(300).optional().or(z.literal("")),
  contentMd: z.string(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  tagNames: z.array(z.string().min(1)),
  status: z.enum(["draft", "published"]),
})

function parsePostFormData(formData: FormData) {
  const tagNamesRaw = formData.get("tagNames")
  const tagNames =
    typeof tagNamesRaw === "string"
      ? tagNamesRaw
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean)
      : []

  return postInputSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    contentMd: formData.get("contentMd"),
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    tagNames,
    status: formData.get("status"),
  })
}

function slugifyTag(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
}

async function syncPostTags(
  supabase: SupabaseClient,
  postId: string,
  tagNames: string[]
) {
  await supabase.from("post_tags").delete().eq("post_id", postId)

  const tagIds: string[] = []

  for (const rawName of tagNames) {
    const name = rawName.trim()
    if (!name) continue

    const slug = slugifyTag(name)
    if (!slug) continue

    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      tagIds.push(existing.id)
      continue
    }

    const { data: created, error } = await supabase
      .from("tags")
      .insert({ name, slug })
      .select("id")
      .single()

    if (error) throw error
    tagIds.push(created.id)
  }

  if (tagIds.length > 0) {
    const { error } = await supabase
      .from("post_tags")
      .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))

    if (error) throw error
  }
}

function friendlyPostError(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "이미 사용 중인 슬러그입니다"
  }
  return error.message
}

export async function createPost(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const parsed = parsePostFormData(formData)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content_md: parsed.data.contentMd,
      cover_image_url: parsed.data.coverImageUrl || null,
      category_id: parsed.data.categoryId || null,
      status: parsed.data.status,
      published_at:
        parsed.data.status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single()

  if (error) {
    return { error: friendlyPostError(error) }
  }

  await syncPostTags(supabase, data.id, parsed.data.tagNames)

  revalidatePath("/")
  revalidatePath(`/posts/${data.slug}`)

  redirect(
    parsed.data.status === "published"
      ? `/posts/${data.slug}`
      : `/write/${data.id}`
  )
}

export async function updatePost(
  postId: string,
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  const parsed = parsePostFormData(formData)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요" }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("posts")
    .select("published_at")
    .eq("id", postId)
    .maybeSingle()

  if (!existing) {
    return { error: "글을 찾을 수 없습니다" }
  }

  const publishedAt =
    parsed.data.status === "published"
      ? (existing.published_at ?? new Date().toISOString())
      : null

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content_md: parsed.data.contentMd,
      cover_image_url: parsed.data.coverImageUrl || null,
      category_id: parsed.data.categoryId || null,
      status: parsed.data.status,
      published_at: publishedAt,
    })
    .eq("id", postId)
    .select("id, slug")
    .single()

  if (error) {
    return { error: friendlyPostError(error) }
  }

  await syncPostTags(supabase, postId, parsed.data.tagNames)

  revalidatePath("/")
  revalidatePath(`/posts/${data.slug}`)
  revalidatePath(`/write/${postId}`)

  redirect(
    parsed.data.status === "published"
      ? `/posts/${data.slug}`
      : `/write/${postId}`
  )
}

export async function publishPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("status", "draft")
    .select("slug")
    .maybeSingle()

  if (error) throw error
  if (!data) return

  revalidatePath("/")
  revalidatePath(`/posts/${data.slug}`)

  redirect(`/posts/${data.slug}`)
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", postId)
    .maybeSingle()

  if (!data) return

  const { error } = await supabase.from("posts").delete().eq("id", postId)
  if (error) throw error

  revalidatePath("/")
  revalidatePath(`/posts/${data.slug}`)

  redirect("/")
}
