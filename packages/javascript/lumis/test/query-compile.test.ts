/**
 * Compile every processed query against its real grammar.
 *
 * This test must never report success while checking nothing. It previously
 * `return`ed from the test body whenever a parser was missing or at the wrong
 * revision, which silently skipped 77 of 115 languages and let an invalid regex
 * reach the branch (see CLAUDE_REVIEW.md §1 and §2).
 *
 * Coverage is now enforced two ways:
 *
 * - every language that has a usable parser is compiled, and a compile error
 *   fails the run with the language named;
 * - every language that has no usable parser must be listed in
 *   `unverified-parsers.json`, and that list can only shrink.
 *
 * Parsers resolve in this order, so the check prefers the artifact that ships but
 * is never blocked by the release cycle:
 *
 * 1. the installed `@lumis-sh/wasm-*` package, when its recorded parser revision
 *    matches `languages.toml`
 * 2. `$LUMIS_WASM_SOURCE_DIR/parsers/<name>.wasm`
 * 3. `tmp/wasms/<name>.wasm`, the output of `mise run wasm-build`
 *
 * `mise run test-queries` builds only the parsers whose packages cannot verify
 * themselves, then requires complete coverage.
 */
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseToml } from "smol-toml";
import { beforeAll, describe, expect, it } from "vitest";
import { Language as TSLanguage, Parser, Query } from "web-tree-sitter";

const QUERY_KINDS = ["highlights", "injections", "locals"] as const;

const workspaceRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const bundleRequire = createRequire(
  createRequire(import.meta.url).resolve("@lumis-sh/wasm-bundle-full"),
);

interface ParserEntry {
  rev?: string;
  wasm_name?: string;
  query_name?: string;
}

const languagesToml = parseToml(readFileSync(join(workspaceRoot, "languages.toml"), "utf8")) as {
  parsers?: Record<string, ParserEntry>;
};
const parsers = Object.entries(languagesToml.parsers ?? {});

const unverified = JSON.parse(
  readFileSync(new URL("./unverified-parsers.json", import.meta.url), "utf8"),
) as { reason: string; languages: string[] };
const waived = new Set(unverified.languages);

/**
 * Parsers too large to build on a GitHub-hosted runner. Excluded from the
 * complete-coverage requirement because the runner is killed rather than the
 * build failing, so there is nothing for the shard to report.
 */
const oversized: { reason: string; parsers: string[] } = JSON.parse(
  readFileSync(new URL("./oversized-parsers.json", import.meta.url), "utf8"),
);
const oversizedParsers = new Set(oversized.parsers);
const parserName = (id: string, entry: { wasm_name?: string }) =>
  entry.wasm_name ?? `tree-sitter-${id}`;

function wasmName(id: string, entry: ParserEntry): string {
  return entry.wasm_name ?? `tree-sitter-${id}`;
}

function packageName(parser: string): string {
  return `@lumis-sh/wasm-${parser.replace(/^tree-sitter-/, "")}`;
}

/** The parser revision an installed package was built from. */
function installedRevision(wasmPath: string): string | undefined {
  const packageDirectory = dirname(wasmPath);
  const manifestPath = join(packageDirectory, "language.json");
  if (existsSync(manifestPath)) {
    const languagePackage = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      parser?: { revision?: string };
    };
    if (languagePackage.parser?.revision) return languagePackage.parser.revision;
  }

  // Packages published before `language.json` kept the revision in package.json.
  const packageJson = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8")) as {
    lumis?: { rev?: string };
  };
  return packageJson.lumis?.rev;
}

/**
 * Whether the *published* package can verify this language.
 *
 * The waiver describes the state of npm, so it must be judged only against the
 * installed package. Building a parser locally makes a language verifiable
 * without making its package published, and conflating the two would force the
 * waiver to be both full and empty depending on whether `tmp/wasms` exists.
 */
function publishedParser(
  id: string,
  entry: ParserEntry,
): { path: string } | { unavailable: string } {
  const parser = wasmName(id, entry);

  let installed: string;
  try {
    installed = bundleRequire.resolve(`${packageName(parser)}/${parser}.wasm`);
  } catch {
    return { unavailable: "parser package is not installed" };
  }
  if (!existsSync(installed)) return { unavailable: "installed parser file is missing" };

  const expected = entry.rev;
  if (expected) {
    const actual = installedRevision(installed);
    if (actual !== expected) {
      return {
        unavailable: `installed package is at rev ${
          actual?.slice(0, 8) ?? "unknown"
        }, languages.toml pins ${expected.slice(0, 8)}`,
      };
    }
  }

  return { path: installed };
}

/**
 * Locate any parser built from the revision `languages.toml` pins.
 *
 * The published package wins when it is usable, so the check exercises the
 * artifact that actually ships. A locally built parser is the fallback for a
 * package that is missing or lagging, which keeps query validation from being
 * blocked by the release cycle. It needs no revision check because it was
 * produced from the pinned revision.
 */
function resolveParser(id: string, entry: ParserEntry): { path: string } | { unavailable: string } {
  const fromPackage = publishedParser(id, entry);
  if ("path" in fromPackage) return fromPackage;

  const parser = wasmName(id, entry);

  const sourceDirectory = process.env.LUMIS_WASM_SOURCE_DIR;
  if (sourceDirectory) {
    const prepared = join(sourceDirectory, "parsers", `${parser}.wasm`);
    if (existsSync(prepared)) return { path: prepared };
  }

  const built = join(workspaceRoot, "tmp", "wasms", `${parser}.wasm`);
  if (existsSync(built)) return { path: built };

  return fromPackage;
}

function queryPath(entry: ParserEntry, id: string, kind: string): string {
  return join(workspaceRoot, "queries", "processed", entry.query_name ?? id, `${kind}.scm`);
}

/** Restrict the run to one language, so CI can shard the parser builds. */
const only = process.env.LUMIS_QUERY_LANGUAGES?.split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const selected = only?.length ? parsers.filter(([id]) => only.includes(id)) : parsers;

/**
 * Set when every parser was built from `languages.toml` first, which means the
 * run must reach complete coverage and the waiver must not excuse anything.
 */
const requireCompleteCoverage = process.env.LUMIS_QUERY_COVERAGE === "complete";

const resolved = new Map<string, { path: string } | { unavailable: string }>(
  selected.map(([id, entry]) => [id, resolveParser(id, entry)]),
);
const published = new Map<string, { path: string } | { unavailable: string }>(
  parsers.map(([id, entry]) => [id, publishedParser(id, entry)]),
);
const verifiable = selected.filter(([id]) => "path" in resolved.get(id)!);
const unavailable = selected.filter(([id]) => "unavailable" in resolved.get(id)!);

beforeAll(async () => {
  await Parser.init();
});

describe("processed queries compile against their pinned grammar", () => {
  it("has a parser catalog to check", () => {
    expect(parsers.length).toBeGreaterThan(100);
  });

  it("reports coverage", () => {
    console.info(
      `query-compile: ${verifiable.length}/${selected.length} languages verified, ` +
        `${unavailable.length} without a usable parser`,
    );
    expect(verifiable.length + unavailable.length).toBe(selected.length);
  });

  it.runIf(requireCompleteCoverage)("verifies every selected language", () => {
    // `mise run test-queries` builds every parser first, so a gap here means a
    // parser build failed rather than a package lagging behind.
    const missing = unavailable
      .filter(([id, entry]) => !oversizedParsers.has(parserName(id, entry)))
      .map(([id]) => `${id}: ${(resolved.get(id) as { unavailable: string }).unavailable}`);
    expect(missing, "every parser should have been built from languages.toml").toEqual([]);
  });

  it.each(verifiable)(
    "compiles every query for %s",
    async (id, entry) => {
      const parser = resolved.get(id)!;
      expect(parser).toHaveProperty("path");
      const grammar = await TSLanguage.load(readFileSync((parser as { path: string }).path));

      const failures: string[] = [];
      for (const kind of QUERY_KINDS) {
        const path = queryPath(entry, id, kind);
        if (!existsSync(path)) continue;
        try {
          new Query(grammar, readFileSync(path, "utf8"));
        } catch (error) {
          failures.push(`${kind}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      expect(failures, `${id} queries failed to compile`).toEqual([]);
    },
    30_000,
  );
});

/**
 * The waiver records which published packages cannot verify their queries. It is
 * judged against npm only, so it stays meaningful whether or not parsers were
 * built locally.
 */
describe("unverified parser waiver", () => {
  const unpublished = parsers.filter(([id]) => "unavailable" in published.get(id)!);

  it("lists every language whose published package cannot verify it", () => {
    // A new gap must be declared. Otherwise a parser bump silently drops a
    // language out of coverage, which is how the §1 defects escaped review.
    const undeclared = unpublished
      .filter(([id]) => !waived.has(id))
      .map(([id]) => `${id}: ${(published.get(id) as { unavailable: string }).unavailable}`);

    expect(
      undeclared,
      "add these to test/unverified-parsers.json, or publish the parser packages",
    ).toEqual([]);
  });

  it("has no stale entries", () => {
    // The list can only shrink. Once a package publishes at the pinned revision,
    // its waiver must go.
    const stale = parsers
      .filter(([id]) => waived.has(id) && "path" in published.get(id)!)
      .map(([id]) => id);

    expect(stale, "these packages are published at the pinned rev, remove them").toEqual([]);
  });

  it("names only real languages", () => {
    const known = new Set(parsers.map(([id]) => id));
    expect(unverified.languages.filter((id) => !known.has(id))).toEqual([]);
  });
});

describe("oversized parser waiver", () => {
  it("names only real parsers", () => {
    const known = new Set(parsers.map(([id, entry]) => parserName(id, entry)));
    expect(
      oversized.parsers.filter((name) => !known.has(name)),
      "these are not parsers in languages.toml",
    ).toEqual([]);
  });

  it("stays small", () => {
    // A growing list means CI is verifying less and less. Keep it exceptional.
    expect(oversized.parsers.length).toBeLessThanOrEqual(5);
  });

  it("excuses nothing that the published package already verifies", () => {
    // If the package matches the pinned revision there is no build to skip.
    const pointless = parsers
      .filter(([id, entry]) => oversizedParsers.has(parserName(id, entry)))
      .filter(([id]) => "path" in published.get(id)!)
      .map(([id]) => id);
    expect(pointless, "these need no build, remove them from the list").toEqual([]);
  });
});
