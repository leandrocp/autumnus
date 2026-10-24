#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
poc="$root/poc/theme-packs"
workspace="$root/tmp/theme-packs-poc"
mkdir -p "$workspace"

snapshot() {
    local name="$1" url="$2" revision="$3"
    local directory="$workspace/$name"
    if [[ ! -d "$directory" ]]; then
        git init --quiet "$directory"
        git -C "$directory" remote add origin "$url"
        git -C "$directory" fetch --quiet --depth 1 origin "$revision"
        git -C "$directory" checkout --quiet --detach FETCH_HEAD
    fi
    if [[ "$(git -C "$directory" rev-parse HEAD)" != "$revision" ]]; then
        echo "Unexpected revision in $directory; move it aside before running the PoC." >&2
        exit 1
    fi
}

apply_patch() {
    local name="$1"
    if ! git -C "$workspace/$name" apply --reverse --check "$poc/$name.patch" 2>/dev/null; then
        git -C "$workspace/$name" apply --check "$poc/$name.patch"
        git -C "$workspace/$name" apply "$poc/$name.patch"
    fi
}

copy() {
    mkdir -p "$(dirname "$2")"
    if ! cmp -s "$1" "$2"; then
        cp "$1" "$2"
    fi
}

theme() {
    local name="$1" pack="$2" repository="$3" license_file="$4" license="$5"
    local revision
    revision="$(jq -er .revision "$root/themes/$name.json")"
    copy "$root/themes/$name.json" "$workspace/$pack/priv/themes/$name.json"
    copy "$root/themes/licenses/$repository/$revision/$license_file" \
        "$workspace/$pack/priv/licenses/$name/$license_file"
    printf '* %s: [%s](https://github.com/%s/tree/%s); [%s](licenses/%s/%s).\n' \
        "$name" "$repository" "$repository" "$revision" "$license" "$name" "$license_file" \
        >> "$workspace/$pack/priv/NOTICE.md"
}

run_mode() {
    local mode="$1"
    printf '\n=== %s ===\n' "$mode"
    (
        cd "$workspace/consumer"
        export MIX_ENV="$mode" LUMIS_BUILD=1 MDEX_NATIVE_BUILD=1
        mix deps.get
        mix run check.exs
    )
}

fingerprint() {
    sha256sum "$@"
    stat -c '%n %y' "$@"
}

snapshot lumis https://github.com/leandrocp/lumis ca13828b778458475f856e6eaae35222d5345340
snapshot mdex_native https://github.com/leandrocp/mdex_native 702e4d3bf2dde6825adbd2dc45e2bd14d9667205
snapshot mdex https://github.com/leandrocp/mdex 8110197690db00271f4673810e5cbeb1abd93d1e
apply_patch lumis
apply_patch mdex_native
copy "$poc/packs.rs" "$workspace/lumis/crates/lumis-core/src/themes/packs.rs"

while IFS= read -r file; do
    copy "$file" "$workspace/${file#"$poc/"}"
done < <(find "$poc/consumer" "$poc/themes" "$poc/themes-copyleft" -type f)

for pack in themes themes-copyleft; do
    mkdir -p "$workspace/$pack/priv"
    printf '# Theme notices\n\n' > "$workspace/$pack/priv/NOTICE.md"
done
theme onedark themes olimorris/onedarkpro.nvim LICENSE MIT
theme catppuccin_latte themes catppuccin/nvim LICENSE.md MIT
theme ayu_dark themes-copyleft Shatur/neovim-ayu COPYING GPL-3.0

mdex_binary="$workspace/mdex_native/native/mdex_native_nif/target/debug/libmdex_native_nif.so"
lumis_binary="$workspace/lumis/packages/elixir/lumis/native/lumis_nif/target/debug/liblumis_nif.so"

run_mode default
before="$(fingerprint "$mdex_binary")"
run_mode copyleft
test "$before" = "$(fingerprint "$mdex_binary")"
echo 'PASS: MDEx NIF hash and mtime unchanged after adding the copyleft dependency.'
run_mode default

run_mode both_default
before="$(fingerprint "$mdex_binary" "$lumis_binary")"
run_mode both
test "$before" = "$(fingerprint "$mdex_binary" "$lumis_binary")"
echo 'PASS: Both NIF hashes and mtimes unchanged after adding the copyleft dependency.'
echo 'PASS: All theme-pack scenarios passed.'
