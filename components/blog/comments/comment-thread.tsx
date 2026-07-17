"use client"

import * as React from "react"
import Link from "next/link"

import { CommentForm } from "@/components/blog/comments/comment-form"
import { CommentItem } from "@/components/blog/comments/comment-item"
import { buildCommentTree } from "@/lib/comments/build-tree"
import type { CommentRecord } from "@/lib/blog/comments"

export function CommentThread({
  postId,
  postSlug,
  comments,
  currentUserId,
  isAdmin,
}: {
  postId: string
  postSlug: string
  comments: CommentRecord[]
  currentUserId: string | null
  isAdmin: boolean
}) {
  const tree = React.useMemo(() => buildCommentTree(comments), [comments])
  const activeCount = comments.filter((comment) => !comment.isDeleted).length

  return (
    <section className="mt-12">
      <h2 className="font-kr-serif text-lg font-bold">댓글 {activeCount}</h2>

      <div className="mt-4">
        {currentUserId ? (
          <CommentForm
            postId={postId}
            postSlug={postSlug}
            parentId={null}
            submitLabel="댓글 작성"
          />
        ) : (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            댓글을 작성하려면{" "}
            <Link href="/login" className="text-signal underline">
              로그인
            </Link>
            이 필요합니다.
          </p>
        )}
      </div>

      <div className="mt-6">
        {tree.length === 0 ? (
          <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
        ) : (
          tree.map((node) => (
            <CommentItem
              key={node.id}
              comment={node}
              postId={postId}
              postSlug={postSlug}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              depth={0}
            />
          ))
        )}
      </div>
    </section>
  )
}
