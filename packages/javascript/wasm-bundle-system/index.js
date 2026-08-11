import wasmAsm from "@lumis-sh/wasm-asm";
import wasmBash from "@lumis-sh/wasm-bash";
import wasmC from "@lumis-sh/wasm-c";
import wasmCmake from "@lumis-sh/wasm-cmake";
import wasmCpp from "@lumis-sh/wasm-cpp";
import wasmDiff from "@lumis-sh/wasm-diff";
import wasmGo from "@lumis-sh/wasm-go";
import wasmLlvm from "@lumis-sh/wasm-llvm";
import wasmMake from "@lumis-sh/wasm-make";
import wasmRust from "@lumis-sh/wasm-rust";
import wasmWat from "@lumis-sh/wasm-wat";
import wasmZig from "@lumis-sh/wasm-zig";
import wasmZsh from "@lumis-sh/wasm-zsh";

export const bundledWasms = {
  asm: wasmAsm,
  bash: wasmBash,
  c: wasmC,
  cmake: wasmCmake,
  cpp: wasmCpp,
  go: wasmGo,
  llvm: wasmLlvm,
  make: wasmMake,
  rust: wasmRust,
  wat: wasmWat,
  zig: wasmZig,
  zsh: wasmZsh,
  plaintext: wasmDiff,
};

export default bundledWasms;
