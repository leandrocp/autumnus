import wasmCss from "@lumis-sh/wasm-css"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmHtml from "@lumis-sh/wasm-html"
import wasmJavascript from "@lumis-sh/wasm-javascript"
import wasmJson from "@lumis-sh/wasm-json"
import wasmTsx from "@lumis-sh/wasm-tsx"
import wasmTypescript from "@lumis-sh/wasm-typescript"

export const bundledWasms = {
  "css": wasmCss,
  "html": wasmHtml,
  "javascript": wasmJavascript,
  "json": wasmJson,
  "tsx": wasmTsx,
  "typescript": wasmTypescript,
  "plaintext": wasmDiff,
}

export default bundledWasms
