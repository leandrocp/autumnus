#!/usr/bin/env python3
"""Determine which WASM parsers need building/publishing.

Reads languages.toml, computes npm versions, and checks npm registry.
Prints space-separated list of parser names that need publishing.

Usage: python3 scripts/wasm-needed.py [parser_name[,parser_name...]]
"""

import subprocess
import sys
import tomllib
import json

SUPPORTED_TREE_SITTER_CLI = "0.26"


def wasm_package_suffix(wasm_name: str) -> str:
    prefix = "tree-sitter-"
    return wasm_name[len(prefix) :] if wasm_name.startswith(prefix) else wasm_name


with open("languages.toml", "rb") as f:
    data = tomllib.load(f)

raw_filter = sys.argv[1] if len(sys.argv) > 1 else ""
filter_parsers = {part.strip() for part in raw_filter.split(",") if part.strip()}
needed = []
seen = set()

for pname, info in data.get("parsers", {}).items():
    wasm_name = info.get("wasm_name") or f"tree-sitter-{pname}"

    if (
        filter_parsers
        and pname not in filter_parsers
        and wasm_name not in filter_parsers
    ):
        continue

    if wasm_name in seen:
        continue
    seen.add(wasm_name)

    pkg = f"@lumis-sh/wasm-{wasm_package_suffix(wasm_name)}"
    result = subprocess.run(
        ["npm", "view", pkg, "versions", "--json"],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        needed.append(wasm_name)
        continue

    try:
        versions_data = json.loads(result.stdout or "[]")
    except Exception:
        needed.append(wasm_name)
        continue

    if isinstance(versions_data, str):
        versions = [versions_data]
    else:
        versions = [v for v in versions_data if isinstance(v, str)]

    published = False
    prefix = f"{SUPPORTED_TREE_SITTER_CLI}."
    for npm_version in versions:
        if not npm_version.startswith(prefix):
            continue
        meta = subprocess.run(
            ["npm", "view", f"{pkg}@{npm_version}", "lumis", "--json"],
            capture_output=True,
            text=True,
        )
        if meta.returncode != 0:
            continue
        try:
            lumis_meta = json.loads(meta.stdout or "{}")
        except Exception:
            continue
        if (
            isinstance(lumis_meta, dict)
            and lumis_meta.get("rev") == info.get("rev", "")
            and lumis_meta.get("treeSitter") == SUPPORTED_TREE_SITTER_CLI
        ):
            published = True
            break

    if not published:
        needed.append(wasm_name)

print(" ".join(needed))
