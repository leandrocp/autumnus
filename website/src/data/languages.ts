import { availableLanguages } from "@lumis-sh/lumis";
import { bundledLanguages } from "@lumis-sh/lumis/bundles/full";
import type { LazyLanguage } from "@lumis-sh/lumis";
import { getSample } from "./samples";

export interface LanguageOption {
  id: string;
  label: string;
  language: LazyLanguage;
}

// Display names come from the catalog, which is the same list the CLI, Elixir
// and Rust print, so a language added upstream arrives here already named. The
// table this replaced had drifted: it rendered `toml` as "Toml" and
// `jinja_inline` as "Jinja_inline".
const CATALOG_NAMES = new Map(availableLanguages().map(({ id, name }) => [id, name]));

export const LANGUAGES: LanguageOption[] = Object.entries(bundledLanguages)
  .map(([id, language]) => ({
    id,
    label: CATALOG_NAMES.get(id) || id,
    language,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const LANGUAGES_BY_ID = new Map(LANGUAGES.map((language) => [language.id, language]));

export { getSample };
