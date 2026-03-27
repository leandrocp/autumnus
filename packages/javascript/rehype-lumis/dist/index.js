import { bundledLanguages } from '@lumis-sh/lumis/bundles/web';
import { createHighlighter } from '@lumis-sh/lumis';
import { htmlInline } from '@lumis-sh/lumis/formatters';
import { fromHtml } from 'hast-util-from-html';
import { toString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';

// src/index.ts
var LANGUAGE_PREFIX = "language-";
function getPropertyString(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function getClassNames(node) {
  const className = node.properties.className;
  if (!Array.isArray(className)) {
    return [];
  }
  return className.filter((value) => typeof value === "string");
}
function parseCodeBlock(node) {
  const head = node.children[0];
  if (!head || head.type !== "element" || head.tagName !== "code") {
    return void 0;
  }
  const languageFromClassName = getClassNames(head).find((className) => className.startsWith(LANGUAGE_PREFIX))?.slice(LANGUAGE_PREFIX.length);
  const languageFromPreClassName = getClassNames(node).find((className) => className.startsWith(LANGUAGE_PREFIX))?.slice(LANGUAGE_PREFIX.length);
  const language = languageFromClassName ?? languageFromPreClassName ?? getPropertyString(node.properties.dataLanguage) ?? getPropertyString(node.properties["data-language"]) ?? getPropertyString(node.properties.language);
  return {
    code: toString(head),
    language
  };
}
function parseFragment(html) {
  return fromHtml(html, { fragment: true }).children;
}
function resolveLanguage(language, options) {
  if (language) {
    return language;
  }
  if (options.detectLanguage) {
    return void 0;
  }
  return options.defaultLanguage;
}
async function renderBlock(highlighter, code, language, options) {
  if (language != null) {
    await highlighter.loadLanguage(language);
  }
  const html = highlighter.highlight(
    code,
    htmlInline({
      language,
      theme: options.theme,
      preClass: options.preClass,
      includeHighlights: options.includeHighlights,
      italic: options.italic
    })
  );
  return parseFragment(html);
}
var rehypeLumis = function rehypeLumis2(options) {
  const setup = (async () => {
    const highlighter = await createHighlighter({
      langs: [bundledLanguages, ...options.langs ?? []]
    });
    const loadLanguages = options.loadLanguages ?? ["plaintext"];
    await Promise.all(loadLanguages.map((language) => highlighter.loadLanguage(language)));
    return highlighter;
  })();
  return async function transform(tree) {
    const highlighter = await setup;
    const targets = [];
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
        const selectedLanguage = resolveLanguage(parsed.language, options);
        try {
          return await renderBlock(highlighter, parsed.code, selectedLanguage, options);
        } catch (error) {
          if (options.fallbackLanguage && selectedLanguage !== options.fallbackLanguage) {
            return renderBlock(highlighter, parsed.code, options.fallbackLanguage, options);
          }
          options.onError?.(error, { language: parsed.language, code: parsed.code });
          return void 0;
        }
      })
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
var src_default = rehypeLumis;

export { src_default as default };
