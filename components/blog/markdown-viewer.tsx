"use client"

import * as React from "react"
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer"

import "@toast-ui/editor/dist/toastui-editor-viewer.css"
import "@/components/blog/toast-ui-overrides.css"

// Toast UI's viewer is inherently uncontrolled (imperative setMarkdown()
// rather than a controlled prop), and touches the DOM at construction time
// — the page mounting this must load it via next/dynamic(..., { ssr: false }).
export function MarkdownViewer({ content }: { content: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const viewerRef = React.useRef<Viewer | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return

    viewerRef.current = new Viewer({
      el: containerRef.current,
      initialValue: content,
    })

    return () => {
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
    // Mount-only: content changes are pushed via setMarkdown() in the effect
    // below instead of recreating the Viewer instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    viewerRef.current?.setMarkdown(content)
  }, [content])

  return <div ref={containerRef} />
}
