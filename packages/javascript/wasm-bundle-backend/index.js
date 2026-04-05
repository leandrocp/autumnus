import wasmCsharp from "@lumis-sh/wasm-csharp"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmElixir from "@lumis-sh/wasm-elixir"
import wasmErlang from "@lumis-sh/wasm-erlang"
import wasmGo from "@lumis-sh/wasm-go"
import wasmJava from "@lumis-sh/wasm-java"
import wasmJavadoc from "@lumis-sh/wasm-javadoc"
import wasmJavascript from "@lumis-sh/wasm-javascript"
import wasmKotlin from "@lumis-sh/wasm-kotlin"
import wasmPhp from "@lumis-sh/wasm-php"
import wasmProtobuf from "@lumis-sh/wasm-protobuf"
import wasmPython from "@lumis-sh/wasm-python"
import wasmRuby from "@lumis-sh/wasm-ruby"
import wasmRust from "@lumis-sh/wasm-rust"
import wasmScala from "@lumis-sh/wasm-scala"
import wasmSql from "@lumis-sh/wasm-sql"
import wasmTypescript from "@lumis-sh/wasm-typescript"

export const bundledWasms = {
  "csharp": wasmCsharp,
  "elixir": wasmElixir,
  "erlang": wasmErlang,
  "go": wasmGo,
  "java": wasmJava,
  "javadoc": wasmJavadoc,
  "javascript": wasmJavascript,
  "kotlin": wasmKotlin,
  "php": wasmPhp,
  "protobuf": wasmProtobuf,
  "python": wasmPython,
  "ruby": wasmRuby,
  "rust": wasmRust,
  "scala": wasmScala,
  "sql": wasmSql,
  "typescript": wasmTypescript,
  "plaintext": wasmDiff,
}

export default bundledWasms
