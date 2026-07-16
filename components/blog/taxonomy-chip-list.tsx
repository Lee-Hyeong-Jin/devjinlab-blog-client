import Link from "next/link"

import { Badge } from "@/components/ui/badge"

export function TaxonomyChipList({
  items,
  basePath,
  prefix = "",
}: {
  items: { name: string; slug: string }[]
  basePath: string
  prefix?: string
}) {
  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        아직 없습니다.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item.slug}
          asChild
          variant="outline"
          className="px-3 py-1 font-mono text-xs"
        >
          <Link href={`${basePath}/${item.slug}`}>
            {prefix}
            {item.name}
          </Link>
        </Badge>
      ))}
    </div>
  )
}
