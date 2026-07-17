import { redirect } from "next/navigation"

import { isAdminEmail } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"

// UX-only gate for the /write routes — logged-out visitors go to /login,
// logged-in non-admins go home. The database (RLS) is what actually
// enforces this; a bug here can never grant real write access.
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  if (!isAdminEmail(user.email)) {
    redirect("/")
  }

  return user
}
