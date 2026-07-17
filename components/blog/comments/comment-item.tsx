"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommentForm } from "@/components/blog/comments/comment-form"
import { softDeleteComment } from "@/app/posts/[slug]/comment-actions"
import { cn } from "@/lib/utils"
import type { CommentNode } from "@/lib/comments/build-tree"

// Depth in the data is unbounded (parent_id chains can nest arbitrarily),
// but indentation stops compounding past this depth so a long reply chain
// never pushes content off a narrow (mobile) viewport. Replies beyond this
// still render — fully nested in the tree, just flush with their capped
// ancestor and labeled with who they're replying to.
const MAX_VISUAL_DEPTH = 4

export function CommentItem({
  comment,
  postId,
  postSlug,
  currentUserId,
  isAdmin,
  depth = 0,
}: {
  comment: CommentNode
  postId: string
  postSlug: string
  currentUserId: string | null
  isAdmin: boolean
  depth?: number
}) {
  const [replying, setReplying] = React.useState(false)

  const canDelete =
    !comment.isDeleted && (comment.authorId === currentUserId || isAdmin)
  const canReply = Boolean(currentUserId) && !comment.isDeleted
  const shouldIndent = depth > 0 && depth <= MAX_VISUAL_DEPTH
  const isOverflowDepth = depth > MAX_VISUAL_DEPTH

  return (
    <div className={shouldIndent ? "mt-3 border-l border-border pl-4" : "mt-3"}>
      <div className="flex items-start gap-2">
        <Avatar className="size-7 shrink-0">
          <AvatarImage
            src={comment.authorAvatarUrl ?? undefined}
            alt={comment.authorName}
          />
          <AvatarFallback className="text-[10px]">
            {comment.authorName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.authorName}</span>
            <time className="font-mono text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </time>
          </div>

          {isOverflowDepth && (
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              ↳ {comment.authorName}에게 답글
            </p>
          )}

          <p
            className={cn(
              "mt-1 text-sm whitespace-pre-wrap",
              comment.isDeleted
                ? "text-muted-foreground italic"
                : "text-foreground"
            )}
          >
            {comment.isDeleted ? "삭제된 댓글입니다." : comment.body}
          </p>

          <div className="mt-1 flex items-center gap-3">
            {canReply && (
              <button
                type="button"
                onClick={() => setReplying((value) => !value)}
                className="font-mono text-[11px] text-muted-foreground hover:text-signal"
              >
                답글
              </button>
            )}
            {canDelete && (
              <form action={softDeleteComment.bind(null, comment.id, postSlug)}>
                <button
                  type="submit"
                  className="font-mono text-[11px] text-muted-foreground hover:text-destructive"
                >
                  삭제
                </button>
              </form>
            )}
          </div>

          {replying && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                postSlug={postSlug}
                parentId={comment.id}
                submitLabel="답글 작성"
                autoFocus
                onSuccess={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.children.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          postId={postId}
          postSlug={postSlug}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
