import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isAdminEmail } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"

export async function UserMenu() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="px-4 font-mono text-xs sm:text-[13px]"
      >
        <Link href="/login">로그인</Link>
      </Button>
    )
  }

  const isAdmin = isAdminEmail(user.email)
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "user"
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="flex shrink-0 items-center gap-2">
      {isAdmin && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden px-4 font-mono text-xs sm:inline-flex sm:text-[13px]"
        >
          <Link href="/write">새 글 작성</Link>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="사용자 메뉴"
            className="shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar className="size-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate font-mono text-xs font-normal text-muted-foreground">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem asChild className="sm:hidden">
              <Link href="/write">새 글 작성</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <form action="/auth/signout" method="post" className="w-full">
              <button type="submit" className="w-full text-left">
                로그아웃
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
