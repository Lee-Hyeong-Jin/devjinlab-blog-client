// @toast-ui/editor ships this submodule's ambient declaration only as a
// side-effect of importing the package's main entry (types/index.d.ts does
// `import './toastui-editor-viewer'` internally) — since we only ever import
// the deep path directly, TypeScript never loads that chain on its own.
declare module "@toast-ui/editor/dist/toastui-editor-viewer" {
  import { Viewer } from "@toast-ui/editor"

  export default Viewer
}
