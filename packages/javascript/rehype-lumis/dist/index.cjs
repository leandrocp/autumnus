'use strict';

var lumis = require('@lumis-sh/lumis');
var hastUtilFromHtml = require('hast-util-from-html');
var hastUtilToString = require('hast-util-to-string');
var unistUtilVisit = require('unist-util-visit');

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
function getLanguageFromClassNames(node) {
  return getClassNames(node).find((className) => className.startsWith(LANGUAGE_PREFIX))?.slice(LANGUAGE_PREFIX.length);
}
function getLanguageFromProperties(node) {
  return getPropertyString(node.properties.dataLanguage) ?? getPropertyString(node.properties["data-language"]) ?? getPropertyString(node.properties.language);
}
function parseCodeBlock(node) {
  const head = node.children[0];
  if (!head || head.type !== "element" || head.tagName !== "code") {
    return void 0;
  }
  const language = getLanguageFromClassNames(head) ?? getLanguageFromClassNames(node) ?? getLanguageFromProperties(node);
  return {
    code: hastUtilToString.toString(head),
    language
  };
}
function parseFragment(html) {
  return hastUtilFromHtml.fromHtml(html, { fragment: true }).children;
}
function renderBlock(highlighter, code, language, formatter) {
  const loaded = language != null && highlighter.languages.includes(language);
  const html = highlighter.highlight(code, formatter(loaded ? language : void 0));
  return parseFragment(html);
}
var rehypeLumis = function rehypeLumis2(options) {
  const setup = lumis.createHighlighter({
    languages: options.languages ?? []
  });
  return async function transform(tree) {
    const highlighter = await setup;
    const targets = [];
    unistUtilVisit.visit(tree, "element", (node, index, parent) => {
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
    const replacements = targets.map(({ parsed }) => {
      try {
        return renderBlock(highlighter, parsed.code, parsed.language, options.formatter);
      } catch {
        return void 0;
      }
    });
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

module.exports = src_default;
