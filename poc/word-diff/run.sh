#!/usr/bin/env bash
# Builds a patched tree-sitter-diff, stages it beside an unpatched control, and
# renders the same word-diff fixture through both.
#
# Nothing here is production shape. It exists so the parse tree, the query and
# the rendered output can be checked against each other without waiting on a
# grammar release. See README.md.
set -euo pipefail

UPSTREAM_REV="0400db1417a28145bec93001f1ee1411155a7363"
UPSTREAM_URL="https://github.com/tree-sitter-grammars/tree-sitter-diff.git"

poc_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$poc_dir/../.." && pwd)"
work="$poc_dir/.work"
control_dir="$work/data-control"
patched_dir="$work/data-patched"
fixture="$poc_dir/fixtures/word-diff-plain.diff"

need() {
    command -v "$1" >/dev/null || { echo "missing $1" >&2; exit 1; }
}
need tree-sitter
need cargo
need python3

echo "==> building the CLI from this worktree"
cargo build --manifest-path "$repo_root/Cargo.toml" -p lumis-cli
cli="$(cargo metadata --manifest-path "$repo_root/Cargo.toml" --no-deps --format-version 1 \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["target_directory"])')/debug/lumis"

echo "==> control: rendering with the published parser"
rm -rf "$control_dir"
mkdir -p "$control_dir"
LUMIS_DATA_DIR="$control_dir" "$cli" highlight -l diff -f bbcode-scoped "$fixture" \
    > "$work/out-control.txt"

echo "==> building the patched parser from $UPSTREAM_REV"
rm -rf "$work/grammar"
git clone --quiet --filter=blob:none "$UPSTREAM_URL" "$work/grammar"
git -C "$work/grammar" checkout --quiet "$UPSTREAM_REV"
git -C "$work/grammar" apply "$poc_dir/grammar.patch"
(cd "$work/grammar" && tree-sitter generate && tree-sitter build --wasm)

echo "==> staging the patched parser"
rm -rf "$patched_dir"
mkdir -p "$patched_dir/parsers"
python3 - "$control_dir" "$patched_dir" "$work/grammar/tree-sitter-diff.wasm" \
    "$poc_dir/highlights.append.scm" <<'PY'
import hashlib, json, pathlib, shutil, sys

control, staged, wasm, extra_query = (pathlib.Path(p) for p in sys.argv[1:5])
blob = wasm.read_bytes()
digest = hashlib.sha256(blob).hexdigest()

package = json.loads((control / "parsers" / "diff.lumis.json").read_text())
package["definitionHash"] = digest
package["parser"]["sha256"] = digest
package["parser"]["size"] = len(blob)
package["languages"]["diff"]["highlights"] += "\n" + extra_query.read_text()

(staged / "parsers" / "diff.lumis.json").write_text(json.dumps(package))
shutil.copyfile(
    wasm,
    staged / "parsers" / f"tree-sitter-diff-{package['version']}-{digest}.wasm",
)
PY

echo "==> patched: rendering the same fixture"
LUMIS_DATA_DIR="$patched_dir" "$cli" highlight -l diff -f bbcode-scoped "$fixture" \
    > "$work/out-patched.txt"

echo
echo "########## fixture ##########"
cat "$fixture"
echo
echo "########## today ##########"
cat "$work/out-control.txt"
echo
echo "########## with the patch ##########"
cat "$work/out-patched.txt"

echo
echo "########## regression: 4138-line unified diff, control vs patched ##########"
for dir in "$control_dir" "$patched_dir"; do
    LUMIS_DATA_DIR="$dir" "$cli" highlight -l diff -f bbcode-scoped \
        "$poc_dir/fixtures/unified-regression.diff" > "$work/$(basename "$dir").unified.txt"
done
if diff -q "$work/data-control.unified.txt" "$work/data-patched.unified.txt" >/dev/null; then
    echo "identical output, no regression"
else
    diff "$work/data-control.unified.txt" "$work/data-patched.unified.txt" | head -40
    exit 1
fi

echo
echo "staged parsers:  $patched_dir"
echo "control parsers: $control_dir"
echo "render live:     LUMIS_DATA_DIR=$patched_dir $cli highlight -l diff -t dracula $fixture"
