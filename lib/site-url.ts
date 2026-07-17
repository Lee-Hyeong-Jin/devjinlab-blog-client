// Explicit override for auth redirect URLs. Falls back to the browser's own
// origin so local dev keeps working with no configuration — but in
// production, relying on window.location.origin alone isn't enough if
// Supabase's Auth "Redirect URLs" allow-list (Dashboard, or
// supabase/config.toml for the local stack) doesn't also include the
// deployed domain; GoTrue silently falls back to its configured Site URL
// when the requested redirect isn't in that allow-list.
//
// Validated rather than used verbatim: a NEXT_PUBLIC_SITE_URL typed with an
// IME active (e.g. Korean input mode turned on while setting the Vercel env
// var) silently produces a string that *looks* set but isn't a real URL —
// this shipped once as "ㅗㅅ센://ㅠㅣㅐㅎ...채ㅡ/auth/callback" and made every
// Google OAuth login 500 inside GoTrue when it tried to redirect back to
// that garbage value. Falling back to window.location.origin (which is
// already correct in production) is strictly better than passing through
// something that can't be a valid redirect target.
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (configured) {
    try {
      new URL(configured)
      return configured
    } catch {
      console.error(
        `NEXT_PUBLIC_SITE_URL is set but is not a valid URL ("${configured}") — falling back to window.location.origin. Check this value in your deployment's environment variables (a common cause is typing it with a non-English input method active).`
      )
    }
  }

  return window.location.origin
}
