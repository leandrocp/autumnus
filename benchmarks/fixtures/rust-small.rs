//! Small, realistic Rust input for startup-sensitive benchmarks.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Report<T> {
    name: String,
    values: Vec<T>,
}

impl<T> Report<T>
where
    T: Copy + Into<i64>,
{
    pub fn new(name: impl Into<String>, values: Vec<T>) -> Self {
        Self {
            name: name.into(),
            values,
        }
    }

    pub fn summarize(&self) -> BTreeMap<&'static str, i64> {
        let mut summary = BTreeMap::new();
        let total = self.values.iter().copied().map(Into::into).sum();
        summary.insert("count", self.values.len() as i64);
        summary.insert("total", total);
        summary
    }

    pub fn render(&self) -> String {
        let summary = self.summarize();
        format!(
            "<report name=\"{}\" count=\"{}\">{}</report>",
            self.name,
            summary["count"],
            summary["total"]
        )
    }
}

fn classify(value: i64) -> &'static str {
    match value {
        i64::MIN..=-1 => "negative",
        0 => "zero",
        1..=9 => "small",
        _ => "large",
    }
}

fn main() {
    let report = Report::new("Lumis & friends", vec![1_i32, 2, 3, 13]);
    let labels: Vec<_> = report
        .values
        .iter()
        .map(|value| classify(i64::from(*value)))
        .collect();

    println!("{} // labels: {labels:?}", report.render());
}
