// Mirrors the public.is_admin() SQL function (supabase/migrations) — this is
// only for UI gating (showing/hiding the write flow). RLS is what actually
// enforces it, so a mismatch here can never grant real access.
export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail || !email) {
    return false
  }

  return email.toLowerCase() === adminEmail.toLowerCase()
}
