import type MarkdownIt from "markdown-it";
import type {
  Highlighter,
  Language,
  LanguageInput,
  LanguageRef,
  LazyLanguage,
} from "@lumis-sh/lumis";
import type { Formatter } from "@lumis-sh/lumis/formatters";
import { createHighlighter } from "@lumis-sh/lumis";

export interface MarkdownItLumisOptions {
  formatter: (language: string | undefined) => Formatter;
  languages?: Array<LanguageInput | LanguageRef>;
}

type FenceRenderer = NonNullable<MarkdownIt["renderer"]["rules"]["fence"]>;

function renderDefaultFence(
  defaultFence: FenceRenderer | undefined,
  ...args: Parameters<FenceRenderer>
): string {
  if (defaultFence) {
    return defaultFence(...args);
  }

  const [tokens, idx, opts, _env, self] = args;
  return self.renderToken(tokens, idx, opts);
}

function getLanguageName(info: string): string | undefined {
  const language = info.trim().split(/\s+/, 1)[0];
  return language && language.length > 0 ? language : undefined;
}

function splitLanguages(entries: Array<LanguageInput | LanguageRef>): {
  inputs: LanguageInput[];
  refs: LanguageRef[];
} {
  const inputs: LanguageInput[] = [];
  const refs: LanguageRef[] = [];

  for (const entry of entries) {
    if (typeof entry === "string") {
      refs.push(entry);
      continue;
    }

    inputs.push(entry as LanguageInput);
    if (isLanguageRef(entry)) {
      refs.push(entry);
    }
  }

  return { inputs, refs };
}

function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "highlights" in value &&
    "wasm" in value
  );
}

function isLazyLanguage(value: unknown): value is LazyLanguage {
  return typeof value === "function" && "id" in value && "aliases" in value;
}

function isLanguageRef(value: unknown): value is LanguageRef {
  return isLanguage(value) || isLazyLanguage(value);
}

export function fromHighlighter(highlighter: Highlighter, options: MarkdownItLumisOptions) {
  return function installMarkdownItLumis(md: MarkdownIt): void {
    const defaultFence = md.renderer.rules.fence;

    md.renderer.rules.fence = function fence(tokens, idx, opts, env, self) {
      const token = tokens[idx];
      if (!token) {
        return renderDefaultFence(defaultFence, tokens, idx, opts, env, self);
      }

      const language = getLanguageName(token.info);

      try {
        return highlighter.highlight(token.content, options.formatter(language));
      } catch {
        return renderDefaultFence(defaultFence, tokens, idx, opts, env, self);
      }
    };
  };
}

export default async function markdownItLumis(options: MarkdownItLumisOptions) {
  const { inputs: languageInputs, refs: languageRefs } = splitLanguages(options.languages ?? []);

  const highlighter = await createHighlighter({
    languages: languageInputs,
  });

  await Promise.all(languageRefs.map((language) => highlighter.loadLanguage(language)));

  return fromHighlighter(highlighter, options);
}
