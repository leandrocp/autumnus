import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import ts from "typescript";

const directory = mkdtempSync(fileURLToPath(new URL("../dist/typecheck-", import.meta.url)));
const entries = {
  root: "",
  node: "/node",
  languages: "/languages",
  nodeLanguages: "/node/languages",
  themes: "/themes",
  formatters: "/formatters",
  html: "/formatters/html",
  ansi: "/formatters/ansi",
  rust: "/langs/rust",
  web: "/bundles/web",
};
const assertions = `
const metadata: languages.LanguageInfo | undefined = languages.get("main.rs");
const theme: themes.Theme | undefined = themes.get("dracula");
const formatter: root.Formatter = formatters.htmlInline({ language: "rust", theme });
const render: typeof root.highlight = node.highlight;
const load: typeof languages.load = nodeLanguages.load;
const wasm: typeof languages.withWasm = root.withWasm;
const bundled: root.LanguageBundle = web.bundledLanguages;
const language: root.LanguagePackageHandle = rust.default;
void [metadata, formatter, render, load, wasm, bundled, language, html, ansi];
// @ts-expect-error An unresolved lookup is not a LanguageInfo.
const required: languages.LanguageInfo = languages.get("unknown");
`;
const formatHost = {
  getCanonicalFileName: (name) => name,
  getCurrentDirectory: () => directory,
  getNewLine: () => "\n",
};

try {
  for (const format of ["mts", "cts"]) {
    const imports = Object.entries(entries).map(([name, entry]) =>
      format === "mts"
        ? `import * as ${name} from "@lumis-sh/lumis${entry}";`
        : `import ${name} = require("@lumis-sh/lumis${entry}");`,
    );
    const file = join(directory, `consumer.${format}`);
    writeFileSync(file, `${imports.join("\n")}\n${assertions}`);
    for (const module of [ts.ModuleKind.Node16, ts.ModuleKind.NodeNext]) {
      const program = ts.createProgram([file], {
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        target: ts.ScriptTarget.ES2022,
        module,
        moduleResolution:
          module === ts.ModuleKind.Node16
            ? ts.ModuleResolutionKind.Node16
            : ts.ModuleResolutionKind.NodeNext,
        types: [],
      });
      const diagnostics = ts.getPreEmitDiagnostics(program);
      if (diagnostics.length > 0) {
        console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
        process.exitCode = 1;
      }
    }
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
