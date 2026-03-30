import type { Root, Element, RootContent } from "hast";
import type { Highlighter, LanguageInput } from "@lumis-sh/lumis";
import type { Formatter } from "@lumis-sh/lumis/formatters";
import type { Plugin } from "unified";
import { createHighlighter } from "@lumis-sh/lumis";
import { fromHtml } from "hast-util-from-html";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

const LANGUAGE_PREFIX = "language-";

export interface RehypeLumisOptions {
  formatter: (language: string | undefined) => Formatter;
  languages?: LanguageInput[];
}

interface ParsedCodeBlock {
  code: string;
  language?: string;
}

function getPropertyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getClassNames(node: Element): string[] {
  const className = node.properties.className;
  if (!Array.isArray(className)) {
    return [];
  }

  return className.filter((value): value is string => typeof value === "string");
}

function getLanguageFromClassNames(node: Element): string | undefined {
  return getClassNames(node)
    .find((className) => className.startsWith(LANGUAGE_PREFIX))
    ?.slice(LANGUAGE_PREFIX.length);
}

function getLanguageFromProperties(node: Element): string | undefined {
  return (
    getPropertyString(node.properties.dataLanguage) ??
    getPropertyString(node.properties["data-language"]) ??
    getPropertyString(node.properties.language)
  );
}

function parseCodeBlock(node: Element): ParsedCodeBlock | undefined {
  const head = node.children[0];
  if (!head || head.type !== "element" || head.tagName !== "code") {
    return undefined;
  }

  const language =
    getLanguageFromClassNames(head) ??
    getLanguageFromClassNames(node) ??
    getLanguageFromProperties(node);

  return {
    code: toString(head),
    language,
  };
}

function parseFragment(html: string): RootContent[] {
  return fromHtml(html, { fragment: true }).children;
}

async function renderBlock(
  highlighter: Highlighter,
  code: string,
  language: string | undefined,
  formatter: (language: string | undefined) => Formatter,
): Promise<RootContent[]> {
  if (language != null) {
    await highlighter.loadLanguage(language);
  }

  const html = highlighter.highlight(code, formatter(language));

  return parseFragment(html);
}

const rehypeLumis: Plugin<[RehypeLumisOptions], Root> = function rehypeLumis(options) {
  const setup = createHighlighter({
    languages: options.languages ?? [],
  });

  return async function transform(tree) {
    const highlighter = await setup;
    const targets: Array<{
      parent: Element | Root;
      index: number;
      parsed: ParsedCodeBlock;
    }> = [];

    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null || node.tagName !== "pre") {
        return;
      }

      const parsed = parseCodeBlock(node);
      if (!parsed) {
        return;
      }

      targets.push({ parent, index, parsed });
      return "skip";
    });

    const replacements = await Promise.all(
      targets.map(async ({ parsed }) => {
        try {
          return await renderBlock(highlighter, parsed.code, parsed.language, options.formatter);
        } catch {
          return undefined;
        }
      }),
    );

    for (let i = targets.length - 1; i >= 0; i -= 1) {
      const target = targets[i];
      const replacement = replacements[i];
      if (!target || !replacement) {
        continue;
      }

      target.parent.children.splice(target.index, 1, ...replacement);
    }
  };
};

export default rehypeLumis;
