import wasmAngular from "@lumis-sh/wasm-angular";
import wasmAstro from "@lumis-sh/wasm-astro";
import wasmDart from "@lumis-sh/wasm-dart";
import wasmDiff from "@lumis-sh/wasm-diff";
import wasmEex from "@lumis-sh/wasm-eex";
import wasmElm from "@lumis-sh/wasm-elm";
import wasmEmbeddedTemplate from "@lumis-sh/wasm-embedded-template";
import wasmGlimmer from "@lumis-sh/wasm-glimmer";
import wasmGraphql from "@lumis-sh/wasm-graphql";
import wasmHeex from "@lumis-sh/wasm-heex";
import wasmMarkdown from "@lumis-sh/wasm-markdown";
import wasmMarkdownInline from "@lumis-sh/wasm-markdown_inline";
import wasmPhp from "@lumis-sh/wasm-php";
import wasmPrisma from "@lumis-sh/wasm-prisma";
import wasmScss from "@lumis-sh/wasm-scss";
import wasmSurface from "@lumis-sh/wasm-surface";
import wasmSvelte from "@lumis-sh/wasm-svelte";
import wasmVue from "@lumis-sh/wasm-vue";
import wasmXml from "@lumis-sh/wasm-xml";

export const bundledWasms = {
  angular: wasmAngular,
  astro: wasmAstro,
  dart: wasmDart,
  eex: wasmEex,
  ejs: wasmEmbeddedTemplate,
  elm: wasmElm,
  erb: wasmEmbeddedTemplate,
  glimmer: wasmGlimmer,
  graphql: wasmGraphql,
  heex: wasmHeex,
  markdown: wasmMarkdown,
  markdown_inline: wasmMarkdownInline,
  mdx: wasmMarkdown,
  php: wasmPhp,
  prisma: wasmPrisma,
  scss: wasmScss,
  surface: wasmSurface,
  svelte: wasmSvelte,
  vue: wasmVue,
  xml: wasmXml,
  plaintext: wasmDiff,
};

export default bundledWasms;
