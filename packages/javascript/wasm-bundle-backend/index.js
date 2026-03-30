import wasmBash from "@lumis-sh/wasm-bash"
import wasmComment from "@lumis-sh/wasm-comment"
import wasmCsharp from "@lumis-sh/wasm-csharp"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmDockerfile from "@lumis-sh/wasm-dockerfile"
import wasmElixir from "@lumis-sh/wasm-elixir"
import wasmErlang from "@lumis-sh/wasm-erlang"
import wasmGo from "@lumis-sh/wasm-go"
import wasmGraphql from "@lumis-sh/wasm-graphql"
import wasmHttp from "@lumis-sh/wasm-http"
import wasmJava from "@lumis-sh/wasm-java"
import wasmJavascript from "@lumis-sh/wasm-javascript"
import wasmJson from "@lumis-sh/wasm-json"
import wasmKotlin from "@lumis-sh/wasm-kotlin"
import wasmNginx from "@lumis-sh/wasm-nginx"
import wasmPhp from "@lumis-sh/wasm-php"
import wasmProtobuf from "@lumis-sh/wasm-protobuf"
import wasmPython from "@lumis-sh/wasm-python"
import wasmRegex from "@lumis-sh/wasm-regex"
import wasmRuby from "@lumis-sh/wasm-ruby"
import wasmRust from "@lumis-sh/wasm-rust"
import wasmScala from "@lumis-sh/wasm-scala"
import wasmSql from "@lumis-sh/wasm-sql"
import wasmToml from "@lumis-sh/wasm-toml"
import wasmTypescript from "@lumis-sh/wasm-typescript"
import wasmXml from "@lumis-sh/wasm-xml"
import wasmYaml from "@lumis-sh/wasm-yaml"

export const bundledWasms = {
  "bash": wasmBash,
  "comment": wasmComment,
  "csharp": wasmCsharp,
  "diff": wasmDiff,
  "dockerfile": wasmDockerfile,
  "elixir": wasmElixir,
  "erlang": wasmErlang,
  "go": wasmGo,
  "graphql": wasmGraphql,
  "http": wasmHttp,
  "java": wasmJava,
  "javascript": wasmJavascript,
  "json": wasmJson,
  "kotlin": wasmKotlin,
  "nginx": wasmNginx,
  "php": wasmPhp,
  "protobuf": wasmProtobuf,
  "python": wasmPython,
  "regex": wasmRegex,
  "ruby": wasmRuby,
  "rust": wasmRust,
  "scala": wasmScala,
  "sql": wasmSql,
  "toml": wasmToml,
  "typescript": wasmTypescript,
  "xml": wasmXml,
  "yaml": wasmYaml,
  "plaintext": wasmDiff,
}

export const missingLanguages = []

export default bundledWasms
