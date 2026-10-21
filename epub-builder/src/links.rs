use std::collections::HashMap;
use std::ops::Range;

use percent_encoding::percent_decode_str;
use pulldown_cmark::{Event, LinkType, Options, Parser, Tag};
use regex::Regex;

pub type BookTargets = HashMap<String, HashMap<String, String>>;

pub fn split_quote_prefix(line: &str) -> (&str, &str) {
    let mut offset = 0;
    loop {
        let rest = &line[offset..];
        let trimmed = rest.trim_start_matches([' ', '\t']);
        if !trimmed.starts_with('>') {
            break;
        }
        offset += rest.len() - trimmed.len() + 1;
        if line[offset..].starts_with(' ') {
            offset += 1;
        }
    }
    (&line[..offset], &line[offset..])
}

pub fn chapter_targets(content: &str, file_id: &str) -> HashMap<String, String> {
    let mut targets = HashMap::new();
    let mut first_header = true;
    let mut inside_code = false;
    for line in content.lines() {
        let (_, line) = split_quote_prefix(line);
        if line.trim().starts_with("```") {
            inside_code = !inside_code;
        }
        if !inside_code && line.starts_with('#') {
            let title = line.trim_start_matches('#').trim();
            let slug = super::slugify(title);
            let target = if first_header {
                first_header = false;
                file_id.to_string()
            } else {
                format!("{file_id}-{slug}")
            };
            targets.insert(slug, target);
        }
    }
    // Legacy HTML anchors are retained verbatim by the existing renderer.
    let anchors = Regex::new(r#"<(?:a|span)\b[^>]*\bid="([^"]+)""#).unwrap();
    for capture in anchors.captures_iter(content) {
        targets.insert(capture[1].to_string(), capture[1].to_string());
    }
    targets
}

pub fn rewrite_target(url: &str, current_file: &str, targets: &BookTargets) -> String {
    if url.contains(":") || url.starts_with("//") {
        return url.to_string();
    }
    let (path, fragment) = url.split_once('#').unwrap_or((url, ""));
    let chapter = if path.is_empty() {
        current_file
    } else if let Some(stem) = path
        .strip_suffix(".html")
        .or_else(|| path.strip_suffix(".md"))
    {
        stem.rsplit('/').next().unwrap_or(stem)
    } else {
        return url.to_string();
    };
    let Some(chapter_targets) = targets.get(chapter) else {
        return url.to_string();
    };
    if fragment.is_empty() {
        return format!("#{chapter}");
    }
    let decoded = percent_decode_str(fragment).decode_utf8_lossy();
    let slug = super::slugify(&decoded);
    let target = chapter_targets
        .get(decoded.as_ref())
        .or_else(|| chapter_targets.get(&slug));
    match target {
        Some(target) => format!("#{target}"),
        None => url.to_string(),
    }
}

// Namespace references before merging chapters so identical labels such as
// [methods] cannot silently resolve to another chapter's definition.
pub fn prepare_references(content: &str, current_file: &str, targets: &BookTargets) -> String {
    let parser = Parser::new_ext(content, Options::all());
    let mut edits: Vec<(Range<usize>, String)> = Vec::new();
    for (label, definition) in parser.reference_definitions().iter() {
        let destination = rewrite_target(&definition.dest, current_file, targets);
        let title = definition
            .title
            .as_ref()
            .map(|value| format!(" \"{}\"", value.replace('\\', "\\\\").replace('"', "\\\"")))
            .unwrap_or_default();
        edits.push((
            definition.span.clone(),
            format!("[{current_file}-{label}]: <{destination}>{title}\n"),
        ));
    }
    for (event, range) in parser.into_offset_iter() {
        let (link_type, id) = match event {
            Event::Start(Tag::Link { link_type, id, .. })
            | Event::Start(Tag::Image { link_type, id, .. }) => (link_type, id),
            _ => continue,
        };
        let replacement = format!("[{current_file}-{id}]");
        match link_type {
            LinkType::Reference | LinkType::Collapsed => {
                let start = content[range.clone()].rfind('[').expect("reference suffix");
                edits.push((range.start + start..range.end, replacement));
            }
            LinkType::Shortcut => edits.push((range.end..range.end, replacement)),
            _ => {}
        }
    }
    edits.sort_by_key(|(range, _)| range.start);
    let mut result = content.to_string();
    for (range, replacement) in edits.into_iter().rev() {
        result.replace_range(range, &replacement);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn targets() -> BookTargets {
        HashMap::from([
            (
                "first".into(),
                chapter_targets("# 第一章\n\n## 方法\n<a id=\"legacy\"></a>\n", "first"),
            ),
            (
                "second".into(),
                chapter_targets("# 第二章\n\n## 方法\n", "second"),
            ),
        ])
    }

    #[test]
    fn resolves_both_chapter_extensions_and_local_fragments() {
        let targets = targets();
        assert_eq!(
            rewrite_target("second.html#第二章", "first", &targets),
            "#second"
        );
        assert_eq!(
            rewrite_target("second.md#%E6%96%B9%E6%B3%95", "first", &targets),
            "#second-方法"
        );
        assert_eq!(rewrite_target("#方法", "first", &targets), "#first-方法");
        assert_eq!(
            rewrite_target("first.html#legacy", "second", &targets),
            "#legacy"
        );
        assert_eq!(
            rewrite_target("https://example.com/second.html#方法", "first", &targets),
            "https://example.com/second.html#方法"
        );
    }

    #[test]
    fn repeated_reference_labels_keep_their_own_destinations() {
        let targets = targets();
        let first = prepare_references(
            "[方法][methods]\n\n[methods]: second.html#方法\n",
            "first",
            &targets,
        );
        let second = prepare_references(
            "[方法][methods]\n\n[methods]: first.html#方法\n",
            "second",
            &targets,
        );
        let merged = first + &second;
        let urls: Vec<_> = Parser::new(&merged)
            .filter_map(|event| match event {
                Event::Start(Tag::Link { dest_url, .. }) => Some(dest_url.into_string()),
                _ => None,
            })
            .collect();
        assert_eq!(urls, ["#second-方法", "#first-方法"]);
    }

    #[test]
    fn keeps_code_images_shortcuts_and_multiline_definitions() {
        let source = "`[site]`\n\n```rust\n// [site]\n```\n\n[site] and [site][] and ![图][image]\n\n[site]:\nhttps://example.com\n[image]: img/example.png\n";
        let prepared = prepare_references(source, "first", &targets());
        assert!(prepared.contains("`[site]`"));
        assert!(prepared.contains("// [site]"));
        let events: Vec<_> = Parser::new(&prepared).collect();
        assert_eq!(
            events
                .iter()
                .filter(|event| matches!(event, Event::Start(Tag::Link { .. })))
                .count(),
            2
        );
        assert!(events.iter().any(|event| matches!(event, Event::Start(Tag::Image { dest_url, .. }) if dest_url.as_ref() == "img/example.png")));
    }

    #[test]
    fn quoted_headings_have_targets_but_quoted_code_does_not() {
        let targets = chapter_targets(
            "# 章\n\n> ### `->` 运算符到哪去了？\n>\n> ```rust\n> # hidden\n> ```\n",
            "chapter",
        );
        assert_eq!(targets["运算符到哪去了"], "chapter-运算符到哪去了");
        assert!(!targets.contains_key("hidden"));
    }
}
