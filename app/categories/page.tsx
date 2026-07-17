import { TaxonomyChipList } from "@/components/blog/taxonomy-chip-list"
import { getCategories } from "@/lib/blog/categories"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-6 font-kr-serif text-2xl font-bold">카테고리</h1>
      <TaxonomyChipList items={categories} basePath="/categories" />
    </main>
  )
}
