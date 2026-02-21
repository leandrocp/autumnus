use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let samples_dir = Path::new(&manifest_dir).join("../../samples");
    let samples_dir = samples_dir.canonicalize().expect("samples directory not found");

    println!("cargo:rerun-if-changed={}", samples_dir.display());

    let mut entries: Vec<_> = fs::read_dir(&samples_dir)
        .expect("failed to read samples directory")
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path();
            path.is_file()
                && path
                    .extension()
                    .map(|ext| ext != "md")
                    .unwrap_or(false)
        })
        .collect();

    entries.sort_by_key(|e| e.file_name());

    let items: Vec<String> = entries
        .iter()
        .map(|entry| {
            let path = entry.path();
            let filename = path.file_name().unwrap().to_str().unwrap().to_string();
            let abs_path = path.canonicalize().unwrap();
            format!(
                "        (\"{filename}\", include_str!(\"{}\"))",
                abs_path.display()
            )
        })
        .collect();

    let code = format!(
        "pub fn sample_files() -> Vec<(&'static str, &'static str)> {{\n    vec![\n{},\n    ]\n}}\n",
        items.join(",\n")
    );

    let out_dir = env::var("OUT_DIR").unwrap();
    fs::write(Path::new(&out_dir).join("samples_generated.rs"), code).unwrap();
}
