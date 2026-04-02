#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path


def fail(message: str) -> None:
    print(f"::error::{message}", file=sys.stderr)
    raise SystemExit(1)


def load_manifest(path: Path) -> dict:
    with path.open("rb") as f:
        return tomllib.load(f)


def extract_version_requirement(spec: object) -> str | None:
    if isinstance(spec, str):
        return parse_version_requirement(spec)

    if isinstance(spec, dict):
        version = spec.get("version")
        if isinstance(version, str):
            return parse_version_requirement(version)

    return None


def parse_version_requirement(requirement: str) -> str | None:
    lower_bound = re.search(r">=\s*([0-9]+\.[0-9]+\.[0-9]+)", requirement)
    if lower_bound:
        return lower_bound.group(1)

    exactish = re.search(r"(?:\^|~)?([0-9]+\.[0-9]+\.[0-9]+)", requirement)
    if exactish:
        return exactish.group(1)

    return None


def iter_internal_dependencies(
    manifest: dict, crate_name: str
) -> list[tuple[str, str]]:
    dependency_sections = (
        "dependencies",
        "dev-dependencies",
        "build-dependencies",
        "target",
    )

    internal: dict[str, str] = {}

    for section in dependency_sections:
        value = manifest.get(section)
        if section == "target" and isinstance(value, dict):
            for target_spec in value.values():
                if not isinstance(target_spec, dict):
                    continue
                collect_dependency_map(
                    target_spec.get("dependencies"), internal, crate_name
                )
                collect_dependency_map(
                    target_spec.get("dev-dependencies"), internal, crate_name
                )
                collect_dependency_map(
                    target_spec.get("build-dependencies"), internal, crate_name
                )
            continue

        collect_dependency_map(value, internal, crate_name)

    return sorted(internal.items())


def collect_dependency_map(
    value: object, internal: dict[str, str], crate_name: str
) -> None:
    if not isinstance(value, dict):
        return

    for dep_name, dep_spec in value.items():
        if not dep_name.startswith("lumis") or dep_name == crate_name:
            continue

        required_version = extract_version_requirement(dep_spec)
        if not required_version:
            fail(
                f"Could not determine required version for internal dependency {dep_name} from manifest data: {dep_spec!r}. "
                "Expected release-please cargo-workspace to rewrite the dependency to a concrete lower bound."
            )

        internal[dep_name] = required_version


def wait_for_version(crate: str, version: str, manifest_path: Path) -> None:
    print(f"Waiting for crates.io to expose {crate} {version}")
    deadline = time.monotonic() + 300
    url = f"https://crates.io/api/v1/crates/{crate}/{version}"

    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url):
                print(f"Found {crate} {version} on crates.io")
                return
        except urllib.error.HTTPError as exc:
            if exc.code != 404:
                raise
        except urllib.error.URLError:
            pass

        time.sleep(5)

    fail(
        f"Timed out waiting for crates.io package {crate} {version} required by {manifest_path}"
    )


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(
            "usage: verify-rust-publish.py <manifest-path> <crate-name>",
            file=sys.stderr,
        )
        return 1

    manifest_path = Path(argv[1])
    crate_name = argv[2]
    manifest = load_manifest(manifest_path)

    for dep_name, required_version in iter_internal_dependencies(manifest, crate_name):
        wait_for_version(dep_name, required_version, manifest_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
