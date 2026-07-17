// Same "exports map has no types condition" problem as toast-ui-editor.d.ts,
// one level down for the "./dist/toastui-editor-viewer" deep import — see
// that file for why this must stay a pure ambient declaration and never be
// "fixed" via tsconfig `paths`.
//
// Unlike types/index.d.ts, node_modules/@toast-ui/editor/types/
// toastui-editor-viewer.d.ts is itself already a full
// `declare module "@toast-ui/editor/dist/toastui-editor-viewer" { ... }`
// block rather than a plain module with top-level exports, so there's
// nothing to `import ... from` here — just reference the file so tsc
// actually loads and registers that ambient block (nothing in our own
// application code pulls it in on its own, since we only ever import the
// deep dist path, never the package's main entry that re-exports it).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@toast-ui/editor/types/toastui-editor-viewer.d.ts" />
