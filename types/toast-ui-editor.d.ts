// @toast-ui/editor's package.json "exports" map has no "types" condition on
// the "." entry, so under moduleResolution: "bundler" (which strictly
// respects exports) tsc can't find its on-disk .d.ts files via a normal
// `import ... from "@toast-ui/editor"` in application code.
//
// IMPORTANT: this must stay a pure ambient declaration (ONLY used by tsc,
// erased before bundling) — do NOT "fix" this via tsconfig `paths`. Next.js's
// bundler (Turbopack/webpack) also consults `paths` for *runtime* module
// resolution, and pointing "@toast-ui/editor" at a .d.ts file (which has no
// runtime values at all) makes the real import silently resolve to
// `undefined` and get dead-code-eliminated — confirmed in production by a
// real browser throwing "TypeError: (void 0) is not a constructor" on every
// mount of MarkdownEditor. The relative import path below resolves via
// plain filesystem lookup, sidestepping the exports map entirely, without
// touching how the bundler resolves the real import at runtime.
declare module "@toast-ui/editor" {
  export * from "../node_modules/@toast-ui/editor/types/index"
  export { default } from "../node_modules/@toast-ui/editor/types/index"
}
