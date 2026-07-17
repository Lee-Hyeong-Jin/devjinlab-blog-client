"use client"

import * as React from "react"
import Editor from "@toast-ui/editor"

import "@toast-ui/editor/dist/toastui-editor.css"
import "@/components/blog/toast-ui-overrides.css"
import { createClient } from "@/lib/supabase/client"

export type MarkdownEditorHandle = {
  getMarkdown: () => string
}

// Toast UI's editor is inherently uncontrolled — initialValue seeds it once,
// callers pull the current value imperatively (on form submit) via the ref
// rather than fighting it with per-keystroke controlled state. Touches the
// DOM at construction time, so whatever page mounts this must load it via
// next/dynamic(..., { ssr: false }).
export const MarkdownEditor = React.forwardRef<
  MarkdownEditorHandle,
  { initialValue?: string; draftId: string }
>(function MarkdownEditor({ initialValue = "", draftId }, ref) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const editorRef = React.useRef<Editor | null>(null)

  React.useImperativeHandle(ref, () => ({
    getMarkdown: () => editorRef.current?.getMarkdown() ?? "",
  }))

  React.useEffect(() => {
    if (!containerRef.current) return

    const editor = new Editor({
      el: containerRef.current,
      height: "600px",
      initialEditType: "markdown",
      previewStyle: "vertical",
      initialValue,
      useCommandShortcut: true,
      hooks: {
        addImageBlobHook: async (
          blob: Blob | File,
          callback: (url: string, altText?: string) => void
        ) => {
          try {
            const supabase = createClient()
            const extension =
              blob instanceof File && blob.name.includes(".")
                ? blob.name.split(".").pop()
                : "png"
            const path = `drafts/${draftId}/${crypto.randomUUID()}.${extension}`

            const { error } = await supabase.storage
              .from("post-images")
              .upload(path, blob)

            if (error) {
              console.error("이미지 업로드 실패", error)
              return
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from("post-images").getPublicUrl(path)

            callback(publicUrl, "image")
          } catch (error) {
            console.error("이미지 업로드 실패", error)
          }
        },
      },
    })

    editorRef.current = editor

    return () => {
      editor.destroy()
      editorRef.current = null
    }
    // Mount-only: initialValue seeds the uncontrolled editor once, draftId
    // is stable for the lifetime of one editing session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} />
})
