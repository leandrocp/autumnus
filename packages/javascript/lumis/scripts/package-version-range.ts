import fs from "node:fs";
import path from "node:path";

const CATALOG_RS = path.resolve(
  import.meta.dirname,
  "../../../../crates/lumis-wasm-runtime/src/catalog.rs",
);

// `mise run langs-gen-catalog` derives this from the Tree-sitter series pinned in
// mise.toml and writes it into the generated Rust catalog. Reading it back keeps
// one implementation rather than a second pin parser that could disagree about
// which series a runtime supports.
export function languagePackageVersionRange(): string {
  const source = fs.readFileSync(CATALOG_RS, "utf-8");
  const range = /package_version_range:\s*"([^"]+)"/u.exec(source)?.[1];
  if (!range) {
    throw new Error(
      `no package version range found in ${CATALOG_RS}; run mise run langs-gen-catalog`,
    );
  }
  return range;
}
