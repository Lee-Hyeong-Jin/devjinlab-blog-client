// Explicit override for auth redirect URLs. Falls back to the browser's own
// origin so local dev keeps working with no configuration — but in
// production, relying on window.location.origin alone isn't enough if
// Supabase's Auth "Redirect URLs" allow-list (Dashboard, or
// supabase/config.toml for the local stack) doesn't also include the
// deployed domain; GoTrue silently falls back to its configured Site URL
// when the requested redirect isn't in that allow-list.
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
}
