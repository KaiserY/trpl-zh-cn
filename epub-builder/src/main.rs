use std::collections::HashMap;
use std::path::Path;
use regex::{Regex, Captures};
use percent_encoding::percent_decode_str;

#[cfg(target_os = "windows")]
fn reload_path() {
    use winreg::enums::*;
    use winreg::RegKey;

    let mut paths = Vec::new();
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(env) = hkcu.open_subkey("Environment") {
        if let Ok(path) = env.get_value::<String, _>("Path") {
            paths.push(path);
        }
    }
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(env) = hklm.open_subkey(r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment") {
        if let Ok(path) = env.get_value::<String, _>("Path") {
            paths.push(path);
        }
    }
    if !paths.is_empty() {
        let combined = paths.join(";");
        std::env::set_var("PATH", combined);
    }
}

#[cfg(not(target_os = "windows"))]
fn reload_path() {}

fn slugify(text: &str) -> String {
    let decoded = percent_decode_str(text).decode_utf8_lossy();
    let lower = decoded.to_lowercase();
    
    let re_space = Regex::new(r"[\s_]+").unwrap();
    let step1 = re_space.replace_all(&lower, "-");
    
    let re_chars = Regex::new(r"[^\w\-]").unwrap();
    let step2 = re_chars.replace_all(&step1, "");
    
    let re_dash = Regex::new(r"-+").unwrap();
    let step3 = re_dash.replace_all(&step2, "-");
    
    step3.trim_matches('-').to_string()
}

#[derive(Debug)]
enum SpecType {
    None,
    Line(usize),
    Anchor(String),
    Range(usize, Option<usize>),
}

fn parse_include_spec(file_spec: &str) -> (String, SpecType) {
    let parts: Vec<&str> = file_spec.trim().split(':').collect();
    let file_path = parts[0].to_string();
    
    if parts.len() == 1 {
        (file_path, SpecType::None)
    } else if parts.len() == 2 {
        let second = parts[1];
        if let Ok(line_num) = second.parse::<usize>() {
            (file_path, SpecType::Line(line_num))
        } else {
            (file_path, SpecType::Anchor(second.to_string()))
        }
    } else if parts.len() == 3 {
        let start_str = parts[1];
        let end_str = parts[2];
        let start_line = start_str.parse::<usize>().unwrap_or(1);
        let end_line = end_str.parse::<usize>().ok();
        (file_path, SpecType::Range(start_line, end_line))
    } else {
        (file_path, SpecType::None)
    }
}

fn resolve_includes(content: &str, current_file_path: &Path) -> String {
    let re = Regex::new(r"\{\{\s*(#include|#rustdoc_include)\s+(.+?)\s*\}\}").unwrap();
    
    let result = re.replace_all(content, |caps: &Captures| {
        let include_type = caps.get(1).unwrap().as_str();
        let file_spec = caps.get(2).unwrap().as_str().trim();
        
        let (file_path_str, spec) = parse_include_spec(file_spec);
        let current_dir = current_file_path.parent().unwrap_or_else(|| Path::new("."));
        let included_abs_path = current_dir.join(&file_path_str);
        
        if !included_abs_path.exists() {
            eprintln!("警告：引入文件不存在 {:?} (在 {:?} 中引用)", included_abs_path, current_file_path);
            return format!("<!-- 缺失引入文件 {} -->", file_spec);
        }
        
        let included_content = match std::fs::read_to_string(&included_abs_path) {
            Ok(c) => c,
            Err(e) => {
                eprintln!("读取文件失败 {:?}: {}", included_abs_path, e);
                return format!("<!-- 读取文件失败 {} -->", file_spec);
            }
        };
        
        let lines: Vec<&str> = included_content.lines().collect();
        let mut extracted_lines = Vec::new();
        
        match spec {
            SpecType::None => {
                extracted_lines = lines;
            }
            SpecType::Anchor(anchor_name) => {
                let start_pat = Regex::new(&format!(r"(?://|#)\s*ANCHOR:\s*{}\b", regex::escape(&anchor_name))).unwrap();
                let end_pat = Regex::new(&format!(r"(?://|#)\s*ANCHOR_END:\s*{}\b", regex::escape(&anchor_name))).unwrap();
                
                let mut in_anchor = false;
                for line in lines {
                    if start_pat.is_match(line) {
                        in_anchor = true;
                        continue;
                    } else if end_pat.is_match(line) {
                        in_anchor = false;
                        continue;
                    }
                    if in_anchor {
                        extracted_lines.push(line);
                    }
                }
            }
            SpecType::Line(line_num) => {
                if line_num >= 1 && line_num <= lines.len() {
                    extracted_lines.push(lines[line_num - 1]);
                }
            }
            SpecType::Range(start_line, end_line) => {
                let total = lines.len();
                let start_idx = start_line.saturating_sub(1);
                let end_idx = match end_line {
                    Some(e) => std::cmp::min(total, e),
                    None => total,
                };
                if start_idx < end_idx {
                    extracted_lines.extend_from_slice(&lines[start_idx..end_idx]);
                }
            }
        }
        
        let anchor_pat = Regex::new(r"(?://|#)\s*ANCHOR(_END)?\s*:\s*[\w\-]+").unwrap();
        let mut clean_lines = Vec::new();
        
        for line in extracted_lines {
            if anchor_pat.is_match(line) {
                continue;
            }
            
            let mut output_line = line.to_string();
            
            if include_type == "#rustdoc_include" && (file_path_str.ends_with(".rs") || included_abs_path.extension().map_or(false, |ext| ext == "rs")) {
                let stripped = line.trim();
                if stripped == "#" || stripped.starts_with("# ") {
                    continue;
                }
                if line.starts_with("## ") {
                    output_line = line[1..].to_string();
                }
            }
            
            clean_lines.push(output_line);
        }
        
        let mut joined = clean_lines.join("\n");
        if included_content.ends_with('\n') {
            joined.push('\n');
        }
        joined
    });
    
    result.into_owned()
}

fn main() {
    reload_path();
    
    let summary_path = Path::new("src").join("SUMMARY.md");
    if !summary_path.exists() {
        eprintln!("错误：未找到 src/SUMMARY.md，请在项目根目录下运行此程序。");
        std::process::exit(1);
    }
    
    let summary_content = std::fs::read_to_string(&summary_path).expect("读取 SUMMARY.md 失败");
    let link_pattern = Regex::new(r"\[.*?\]\(((?:[^)]+?)\.md)\)").unwrap();
    let mut file_list = Vec::new();
    
    for line in summary_content.lines() {
        if let Some(caps) = link_pattern.captures(line) {
            file_list.push(caps.get(1).unwrap().as_str().to_string());
        }
    }
    
    println!("成功解析 SUMMARY.md，共找到 {} 个章节文件。", file_list.len());
    
    let mut file_id_map = HashMap::new();
    for file_path_str in &file_list {
        let path = Path::new(file_path_str);
        if let Some(filename_os) = path.file_name() {
            let filename = filename_os.to_string_lossy().into_owned();
            let file_id = path.file_stem().map_or("".to_string(), |s| s.to_string_lossy().into_owned());
            file_id_map.insert(filename, file_id);
        }
    }
    
    let mut merged_lines = Vec::new();
    let lang_re = Regex::new(r"^(\s*`{3,4})\s*([a-zA-Z0-9_\-]+)(?:[, \t].*)?$").unwrap();
    let header_re = Regex::new(r"^(#+)\s+(.+)$").unwrap();
    let header_id_cleanup_re = Regex::new(r"\s*\{#.*?\}\s*$").unwrap();
    let link_re = Regex::new(r"(!)?\[([^\]]+)\]\(([^)]+)\)").unwrap();
    
    for file_path_str in &file_list {
        let full_path = Path::new("src").join(file_path_str);
        if !full_path.exists() {
            eprintln!("警告：文件 {:?} 不存在，已跳过。", full_path);
            continue;
        }
        
        let content = std::fs::read_to_string(&full_path).unwrap_or_else(|_| panic!("读取文件失败：{:?}", full_path));
        let content_resolved = resolve_includes(&content, &full_path);
        
        let filename = Path::new(file_path_str).file_name().unwrap().to_string_lossy().into_owned();
        let file_id = file_id_map.get(&filename).expect("找不到对应的 file_id").clone();
        
        let mut new_lines = Vec::new();
        let mut first_header = true;
        let mut inside_code_block = false;
        
        for line in content_resolved.lines() {
            let mut processed_line = line.to_string();
            
            if line.trim().starts_with("```") {
                inside_code_block = !inside_code_block;
                
                if inside_code_block {
                    if let Some(caps) = lang_re.captures(line) {
                        let backticks = caps.get(1).unwrap().as_str();
                        let lang = caps.get(2).unwrap().as_str();
                        processed_line = format!("{}{}", backticks, lang);
                    }
                }
                new_lines.push(processed_line);
                continue;
            }
            
            if !inside_code_block && line.starts_with('#') {
                if let Some(caps) = header_re.captures(line) {
                    let level = caps.get(1).unwrap().as_str();
                    let header_text = caps.get(2).unwrap().as_str();
                    
                    let header_text_clean = header_id_cleanup_re.replace(header_text, "").trim().to_string();
                    let slug = slugify(&header_text_clean);
                    
                    let header_id = if first_header {
                        first_header = false;
                        file_id.clone()
                    } else {
                        format!("{}-{}", file_id, slug)
                    };
                    
                    processed_line = format!("{} {} {{#{}}}", level, header_text_clean, header_id);
                }
            }
            
            new_lines.push(processed_line);
        }
        
        let content_with_ids = new_lines.join("\n");
        
        let final_content = link_re.replace_all(&content_with_ids, |caps: &Captures| {
            if caps.get(1).is_some() {
                return caps.get(0).unwrap().as_str().to_string();
            }
            
            let text = caps.get(2).unwrap().as_str();
            let url = caps.get(3).unwrap().as_str();
            
            if url.starts_with("http://") || url.starts_with("https://") || url.starts_with("mailto:") || url.starts_with("ftp:") {
                return caps.get(0).unwrap().as_str().to_string();
            }
            
            let parts: Vec<&str> = url.split('#').collect();
            let path = parts[0];
            let fragment = if parts.len() > 1 { parts[1] } else { "" };
            
            let target_filename = Path::new(path).file_name().map_or("", |s| s.to_str().unwrap_or(""));
            if target_filename.ends_with(".md") {
                if let Some(target_file_id) = file_id_map.get(target_filename) {
                    if !fragment.is_empty() {
                        let new_fragment = format!("{}-{}", target_file_id, slugify(fragment));
                        return format!("[{}](#{})", text, new_fragment);
                    } else {
                        return format!("[{}](#{})", text, target_file_id);
                    }
                }
            }
            
            caps.get(0).unwrap().as_str().to_string()
        });
        
        merged_lines.push(final_content.into_owned());
        merged_lines.push("\n\n---\n\n".to_string());
    }
    
    let temp_merged_path = "temp_merged.md";
    let output_epub = "rust_programming_language.epub";
    
    if let Err(e) = std::fs::write(temp_merged_path, merged_lines.join("")) {
        eprintln!("写入临时文件失败：{}", e);
        std::process::exit(1);
    }
    println!("已生成合并后的临时 Markdown 文件。");
    
    println!("正在调用 Pandoc 编译 EPUB...");
    let status = std::process::Command::new("pandoc")
        .args(&[
            temp_merged_path,
            "-f", "markdown-tex_math_dollars",
            "-o", output_epub,
            "--toc",
            "--resource-path=src",
            "--split-level=1",
            "--syntax-highlighting=pygments",
            "--css=epub.css",
            "--metadata", "title=Rust 程序设计语言（简体中文版）",
            "--metadata", "author=KaiserY & Rust 团队",
            "--metadata", "lang=zh-CN"
        ])
        .status();
        
    match status {
        Ok(s) if s.success() => {
            println!("恭喜！编译成功，生成文件：{}", output_epub);
        }
        Ok(s) => {
            eprintln!("编译失败：pandoc 退出状态为 {}", s);
        }
        Err(e) => {
            if e.kind() == std::io::ErrorKind::NotFound {
                eprintln!("错误：系统未检测到 'pandoc' 命令，请确认 Pandoc 已正确安装并加入系统环境变量 PATH。");
            } else {
                eprintln!("编译失败：{}", e);
            }
        }
    }
    
    if Path::new(temp_merged_path).exists() {
        let _ = std::fs::remove_file(temp_merged_path);
    }
}
