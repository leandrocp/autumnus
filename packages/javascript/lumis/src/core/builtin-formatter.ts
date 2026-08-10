import type {
  BBCodeScopedFormatter,
  Formatter,
  HtmlInlineFormatter,
  HtmlLinkedFormatter,
  HtmlMultiThemesFormatter,
  TerminalFormatter,
} from "../types.js";

export const BUILTIN_FORMATTER = Symbol("lumis.builtin-formatter");

export type BuiltinFormatterKind =
  | "html-inline"
  | "html-linked"
  | "html-multi-themes"
  | "bbcode-scoped"
  | "terminal";

type BuiltinFormatter =
  | (HtmlInlineFormatter & { [BUILTIN_FORMATTER]: "html-inline" })
  | (HtmlLinkedFormatter & { [BUILTIN_FORMATTER]: "html-linked" })
  | (HtmlMultiThemesFormatter & { [BUILTIN_FORMATTER]: "html-multi-themes" })
  | (BBCodeScopedFormatter & { [BUILTIN_FORMATTER]: "bbcode-scoped" })
  | (TerminalFormatter & { [BUILTIN_FORMATTER]: "terminal" });

export function markBuiltinFormatter<T extends Formatter>(
  formatter: T,
  kind: BuiltinFormatterKind,
): T {
  Object.defineProperty(formatter, BUILTIN_FORMATTER, { value: kind });
  return formatter;
}

export function getBuiltinFormatter(formatter: Formatter): BuiltinFormatter | undefined {
  const candidate = formatter as Formatter & {
    [BUILTIN_FORMATTER]?: BuiltinFormatterKind;
  };
  return candidate[BUILTIN_FORMATTER] === undefined ? undefined : (candidate as BuiltinFormatter);
}

export function builtinFormatterKind(formatter: Formatter): BuiltinFormatterKind | undefined {
  return getBuiltinFormatter(formatter)?.[BUILTIN_FORMATTER];
}
