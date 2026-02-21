use std::collections::HashMap;

include!(concat!(env!("OUT_DIR"), "/samples_generated.rs"));

pub fn samples() -> HashMap<&'static str, &'static str> {
    let available = lumis::languages::available_languages();

    let mut ext_to_lang: HashMap<String, String> = HashMap::new();
    for (id, (_, globs)) in &available {
        for glob in globs {
            if let Some(ext) = glob.strip_prefix("*.") {
                ext_to_lang.insert(ext.to_string(), id.clone());
            }
        }
    }

    let mut m = HashMap::new();
    for (filename, content) in sample_files() {
        if let Some(ext) = filename.rsplit('.').next() {
            if let Some(lang_id) = ext_to_lang.get(ext) {
                let key: &'static str = lang_id.clone().leak();
                m.insert(key, content);
            }
        }
    }

    m
}
