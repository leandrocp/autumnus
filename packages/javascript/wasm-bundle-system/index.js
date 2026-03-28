import wasmAsm from "@lumis-sh/wasm-asm"
import wasmBash from "@lumis-sh/wasm-bash"
import wasmC from "@lumis-sh/wasm-c"
import wasmCmake from "@lumis-sh/wasm-cmake"
import wasmComment from "@lumis-sh/wasm-comment"
import wasmCpp from "@lumis-sh/wasm-cpp"
import wasmDiff from "@lumis-sh/wasm-diff"
import wasmGo from "@lumis-sh/wasm-go"
import wasmJson from "@lumis-sh/wasm-json"
import wasmMake from "@lumis-sh/wasm-make"
import wasmRegex from "@lumis-sh/wasm-regex"
import wasmRust from "@lumis-sh/wasm-rust"
import wasmToml from "@lumis-sh/wasm-toml"
import wasmWat from "@lumis-sh/wasm-wat"
import wasmYaml from "@lumis-sh/wasm-yaml"
import wasmZig from "@lumis-sh/wasm-zig"

export const bundledWasms = {
  "asm": wasmAsm,
  "bash": wasmBash,
  "c": wasmC,
  "cmake": wasmCmake,
  "comment": wasmComment,
  "cpp": wasmCpp,
  "diff": wasmDiff,
  "go": wasmGo,
  "json": wasmJson,
  "make": wasmMake,
  "regex": wasmRegex,
  "rust": wasmRust,
  "toml": wasmToml,
  "wat": wasmWat,
  "yaml": wasmYaml,
  "zig": wasmZig,
  "plaintext": wasmDiff,
}

export const missingLanguages = [
  "llvm"
]

export default bundledWasms
