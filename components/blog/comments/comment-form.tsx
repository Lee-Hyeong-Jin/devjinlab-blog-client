"use client"

import * as React from "react"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  createComment,
  type CommentActionState,
} from "@/app/posts/[slug]/comment-actions"

export function CommentForm({
  postId,
  postSlug,
  parentId,
  submitLabel = "댓글 작성",
  autoFocus = false,
  onSuccess,
}: {
  postId: string
  postSlug: string
  parentId: string | null
  submitLabel?: string
  autoFocus?: boolean
  onSuccess?: () => void
}) {
  const action = createComment.bind(null, postId, postSlug, parentId)
  const [state, formAction, isPending] = useActionState<
    CommentActionState,
    FormData
  >(action, {})

  const formRef = React.useRef<HTMLFormElement>(null)
  const wasPendingRef = React.useRef(false)

  React.useEffect(() => {
    if (wasPendingRef.current && !isPending && !state?.error) {
      formRef.current?.reset()
      onSuccess?.()
    }
    wasPendingRef.current = isPending
  }, [isPending, state, onSuccess])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Textarea
        name="body"
        required
        autoFocus={autoFocus}
        placeholder="댓글을 입력하세요"
        className="min-h-20"
      />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "작성 중..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
