import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import type { LazyLanguage } from "@lumis-sh/lumis";
import { getSample } from "./samples";

// Labels for languages that need special casing
const LABEL_OVERRIDES: Record<string, string> = {
  asm: "Assembly",
  bash: "Bash",
  c: "C",
  caddy: "Caddy",
  cmake: "CMake",
  commonlisp: "Common Lisp",
  cpp: "C++",
  csharp: "C#",
  css: "CSS",
  csv: "CSV",
  d: "D",
  eex: "EEx",
  ejs: "EJS",
  erb: "ERB",
  fsharp: "F#",
  gdscript: "GDScript",
  gitattributes: "Git Attributes",
  gitcommit: "Git Commit",
  gitignore: "Git Ignore",
  glimmer: "Glimmer",
  glsl: "GLSL",
  go: "Go",
  graphql: "GraphQL",
  hcl: "HCL",
  heex: "HEEx",
  html: "HTML",
  http: "HTTP",
  iex: "IEx",
  ini: "INI",
  javascript: "JavaScript",
  jq: "jq",
  json: "JSON",
  json5: "JSON5",
  kdl: "KDL",
  latex: "LaTeX",
  llvm: "LLVM",
  luadoc: "LuaDoc",
  markdown_inline: "Markdown Inline",
  matlab: "MATLAB",
  nushell: "Nushell",
  objc: "Objective-C",
  ocaml: "OCaml",
  ocaml_interface: "OCaml Interface",
  php: "PHP",
  plaintext: "Plain Text",
  powershell: "PowerShell",
  protobuf: "Protocol Buffers",
  qmljs: "QML/JS",
  r: "R",
  rst: "reStructuredText",
  scss: "SCSS",
  sql: "SQL",
  systemverilog: "SystemVerilog",
  tmux: "tmux",
  tsx: "TSX",
  typescript: "TypeScript",
  typst: "Typst",
  vhdl: "VHDL",
  vim: "Vim",
  vue: "Vue",
  wat: "WAT",
  wgsl: "WGSL",
  xml: "XML",
  yaml: "YAML",
};

function labelizeLanguage(id: string): string {
  return LABEL_OVERRIDES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

export interface LanguageOption {
  id: string;
  label: string;
  language: LazyLanguage;
}

export const LANGUAGES: LanguageOption[] = Object.entries(bundledLanguages)
  .map(([id, language]) => ({
    id,
    label: labelizeLanguage(id),
    language,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const LANGUAGES_BY_ID = new Map(LANGUAGES.map((language) => [language.id, language]));

export { getSample };
