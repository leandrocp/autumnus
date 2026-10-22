//! Word diff in a unified diff
//!
//! With `word_diff`, a `diff` document marks the words that changed between
//! removed lines and the added lines that replace them, on top of the usual
//! line colours. Run `git diff | cargo run --example word_diff` to try it on
//! your own changes.

use std::io::{IsTerminal, Read};

use lumis::{
    highlight_with_options, languages::Language, themes, HighlightOptions, TerminalBuilder,
};

const SAMPLE: &str = r##"diff --git a/lib/varsel/cve/cvelint.ex b/lib/varsel/cve/cvelint.ex
--- a/lib/varsel/cve/cvelint.ex
+++ b/lib/varsel/cve/cvelint.ex
@@ -44,6 +44,7 @@ defmodule Varsel.CVE.Cvelint do
   def lint(cve_id, cve_json) do
-    tmp_dir = System.tmp_dir!()
+    tmp_dir = System.tmp_dir!() |> Path.join("lumis")
     File.mkdir_p!(tmp_dir)
     path = Path.join(tmp_dir, "#{cve_id}.json")
-    File.write!(path, Jason.encode!(cve_json))
+    File.write!(path, JSON.encode!(cve_json))
+    Logger.debug("wrote #{path}")
"##;

fn main() {
    let mut source = String::new();
    if !std::io::stdin().is_terminal() {
        std::io::stdin()
            .read_to_string(&mut source)
            .expect("Failed to read stdin");
    }
    if source.is_empty() {
        source = SAMPLE.to_string();
    }

    let formatter = TerminalBuilder::new()
        .language(Language::Diff)
        .theme(themes::get("catppuccin_mocha").ok())
        .build()
        .expect("Failed to build formatter");

    let output =
        highlight_with_options(&source, formatter, HighlightOptions::new().word_diff(true));

    println!("{output}");
}
