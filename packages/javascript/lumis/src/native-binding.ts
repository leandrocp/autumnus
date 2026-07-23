import { createRequire } from "node:module";

export interface NativeFormatter {
  rainbowBrackets?: boolean;
  kind: string;
  options: Record<string, unknown>;
}

interface NativeRuntimeInstance {
  loadLanguage(id: string): void;
  highlightEvents(source: string, language: string, rainbowBrackets?: boolean): Uint8Array;
  format(source: string, language: string, formatter: NativeFormatter): string;
  formatAsync(source: string, language: string, formatter: NativeFormatter): Promise<string>;
}

export interface NativeBinding {
  NativeRuntime: new () => NativeRuntimeInstance;
  runtimeKind(): string;
}

let cachedBinding: NativeBinding | null | undefined;

function linuxLibc(): "gnu" | "musl" {
  const report = process.report?.getReport?.() as
    | { header?: { glibcVersionRuntime?: string } }
    | undefined;
  return report?.header?.glibcVersionRuntime ? "gnu" : "musl";
}

function nativeTarget(): string | undefined {
  if (process.platform === "darwin" && ["arm64", "x64"].includes(process.arch)) {
    return `darwin-${process.arch}`;
  }
  if (process.platform === "linux" && ["arm64", "x64"].includes(process.arch)) {
    return linuxLibc() === "gnu" ? `linux-${process.arch}-gnu` : undefined;
  }
  if (process.platform === "win32" && process.arch === "x64") {
    return "win32-x64-msvc";
  }
  return undefined;
}

/** Load the platform addon without making native support a public API choice. */
export function loadNativeBinding(): NativeBinding | undefined {
  if (cachedBinding !== undefined) {
    return cachedBinding ?? undefined;
  }
  if (process.env.LUMIS_TEST_RUNTIME === "wasm") {
    cachedBinding = null;
    return undefined;
  }

  const target = nativeTarget();
  if (!target) {
    cachedBinding = null;
    return undefined;
  }

  const require = createRequire(import.meta.url);
  const candidates = [
    `../native/lumis-native.${target}.node`,
    "@lumis-sh/lumis-native",
    `@lumis-sh/lumis-native-${target}`,
  ];
  for (const candidate of candidates) {
    try {
      const binding = require(candidate) as NativeBinding;
      if (binding.runtimeKind?.() === "native") {
        cachedBinding = binding;
        return binding;
      }
    } catch {
      // Missing or unloadable platform packages transparently use the WASM runtime.
    }
  }

  cachedBinding = null;
  if (process.env.LUMIS_TEST_RUNTIME === "native") {
    throw new Error(`Lumis native runtime is required but unavailable for ${target}`);
  }
  return undefined;
}

export type { NativeRuntimeInstance };
