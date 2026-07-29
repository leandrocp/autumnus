#!/usr/bin/env python3
"""Determine which WASM parsers need building/publishing.

Reads languages.toml and processed queries, inspects published npm metadata,
and prints the parsers whose complete language-package definition needs a new
release in the current tree-sitter CLI series.

Usage: python3 scripts/wasm-needed.py [parser_name[,parser_name...]] [force]
"""

import subprocess
import sys
import tomllib
import json
import hashlib
from pathlib import Path

with open("mise.toml", "rb") as f:
    SUPPORTED_TREE_SITTER_CLI = tomllib.load(f)["tools"]["tree-sitter"]

PACKAGE_FORMAT_VERSION = 3


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


def hash_field(digest: "hashlib._Hash", value: bytes) -> None:
    digest.update(len(value).to_bytes(8, "big"))
    digest.update(value)


def query_text(query_name: str, kind: str) -> bytes:
    path = Path("queries/processed") / query_name / f"{kind}.scm"
    if path.exists():
        return path.read_bytes()
    if kind == "brackets":
        default = Path("queries/processed/default/brackets.scm")
        if default.exists():
            return default.read_bytes()
    return b""


def definition_hash(
    data: dict, wasm_name: str, revision: str
) -> str:
    digest = hashlib.sha256()
    hash_field(digest, b"lumis-language-package-v3")
    hash_field(digest, wasm_name.encode())
    hash_field(digest, revision.encode())

    languages = []
    for language, info in data.get("parsers", {}).items():
        parser_wasm = info.get("wasm_name") or f"tree-sitter-{language}"
        if parser_wasm == wasm_name:
            languages.append((language, info))

    for language, info in sorted(languages):
        hash_field(digest, language.encode())
        for alias in sorted(info.get("aliases", [])):
            hash_field(digest, alias.encode())
        query_name = info.get("query_name") or language
        for kind in ("highlights", "injections", "locals", "brackets"):
            hash_field(digest, query_text(query_name, kind))
    return digest.hexdigest()


def published_for_definition(
    pkg: str, versions: list[str], expected_hash: str
) -> bool:
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
            and lumis_meta.get("definitionHash") == expected_hash
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
    revision = info.get("rev", "")
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

    expected_hash = definition_hash(data, wasm_name, revision)
    published = published_for_definition(pkg, versions, expected_hash)

    if not published:
        print(
            f"Need to publish {pkg}@{next_patch_version(versions)} for {expected_hash}",
            file=sys.stderr,
        )
        needed.append(wasm_name)

print(" ".join(needed))
