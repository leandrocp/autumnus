declare module "@lumis-sh/lumis/formatters" {
  export type LanguageRef = unknown;

  export interface Formatter {
    language?: LanguageRef;
    format(source: string, hl: unknown): string;
  }
}

declare module "@lumis-sh/lumis" {
  import type { Formatter, LanguageRef } from "@lumis-sh/lumis/formatters";

  export interface Highlighter {
    highlight(source: string, formatter: Formatter): string;
    loadLanguage(language: LanguageRef): Promise<void>;
  }

  export function createHighlighter(init?: unknown): Promise<Highlighter>;
}
