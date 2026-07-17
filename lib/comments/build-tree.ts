import type { CommentRecord } from "@/lib/blog/comments"

export type CommentNode = CommentRecord & { children: CommentNode[] }

// Single O(n) pass: fine at a personal blog's comment volume, and much
// simpler to reason about than a recursive CTE — see the comments RLS
// policy comments in the schema migration for the same reasoning.
export function buildCommentTree(comments: CommentRecord[]): CommentNode[] {
  const nodeById = new Map<string, CommentNode>()
  const roots: CommentNode[] = []

  for (const comment of comments) {
    nodeById.set(comment.id, { ...comment, children: [] })
  }

  for (const comment of comments) {
    const node = nodeById.get(comment.id)!
    const parent = comment.parentId ? nodeById.get(comment.parentId) : undefined

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
