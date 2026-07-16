import { createClient } from "@/lib/supabase/server"

export type Tag = {
  id: string
  name: string
  slug: string
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name")

  if (error) throw error

  return data ?? []
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error

  return data
}
