import wasmAstro from "@lumis-sh/wasm-astro"
import wasmBash from "@lumis-sh/wasm-bash"
import wasmComment from "@lumis-sh/wasm-comment"
import wasmCss from "@lumis-sh/wasm-css"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmDockerfile from "@lumis-sh/wasm-dockerfile"
import wasmGraphql from "@lumis-sh/wasm-graphql"
import wasmHeex from "@lumis-sh/wasm-heex"
import wasmHtml from "@lumis-sh/wasm-html"
import wasmJavascript from "@lumis-sh/wasm-javascript"
import wasmJson from "@lumis-sh/wasm-json"
import wasmMarkdown from "@lumis-sh/wasm-markdown"
import wasmMarkdownInline from "@lumis-sh/wasm-markdown_inline"
import wasmRegex from "@lumis-sh/wasm-regex"
import wasmScss from "@lumis-sh/wasm-scss"
import wasmSql from "@lumis-sh/wasm-sql"
import wasmSvelte from "@lumis-sh/wasm-svelte"
import wasmToml from "@lumis-sh/wasm-toml"
import wasmTsx from "@lumis-sh/wasm-tsx"
import wasmTypescript from "@lumis-sh/wasm-typescript"
import wasmVue from "@lumis-sh/wasm-vue"
import wasmXml from "@lumis-sh/wasm-xml"
import wasmYaml from "@lumis-sh/wasm-yaml"

export const bundledWasms = {
  "astro": wasmAstro,
  "bash": wasmBash,
  "comment": wasmComment,
  "css": wasmCss,
  "diff": wasmDiff,
  "dockerfile": wasmDockerfile,
  "graphql": wasmGraphql,
  "heex": wasmHeex,
  "html": wasmHtml,
  "javascript": wasmJavascript,
  "json": wasmJson,
  "markdown": wasmMarkdown,
  "markdown_inline": wasmMarkdownInline,
  "regex": wasmRegex,
  "scss": wasmScss,
  "sql": wasmSql,
  "svelte": wasmSvelte,
  "toml": wasmToml,
  "tsx": wasmTsx,
  "typescript": wasmTypescript,
  "vue": wasmVue,
  "xml": wasmXml,
  "yaml": wasmYaml,
  "plaintext": wasmDiff,
}

export const missingLanguages = []

export default bundledWasms
