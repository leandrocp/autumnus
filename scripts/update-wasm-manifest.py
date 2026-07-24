#!/usr/bin/env python3
"""Generate exact, integrity-pinned metadata for every Lumis grammar WASM."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import sys
import tomllib
from urllib.parse import quote
from urllib.request import Request, urlopen


TREE_SITTER_SERIES = "0.26"
PACKAGE_FORMAT_VERSION = 2
ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "wasm-manifest.json"
CACHE = ROOT / "tmp" / "wasm-manifest-cache"
FIXTURE_DIRS = (
    ROOT / "packages" / "javascript" / "lumis" / "test" / "fixtures" / "wasm",
    ROOT / "crates" / "lumis-cli" / "tests" / "fixtures" / "parsers",
)


def package_suffix(wasm_name: str) -> str:
    return (
        wasm_name[len("tree-sitter-") :]
        if wasm_name.startswith("tree-sitter-")
        else wasm_name
    )


def fetch_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "lumis-wasm-manifest"})
    with urlopen(request, timeout=60) as response:
        return json.load(response)


def fetch_bytes(url: str) -> bytes:
    CACHE.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE / hashlib.sha256(url.encode()).hexdigest()
    if cache_file.exists():
        return cache_file.read_bytes()

    request = Request(url, headers={"User-Agent": "lumis-wasm-manifest"})
    with urlopen(request, timeout=120) as response:
        data = response.read()
    cache_file.write_bytes(data)
    return data


def version_key(version: str) -> tuple[int, int, int]:
    try:
        major, minor, patch = version.split(".")
        return int(major), int(minor), int(patch)
    except (TypeError, ValueError):
        return -1, -1, -1


def read_uleb(data: bytes, offset: int) -> tuple[int, int]:
    value = 0
    shift = 0
    while True:
        byte = data[offset]
        offset += 1
        value |= (byte & 0x7F) << shift
        if byte & 0x80 == 0:
            return value, offset
        shift += 7


def grammar_name(wasm: bytes) -> str:
    if not wasm.startswith(b"\0asm"):
        raise RuntimeError("invalid WebAssembly module")

    candidates = []
    offset = 8
    while offset < len(wasm):
        section_id = wasm[offset]
        section_size, offset = read_uleb(wasm, offset + 1)
        section_end = offset + section_size
        if section_id == 7:
            export_count, offset = read_uleb(wasm, offset)
            for _ in range(export_count):
                name_size, offset = read_uleb(wasm, offset)
                name = wasm[offset : offset + name_size].decode("utf-8")
                offset += name_size
                kind = wasm[offset]
                _, offset = read_uleb(wasm, offset + 1)
                if (
                    kind == 0
                    and name.startswith("tree_sitter_")
                    and "_external_scanner_" not in name
                ):
                    candidates.append(name.removeprefix("tree_sitter_"))
            break
        offset = section_end

    if len(candidates) != 1:
        raise RuntimeError(f"expected one Tree-sitter language export, got {candidates}")
    return candidates[0]


def matching_version(metadata: dict, revision: str) -> str:
    matches = []
    for version, release in metadata.get("versions", {}).items():
        lumis = release.get("lumis", {})
        if version.startswith(f"{TREE_SITTER_SERIES}.") and (
            lumis.get("treeSitter") == TREE_SITTER_SERIES
            and lumis.get("formatVersion") == PACKAGE_FORMAT_VERSION
        ):
            if lumis.get("rev") == revision:
                matches.append(version)

    if not matches:
        raise RuntimeError(
            f"no published {TREE_SITTER_SERIES}.x package for "
            f"{metadata.get('name')} matches parser revision {revision}"
        )

    return max(matches, key=version_key)


def backfill_grammar_names() -> None:
    manifest = json.loads(OUTPUT.read_text(encoding="utf-8"))
    for wasm_name, entry in manifest["grammars"].items():
        url = (
            f"https://cdn.jsdelivr.net/npm/{entry['packageName']}@{entry['version']}/"
            f"{wasm_name}.wasm"
        )
        entry["grammarName"] = grammar_name(fetch_bytes(url))
        print(f"{wasm_name}: {entry['grammarName']}", flush=True)
    OUTPUT.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def sync_fixtures() -> None:
    manifest = json.loads(OUTPUT.read_text(encoding="utf-8"))
    fixture_names = {
        fixture.stem
        for directory in FIXTURE_DIRS
        for fixture in directory.glob("*.wasm")
    }
    fixture_names.add("tree-sitter-comment")

    for wasm_name in sorted(fixture_names):
        entry = manifest["grammars"][wasm_name]
        url = (
            f"https://cdn.jsdelivr.net/npm/{entry['packageName']}@{entry['version']}/"
            f"{wasm_name}.wasm"
        )
        wasm = fetch_bytes(url)
        if len(wasm) != entry["size"] or hashlib.sha256(wasm).hexdigest() != entry["sha256"]:
            raise RuntimeError(f"{wasm_name} does not match wasm-manifest.json")
        for directory in FIXTURE_DIRS:
            fixture = directory / f"{wasm_name}.wasm"
            if fixture.exists() or wasm_name == "tree-sitter-comment":
                fixture.write_bytes(wasm)
        print(f"{wasm_name}: synced {len(wasm)} bytes", flush=True)


def main() -> None:
    if sys.argv[1:] == ["--grammar-names-only"]:
        backfill_grammar_names()
        return
    if sys.argv[1:] == ["--sync-fixtures"]:
        sync_fixtures()
        return

    with (ROOT / "languages.toml").open("rb") as file:
        languages = tomllib.load(file)

    unique: dict[str, str] = {}
    for language, parser in languages["parsers"].items():
        wasm_name = parser.get("wasm_name") or f"tree-sitter-{language}"
        revision = parser.get("wasm_rev") or parser.get("rev", "")
        previous = unique.setdefault(wasm_name, revision)
        if previous != revision:
            raise RuntimeError(
                f"{wasm_name} is shared by different revisions: {previous} and {revision}"
            )

    grammars = {}
    for wasm_name, revision in sorted(unique.items()):
        package_name = f"@lumis-sh/wasm-{package_suffix(wasm_name)}"
        encoded = quote(package_name, safe="")
        metadata = fetch_json(f"https://registry.npmjs.org/{encoded}")
        version = matching_version(metadata, revision)
        url = (
            f"https://cdn.jsdelivr.net/npm/{package_name}@{version}/"
            f"{wasm_name}.wasm"
        )
        wasm = fetch_bytes(url)
        grammars[wasm_name] = {
            "packageName": package_name,
            "version": version,
            "sha256": hashlib.sha256(wasm).hexdigest(),
            "size": len(wasm),
            "grammarName": grammar_name(wasm),
            "revision": revision,
        }
        print(f"{wasm_name}: {version} ({len(wasm)} bytes)", flush=True)

    manifest = {
        "schemaVersion": 1,
        "treeSitter": TREE_SITTER_SERIES,
        "grammars": grammars,
    }
    OUTPUT.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
