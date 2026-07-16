"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

export function MobileNav({
  menu_items,
}: {
  menu_items: readonly { id: number; name: string; href: string }[]
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="sm:hidden">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Menu className="size-4" aria-hidden="true" />
        )}
      </Button>

      {open && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Main"
            className="absolute inset-x-4 top-full z-50 mt-2 rounded-xl border border-border bg-card p-2 shadow-lg"
          >
            <ul className="flex flex-col font-mono text-sm">
              {menu_items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-signal"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  )
}
