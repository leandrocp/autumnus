#!/usr/bin/env python3
"""Determine which WASM parsers need building/publishing.

Reads languages.toml, inspects published npm metadata, and prints the parsers
that need a new release in the current tree-sitter CLI series.

If a parser rev changed upstream and there is no published `0.26.x` package with
matching `lumis.rev` metadata, the next `0.26.x` patch must be published.

Usage: python3 scripts/wasm-needed.py [parser_name[,parser_name...]] [force]
"""

import subprocess
import sys
import tomllib
import json

SUPPORTED_TREE_SITTER_CLI = "0.26"
PACKAGE_FORMAT_VERSION = 2


def is_truthy(value: str) -> bool:
    return value.lower() in {"1", "true", "yes", "on"}


def wasm_package_suffix(wasm_name: str) -> str:
    prefix = "tree-sitter-"
    return wasm_name[len(prefix) :] if wasm_name.startswith(prefix) else wasm_name


def current_series_versions(versions: list[str]) -> list[str]:
    prefix = f"{SUPPORTED_TREE_SITTER_CLI}."
    return [version for version in versions if version.startswith(prefix)]


def next_patch_version(versions: list[str]) -> str:
    highest_patch = -1
    prefix = f"{SUPPORTED_TREE_SITTER_CLI}."
    for version in versions:
        if not version.startswith(prefix):
            continue
        patch = version[len(prefix) :]
        if patch.isdigit():
            highest_patch = max(highest_patch, int(patch))
    return f"{SUPPORTED_TREE_SITTER_CLI}.{highest_patch + 1}"


def published_for_revision(pkg: str, versions: list[str], rev: str) -> bool:
    for npm_version in current_series_versions(versions):
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
            and lumis_meta.get("rev") == rev
            and lumis_meta.get("treeSitter") == SUPPORTED_TREE_SITTER_CLI
            and lumis_meta.get("formatVersion") == PACKAGE_FORMAT_VERSION
        ):
            return True
    return False


with open("languages.toml", "rb") as f:
    data = tomllib.load(f)

raw_filter = sys.argv[1] if len(sys.argv) > 1 else ""
filter_parsers = {part.strip() for part in raw_filter.split(",") if part.strip()}
force_publish = is_truthy(sys.argv[2]) if len(sys.argv) > 2 else False
needed = []
seen = set()
revisions = {}

for pname, info in data.get("parsers", {}).items():
    wasm_name = info.get("wasm_name") or f"tree-sitter-{pname}"
    revision = info.get("wasm_rev") or info.get("rev", "")
    previous = revisions.setdefault(wasm_name, revision)
    if previous != revision:
        raise RuntimeError(
            f"{wasm_name} is shared by different revisions: {previous} and {revision}"
        )

for pname, info in data.get("parsers", {}).items():
    wasm_name = info.get("wasm_name") or f"tree-sitter-{pname}"
    revision = revisions[wasm_name]

    if (
        filter_parsers
        and pname not in filter_parsers
        and wasm_name not in filter_parsers
    ):
        continue

    if wasm_name in seen:
        continue
    seen.add(wasm_name)

    if force_publish:
        needed.append(wasm_name)
        continue

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

    published = published_for_revision(pkg, versions, revision)

    if not published:
        print(
            f"Need to publish {pkg}@{next_patch_version(versions)} for {revision}",
            file=sys.stderr,
        )
        needed.append(wasm_name)

print(" ".join(needed))
