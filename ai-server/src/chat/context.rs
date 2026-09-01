use crate::book::search::SearchResult;

pub fn build_rag_context(chunks: &[SearchResult]) -> String {
    if chunks.is_empty() {
        return "没有检索到相关的教材内容。".to_string();
    }

    let mut context = String::from("以下是《Rust 程序设计语言》中相关的章节内容片段，供回答时参考。回答时请优先依据这些官方教材内容：\n\n");
    
    for (i, chunk) in chunks.iter().enumerate() {
        let path_url = chunk.node_path.as_deref().unwrap_or("unknown.md");
        let heading = chunk.heading_path.join(" > ");
        
        context.push_str(&format!(
            "### [参考片段 {}] 章节: {} (文件: {})\n标题路径: {}\n行号范围: L{} - L{}\n\n{}\n\n",
            i + 1,
            chunk.node_title,
            path_url,
            heading,
            chunk.start_line.unwrap_or(1),
            chunk.end_line.unwrap_or(1),
            chunk.content
        ));
    }
    
    context
}
