"use client"

import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

// Not a <form action="/auth/signout"> POST: Radix's DropdownMenuItem closes
// (unmounting the portal, including the form) as soon as it's activated,
// which races the browser's native form submission and cancels it with
// "Form submission canceled because the form is not connected" — the
// signout never actually happens. Calling signOut() directly sidesteps
// form submission entirely, so there's nothing for the closing menu to race.
export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button type="button" onClick={handleSignOut} className="w-full text-left">
      로그아웃
    </button>
  )
}
