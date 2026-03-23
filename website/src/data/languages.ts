import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import { SAMPLES } from "./samples";

export const LANGUAGES = [
  { id: "bash", label: "Bash", language: bundledLanguages.bash, sample: SAMPLES.bash },
  { id: "css", label: "CSS", language: bundledLanguages.css, sample: SAMPLES.css },
  { id: "diff", label: "Diff", language: bundledLanguages.diff, sample: SAMPLES.diff },
  { id: "elixir", label: "Elixir", language: bundledLanguages.elixir, sample: SAMPLES.elixir },
  { id: "html", label: "HTML", language: bundledLanguages.html, sample: SAMPLES.html },
  { id: "java", label: "Java", language: bundledLanguages.java, sample: SAMPLES.java },
  { id: "javascript", label: "JavaScript", language: bundledLanguages.javascript, sample: SAMPLES.javascript },
  { id: "json", label: "JSON", language: bundledLanguages.json, sample: SAMPLES.json },
  { id: "ruby", label: "Ruby", language: bundledLanguages.ruby, sample: SAMPLES.ruby },
  { id: "rust", label: "Rust", language: bundledLanguages.rust, sample: SAMPLES.rust },
  { id: "tsx", label: "TSX", language: bundledLanguages.tsx, sample: SAMPLES.tsx },
  { id: "typescript", label: "TypeScript", language: bundledLanguages.typescript, sample: SAMPLES.typescript },
] as const;

export type LanguageOption = (typeof LANGUAGES)[number];

export const LANGUAGES_BY_ID = new Map(LANGUAGES.map((language) => [language.id, language]));
