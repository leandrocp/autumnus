use std::env;
use std::fs;
use std::path::PathBuf;

fn manifest_dir() -> PathBuf {
    PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap())
}

fn workspace_root() -> PathBuf {
    manifest_dir()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn resolve_path(relative_to_root: &str) -> PathBuf {
    let workspace = workspace_root().join(relative_to_root);
    if workspace.exists() {
        return workspace;
    }
    let crate_local = manifest_dir().join(relative_to_root);
    if crate_local.exists() {
        return crate_local;
    }
    workspace
}

fn main() {
    sync_extract_theme_script();
    gen_conformance_tests();
}

fn sync_extract_theme_script() {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let workspace_script = workspace_root().join("themes/extract_theme.lua");
    let crate_script = manifest_dir().join("themes/extract_theme.lua");
    let out_script = out_dir.join("extract_theme.lua");

    println!("cargo:rerun-if-changed={}", crate_script.display());
    if workspace_script.exists() {
        println!("cargo:rerun-if-changed={}", workspace_script.display());
    }

    let script = if workspace_script.exists() {
        let workspace_content =
            fs::read_to_string(&workspace_script).expect("failed to read themes/extract_theme.lua");
        if fs::read_to_string(&crate_script).ok().as_deref() != Some(&workspace_content) {
            if let Some(parent) = crate_script.parent() {
                fs::create_dir_all(parent).expect("failed to create crate themes directory");
            }
            fs::write(&crate_script, &workspace_content)
                .expect("failed to sync crate-local extract_theme.lua");
        }
        workspace_content
    } else {
        fs::read_to_string(&crate_script)
            .expect("failed to read crate-local themes/extract_theme.lua")
    };

    fs::write(out_script, script).expect("failed to write generated extract_theme.lua");
}

fn gen_conformance_tests() {
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let conformance_dir = resolve_path("fixtures/conformance");
    println!("cargo:rerun-if-changed={}", conformance_dir.display());

    let mut code = String::new();
    if let Ok(entries) = fs::read_dir(&conformance_dir) {
        let mut names: Vec<String> = entries
            .filter_map(|entry| {
                let entry = entry.ok()?;
                entry
                    .file_type()
                    .ok()?
                    .is_dir()
                    .then(|| entry.file_name().to_string_lossy().to_string())
            })
            .filter(|name| !name.starts_with('.'))
            .collect();
        names.sort();

        for name in names {
            let ident = name.replace('-', "_");
            code.push_str(&format!(
                r#"
mod {ident} {{
    use super::*;
    fn fixture() -> Fixture {{ load_fixture("{name}") }}
    #[test] #[ignore = "conformance"] fn conformance_html_inline() {{ check_html_inline(&fixture()); }}
    #[test] #[ignore = "conformance"] fn conformance_html_linked() {{ check_html_linked(&fixture()); }}
    #[test] #[ignore = "conformance"] fn conformance_html_multi_themes() {{ check_html_multi_themes(&fixture()); }}
    #[test] #[ignore = "conformance"] fn conformance_terminal() {{ check_terminal(&fixture()); }}
    #[test] #[ignore = "conformance"] fn conformance_bbcode_scoped() {{ check_bbcode(&fixture()); }}
}}
"#
            ));
        }
    }

    fs::write(out_dir.join("conformance_tests.rs"), code)
        .expect("failed to write generated conformance tests");
}
