/**
 * Generates one TypeScript module per theme JSON file,
 * and copies normalized JSON files to dist/json/.
 *
 * Accepts a --step flag:
 *   --step=ts    Generate TypeScript modules only (run before tsup)
 *   --step=json  Copy normalized JSON to dist/json/ (run after tsup clean)
 *   (no flag)    Run both steps
 */

import fs from "node:fs";
import path from "node:path";
import type { ThemeData } from "../src/types.js";

const THEMES_SRC = path.resolve(import.meta.dirname, "../../../../themes");
const THEMES_OUT = path.resolve(import.meta.dirname, "../themes");
const JSON_OUT = path.resolve(import.meta.dirname, "../dist/json");

function normalize(data: ThemeData) {
  for (const entry of Object.values(data.highlights)) {
    if (entry.underline === true) {
      entry.underline = "solid";
    }
    if (entry.undercurl) {
      entry.underline = "undercurl";
      delete entry.undercurl;
    }
  }
}

function readThemes() {
  const files = fs.readdirSync(THEMES_SRC).filter((f) => f.endsWith(".json"));
  const themes: { name: string; file: string; data: ThemeData }[] = [];

  for (const file of files) {
    const name = path.basename(file, ".json");
    const json = fs.readFileSync(path.join(THEMES_SRC, file), "utf-8");
    const data: ThemeData = JSON.parse(json);

    if (!data.name || !data.highlights) {
      console.warn(`  skipping ${file}: missing name or highlights`);
      continue;
    }

    normalize(data);
    themes.push({ name, file, data });
  }

  return themes;
}

function generateTS(themes: ReturnType<typeof readThemes>) {
  fs.mkdirSync(THEMES_OUT, { recursive: true });

  for (const { name, data } of themes) {
    const module = `import type { ThemeData } from '../src/types.js'

const theme: ThemeData = ${JSON.stringify(data)}

export default theme
`;
    fs.writeFileSync(path.join(THEMES_OUT, `${name}.ts`), module);
  }

  console.log(`  ${themes.length} theme modules generated`);
}

function copyJSON(themes: ReturnType<typeof readThemes>) {
  fs.mkdirSync(JSON_OUT, { recursive: true });

  for (const { file, data } of themes) {
    fs.writeFileSync(path.join(JSON_OUT, file), JSON.stringify(data));
  }

  console.log(`  ${themes.length} JSON files copied to dist/json/`);
}

const step = process.argv.find((a) => a.startsWith("--step="))?.split("=")[1];
const themes = readThemes();

if (!step || step === "ts") generateTS(themes);
if (!step || step === "json") copyJSON(themes);
