import { TaxonomyChipList } from "@/components/blog/taxonomy-chip-list"
import { getTags } from "@/lib/blog/tags"

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-kr-serif text-2xl font-bold">태그</h1>
      <TaxonomyChipList items={tags} basePath="/tags" prefix="#" />
    </main>
  )
}
