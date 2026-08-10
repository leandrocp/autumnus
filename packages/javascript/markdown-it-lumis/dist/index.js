import { createHighlighter } from '@lumis-sh/lumis';

// src/index.ts
function renderDefaultFence(defaultFence, ...args) {
  if (defaultFence) {
    return defaultFence(...args);
  }
  const [tokens, idx, opts, _env, self] = args;
  return self.renderToken(tokens, idx, opts);
}
function getLanguageName(info) {
  const language = info.trim().split(/\s+/, 1)[0];
  return language && language.length > 0 ? language : void 0;
}
function splitLanguages(entries) {
  const inputs = [];
  const refs = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      refs.push(entry);
      continue;
    }
    if (isLazyLanguage(entry)) {
      inputs.push({ [entry.id]: entry });
      refs.push(entry);
      continue;
    }
    if (isLanguageDefinition(entry)) {
      if (isLanguage(entry)) inputs.push(entry);
      refs.push(entry);
      continue;
    }
    inputs.push(entry);
  }
  return { inputs, refs };
}
function isLanguageDefinition(value) {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" && "aliases" in value && Array.isArray(value.aliases) && value.aliases.every((alias) => typeof alias === "string");
}
function isLanguage(value) {
  return isLanguageDefinition(value) && (value.id === "plaintext" || "packageName" in value && typeof value.packageName === "string");
}
function isLazyLanguage(value) {
  return typeof value === "function" && "id" in value && "aliases" in value;
}
function fromHighlighter(highlighter, options) {
  return function installMarkdownItLumis(md) {
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
async function markdownItLumis(options) {
  const { inputs: languageInputs, refs: languageRefs } = splitLanguages(options.languages ?? []);
  const highlighter = await createHighlighter({
    languages: languageInputs
  });
  await Promise.all(languageRefs.map((language) => highlighter.loadLanguage(language)));
  return fromHighlighter(highlighter, options);
}

export { markdownItLumis as default, fromHighlighter };
