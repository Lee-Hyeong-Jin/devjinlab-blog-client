"use client"

import * as React from "react"
import { useActionState } from "react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createPost,
  updatePost,
  type PostActionState,
} from "@/app/write/actions"
import type { MarkdownEditorHandle } from "@/components/blog/markdown-editor"
import type { Category } from "@/lib/blog/categories"

const MarkdownEditor = dynamic(
  () =>
    import("@/components/blog/markdown-editor").then(
      (mod) => mod.MarkdownEditor
    ),
  { ssr: false }
)

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export type PostFormValues = {
  title: string
  slug: string
  excerpt: string
  contentMd: string
  coverImageUrl: string
  categoryId: string
  tagNames: string[]
}

export function PostForm({
  mode,
  postId,
  categories,
  initialValues,
}: {
  mode: "create" | "edit"
  postId?: string
  categories: Category[]
  initialValues?: PostFormValues
}) {
  const boundAction =
    mode === "edit" && postId ? updatePost.bind(null, postId) : createPost
  const [state, formAction, isPending] = useActionState<
    PostActionState,
    FormData
  >(boundAction, {})

  const editorRef = React.useRef<MarkdownEditorHandle>(null)
  const contentInputRef = React.useRef<HTMLInputElement>(null)
  const generatedDraftId = React.useId()

  const [title, setTitle] = React.useState(initialValues?.title ?? "")
  const [slug, setSlug] = React.useState(initialValues?.slug ?? "")
  const [slugTouched, setSlugTouched] = React.useState(
    Boolean(initialValues?.slug)
  )

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  function handleSubmit() {
    if (contentInputRef.current) {
      contentInputRef.current.value = editorRef.current?.getMarkdown() ?? ""
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {state?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          required
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">슬러그</Label>
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value)
            setSlugTouched(true)
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">요약</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={initialValues?.excerpt}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coverImageUrl">커버 이미지 URL</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          defaultValue={initialValues?.coverImageUrl}
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">카테고리</Label>
        <Select
          name="categoryId"
          required
          defaultValue={initialValues?.categoryId || undefined}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tagNames">태그 (쉼표로 구분)</Label>
        <Input
          id="tagNames"
          name="tagNames"
          defaultValue={initialValues?.tagNames.join(", ")}
          placeholder="nextjs, supabase"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>본문</Label>
        <MarkdownEditor
          ref={editorRef}
          draftId={postId ?? generatedDraftId}
          initialValue={initialValues?.contentMd}
        />
        <input ref={contentInputRef} type="hidden" name="contentMd" />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          name="status"
          value="draft"
          variant="outline"
          disabled={isPending}
        >
          임시저장
        </Button>
        <Button
          type="submit"
          name="status"
          value="published"
          disabled={isPending}
        >
          발행
        </Button>
      </div>
    </form>
  )
}
