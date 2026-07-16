import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"
import { UserMenu } from "@/components/layout/user-menu"

const menu_items = [
  { id: 0, name: "카테고리", href: "/categories" },
  { id: 1, name: "태그", href: "/tags" },
  { id: 2, name: "devjinlab.com", href: "https://devjinlab.com" },
] as const

export async function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-serif text-lg tracking-tight text-signal italic"
        >
          devjinlab
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 sm:block">
          <ul className="flex items-center gap-8 font-mono text-xs whitespace-nowrap text-muted-foreground">
            {menu_items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className="transition-colors hover:text-signal"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <MobileNav menu_items={menu_items} />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
