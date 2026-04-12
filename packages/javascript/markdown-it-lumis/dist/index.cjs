'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lumis = require('@lumis-sh/lumis');

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
    inputs.push(entry);
    if (isLanguageRef(entry)) {
      refs.push(entry);
    }
  }
  return { inputs, refs };
}
function isLanguage(value) {
  return typeof value === "object" && value !== null && "id" in value && "highlights" in value && "wasm" in value;
}
function isLazyLanguage(value) {
  return typeof value === "function" && "id" in value && "aliases" in value;
}
function isLanguageRef(value) {
  return isLanguage(value) || isLazyLanguage(value);
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
  const highlighter = await lumis.createHighlighter({
    languages: languageInputs
  });
  await Promise.all(languageRefs.map((language) => highlighter.loadLanguage(language)));
  return fromHighlighter(highlighter, options);
}

exports.default = markdownItLumis;
exports.fromHighlighter = fromHighlighter;
