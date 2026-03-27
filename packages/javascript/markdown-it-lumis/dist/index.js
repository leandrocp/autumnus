import { bundledLanguages } from '@lumis-sh/lumis/bundles/web';
import { createHighlighter } from '@lumis-sh/lumis';
import { htmlInline } from '@lumis-sh/lumis/formatters';

// src/index.ts
function resolveLanguage(language, options) {
  if (language.length > 0) {
    return language;
  }
  if (options.detectLanguage) {
    return void 0;
  }
  return options.defaultLanguage;
}
function formatterOptions(language, options) {
  return htmlInline({
    language,
    theme: options.theme,
    preClass: options.preClass,
    includeHighlights: options.includeHighlights,
    italic: options.italic
  });
}
function renderCodeBlock(highlighter, code, language, options) {
  return highlighter.highlight(code, formatterOptions(language, options));
}
function fromHighlighter(highlighter, options) {
  return function installMarkdownItLumis(md) {
    const defaultFence = md.renderer.rules.fence;
    md.renderer.rules.fence = function fence(tokens, idx, opts, env, self) {
      const token = tokens[idx];
      if (!token) {
        return defaultFence ? defaultFence(tokens, idx, opts, env, self) : self.renderToken(tokens, idx, opts);
      }
      const info = token.info.trim();
      const language = info.split(/\s+/, 1)[0] ?? "";
      const code = token.content;
      const selectedLanguage = resolveLanguage(language, options);
      try {
        return renderCodeBlock(highlighter, code, selectedLanguage, options);
      } catch (error) {
        if (options.fallbackLanguage && selectedLanguage !== options.fallbackLanguage) {
          return renderCodeBlock(highlighter, code, options.fallbackLanguage, options);
        }
        options.onError?.(error, { language, code });
        if (defaultFence) {
          return defaultFence(tokens, idx, opts, env, self);
        }
        return self.renderToken(tokens, idx, opts);
      }
    };
  };
}
async function markdownItLumis(options) {
  const highlighter = await createHighlighter({
    langs: [bundledLanguages, ...options.langs ?? []]
  });
  const loadLanguages = options.loadLanguages ?? Object.keys(bundledLanguages);
  await Promise.all(loadLanguages.map((language) => highlighter.loadLanguage(language)));
  return fromHighlighter(highlighter, options);
}

export { markdownItLumis as default, fromHighlighter };
