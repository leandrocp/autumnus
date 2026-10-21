import * as root from "@lumis-sh/lumis";
import * as languages from "@lumis-sh/lumis/languages";
import * as themes from "@lumis-sh/lumis/themes";
import { htmlInline } from "@lumis-sh/lumis/formatters";
import packageUrl from "@lumis-sh/wasm-json/lumis.json?url";
import wasmUrl from "@lumis-sh/wasm-json/tree-sitter-json.wasm?url";

declare global {
  interface Window {
    lookupInputs: string[];
  }
}

languages.configurePackageResolver(() => new URL(packageUrl, location.href).href);
languages.configureWasmResolver(() => new URL(wasmUrl, location.href).href);
await languages.load(["json"]);
languages.configureWasmResolver(() => {
  throw new Error("parser must already be loaded");
});
const legacy: {
  loadLanguages: typeof languages.load;
  availableThemes: typeof themes.available;
  loadedLanguages: typeof languages.loaded;
} = root;
const rendered = await root.highlight(
  '{"answer":42}',
  htmlInline({ language: "json", theme: themes.get("dracula") }),
);
const output = document.querySelector("#output");
if (!output) throw new Error("missing output element");
output.textContent = JSON.stringify({
  runtime: root.runtimeKind(),
  aliases: legacy.loadLanguages === languages.load && legacy.availableThemes === themes.available,
  guess: languages.guess("app.js"),
  language: languages.get("js")?.id,
  lookup: window.lookupInputs.map((input) => {
    const language = languages.get(input);
    return {
      id: language?.id ?? null,
      parser: language?.parser ?? null,
      packageName: language?.packageName ?? null,
    };
  }),
  loaded: legacy.loadedLanguages().includes("json"),
  theme: themes.get("dracula")?.name,
  highlighted: rendered.includes("<span") && rendered.includes("42"),
});
