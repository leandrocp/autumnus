#!/usr/bin/env bash

set -euo pipefail

manifest_path="${1:?usage: verify-rust-publish.sh <manifest-path> <crate-name>}"
crate_name="${2:?usage: verify-rust-publish.sh <manifest-path> <crate-name>}"

extract_required_version() {
  local dep_line="$1"
  local version

  version=$(printf '%s\n' "$dep_line" | sed -nE 's/.*version *= *">=([^",]+).*/\1/p')
  if [ -n "$version" ]; then
    printf '%s\n' "$version"
    return 0
  fi

  version=$(printf '%s\n' "$dep_line" | sed -nE 's/.*version *= *"[\^~]?([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p')
  printf '%s\n' "$version"
}

wait_for_version() {
  local crate="$1"
  local version="$2"
  local deadline=$((SECONDS + 300))

  printf 'Waiting for crates.io to expose %s %s\n' "$crate" "$version"
  while [ "$SECONDS" -lt "$deadline" ]; do
    if curl --fail --silent --show-error "https://crates.io/api/v1/crates/$crate/$version" >/dev/null; then
      printf 'Found %s %s on crates.io\n' "$crate" "$version"
      return 0
    fi

    sleep 5
  done

  printf '::error::Timed out waiting for crates.io package %s %s required by %s\n' "$crate" "$version" "$manifest_path" >&2
  exit 1
}

while IFS= read -r dep; do
  line=$(grep -E "^[[:space:]]*$dep[[:space:]]*=" "$manifest_path" || true)
  [ -n "$line" ] || continue

  required_version=$(extract_required_version "$line")
  if [ -z "$required_version" ]; then
    printf '::error::Could not determine required version for internal dependency %s from: %s\n' "$dep" "$line" >&2
    printf '::error::Expected release-please cargo-workspace to rewrite the dependency to a concrete lower bound.\n' >&2
    exit 1
  fi

  wait_for_version "$dep" "$required_version"
done < <(printf '%s\n' lumis-build lumis-core | grep -vx "$crate_name")

if ! cargo publish -p "$crate_name" --dry-run; then
  printf '::error::cargo publish --dry-run failed for %s\n' "$crate_name" >&2
  printf '::error::This usually means internal Rust dependency versions were not propagated into the release PR, or crates.io has not indexed the required internal crates yet.\n' >&2
  printf '::error::Check release-please manifest mode with the cargo-workspace plugin and confirm the tagged Cargo.toml points at the expected internal crate versions.\n' >&2
  exit 1
fi
