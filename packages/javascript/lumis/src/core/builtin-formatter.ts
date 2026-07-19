import type { Formatter } from "../types.js";

export const BUILTIN_FORMATTER = Symbol("lumis.builtin-formatter");

export type BuiltinFormatterKind =
  | "html-inline"
  | "html-linked"
  | "html-multi-themes"
  | "bbcode-scoped"
  | "terminal";

export function markBuiltinFormatter<T extends Formatter>(
  formatter: T,
  kind: BuiltinFormatterKind,
): T {
  Object.defineProperty(formatter, BUILTIN_FORMATTER, { value: kind });
  return formatter;
}

export function builtinFormatterKind(formatter: Formatter): BuiltinFormatterKind | undefined {
  return (formatter as Formatter & { [BUILTIN_FORMATTER]?: BuiltinFormatterKind })[
    BUILTIN_FORMATTER
  ];
}
