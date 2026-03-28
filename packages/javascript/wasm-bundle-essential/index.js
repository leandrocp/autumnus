import wasmBash from "@lumis-sh/wasm-bash"
import wasmComment from "@lumis-sh/wasm-comment"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmIni from "@lumis-sh/wasm-ini"
import wasmJson from "@lumis-sh/wasm-json"
import wasmMarkdown from "@lumis-sh/wasm-markdown"
import wasmMarkdownInline from "@lumis-sh/wasm-markdown_inline"
import wasmRegex from "@lumis-sh/wasm-regex"
import wasmToml from "@lumis-sh/wasm-toml"
import wasmXml from "@lumis-sh/wasm-xml"
import wasmYaml from "@lumis-sh/wasm-yaml"

export const bundledWasms = {
  "bash": wasmBash,
  "comment": wasmComment,
  "diff": wasmDiff,
  "ini": wasmIni,
  "xml": wasmXml,
  "json": wasmJson,
  "markdown": wasmMarkdown,
  "markdown_inline": wasmMarkdownInline,
  "regex": wasmRegex,
  "toml": wasmToml,
  "yaml": wasmYaml,
  "plaintext": wasmDiff,
}

export const missingLanguages = []

export default bundledWasms
