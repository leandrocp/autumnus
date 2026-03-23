import {
  EMACS_MODE_MAP,
  EXACT_LANGUAGE_MAP,
  GLOB_MATCHERS,
  SHEBANG_MAP,
} from "./generated/language-detection.js";
import { PLAINTEXT_LANG_ID } from "./types.js";

const GLOB_REGEXES = GLOB_MATCHERS.map(({ id, glob }) => ({ id, regex: globToRegExp(glob) }));

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function basename(value: string): string {
  const normalized = value.replaceAll("\\", "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? normalized;
}

function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(glob: string): RegExp {
  return new RegExp(`^${escapeRegex(glob).replaceAll("*", ".*")}$`);
}

function parseLanguageHint(language?: string): string | undefined {
  if (language == null) return undefined;

  const normalized = normalize(language);
  if (normalized.length === 0) return PLAINTEXT_LANG_ID;

  const direct = EXACT_LANGUAGE_MAP[normalized];
  if (direct) return direct;

  const fileName = basename(normalized);
  for (const matcher of GLOB_REGEXES) {
    if (matcher.regex.test(fileName)) {
      return matcher.id;
    }
  }

  const extension = fileName.startsWith(".") ? fileName.slice(1) : fileName;
  if (extension.length > 0) {
    const extensionPattern = `*.${extension}`;
    for (const matcher of GLOB_REGEXES) {
      if (matcher.regex.test(extensionPattern)) {
        return matcher.id;
      }
    }
  }

  return undefined;
}

function fromEmacsModeHeader(source: string): string | undefined {
  const lines = source.split(/\r?\n/).slice(0, 2);

  for (const line of lines) {
    const modeMatch = line.match(/-\*-.*mode:([^;]+?);.*-\*-/);
    const shorthandMatch = line.match(/-\*-(.+)-\*-/);
    const rawMode = modeMatch?.[1] ?? shorthandMatch?.[1];
    if (rawMode == null) {
      continue;
    }

    const mode = normalize(rawMode);
    const language = EMACS_MODE_MAP[mode];
    if (language) {
      return language;
    }
  }

  return undefined;
}

function normalizeShebangCommand(command: string): string {
  const normalized = basename(normalize(command));
  return normalized.replace(/\d+(?:\.\d+)*$/, "");
}

function fromShebang(source: string): string | undefined {
  const firstLine = source.split(/\r?\n/, 1)[0]?.trim();
  if (!firstLine?.startsWith("#!")) return undefined;

  const match = firstLine.match(/^#!\s*(?:\/usr\/bin\/env\s+)?([^ ]+)/);
  const command = match?.[1];

  if (!command) return undefined;
  return SHEBANG_MAP[normalizeShebangCommand(command)];
}

function looksLikeHtml(source: string): boolean {
  return source.trimStart().toLowerCase().startsWith("<!doctype html");
}

function looksLikeXml(source: string): boolean {
  return source.trimStart().toLowerCase().startsWith("<?xml");
}

function looksLikeObjc(language: string | undefined, source: string): boolean {
  if (language == null || !basename(language).toLowerCase().endsWith(".h")) {
    return false;
  }

  return source
    .split(/\r?\n/)
    .slice(0, 100)
    .some((line) =>
      ["#import", "@interface", "@protocol"].some((keyword) => line.startsWith(keyword)),
    );
}

/**
 * Guess a language ID from a language hint, path, extension, or source content.
 *
 * The `language` argument can be a language ID, alias, file extension, file name,
 * or file path. If it cannot be resolved directly, Lumis falls back to content
 * heuristics such as Emacs mode headers, shebangs, HTML doctype, and XML declarations.
 */
export function guessLanguage(language?: string, source = ""): string {
  const explicit = parseLanguageHint(language);
  if (explicit) return explicit;

  const emacsMode = fromEmacsModeHeader(source);
  if (emacsMode) return emacsMode;

  const shebang = fromShebang(source);
  if (shebang) return shebang;

  if (looksLikeHtml(source)) return "html";
  if (looksLikeXml(source)) return "xml";
  if (looksLikeObjc(language, source)) return "objc";

  return PLAINTEXT_LANG_ID;
}
