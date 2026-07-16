"use client"

import dynamic from "next/dynamic"

// next/dynamic's ssr:false is only usable from a Client Component boundary
// (Server Components can't opt out of SSR) — this file exists purely to give
// MarkdownViewer that boundary so posts/[slug]/page.tsx can stay a plain
// Server Component.
export const MarkdownViewer = dynamic(
  () =>
    import("@/components/blog/markdown-viewer").then(
      (mod) => mod.MarkdownViewer
    ),
  { ssr: false }
)
