import { createClient } from "@/lib/supabase/server"

export type Category = {
  id: string
  name: string
  slug: string
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name")

  if (error) throw error

  return data ?? []
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle()

  if (error) throw error

  return data
}
