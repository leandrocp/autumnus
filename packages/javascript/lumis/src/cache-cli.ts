#!/usr/bin/env node

import { cacheLanguages } from "./cache.js";
import { availableLanguages } from "./runtime/node.js";

function usage(): never {
  console.error(
    "Usage: lumis-wasm-cache <language...> [--output <directory>] [--force]\n" +
      "       lumis-wasm-cache --all [--output <directory>] [--force]",
  );
  process.exit(2);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const languages: string[] = [];
  let directory: string | undefined;
  let force = false;
  let all = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--output") {
      directory = args[index + 1];
      if (!directory) usage();
      index += 1;
    } else if (argument === "--force") {
      force = true;
    } else if (argument === "--all") {
      all = true;
    } else if (argument?.startsWith("-")) {
      usage();
    } else if (argument) {
      languages.push(argument);
    }
  }

  if (all && languages.length > 0) usage();
  const selected = all ? availableLanguages().map((language) => language.id) : languages;
  if (selected.length === 0) usage();

  const results = await cacheLanguages(selected, { directory, force });
  for (const result of results) {
    console.log(`${result.language}: ${result.path}${result.downloaded ? "" : " (cached)"}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
