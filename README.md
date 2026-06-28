# Rust 程序设计语言（2024 edition）简体中文版

![Build Status](https://github.com/KaiserY/trpl-zh-cn/workflows/CI/badge.svg)

## 状态

- 2024 edtion 施工完毕。

PS:

- 对照源码位置：[https://github.com/rust-lang/book/tree/main/src][source]
- 注意源码 `src` 目录一般会比 [https://doc.rust-lang.org/book/](https://doc.rust-lang.org/book/) 要新，如果遇到冲突建议对照 `src` 目录。
- 每章翻译开头都带有官方链接和 commit hash 的注释，若发现与官方不一致，欢迎 Issue 或 PR

[source]: https://github.com/rust-lang/book/tree/main/src

## 校对

部分章节采用 Codex 辅助校对。提示词可参考 [proofreading_prompt.md](proofreading_prompt.md)

## 静态页面构建与文档撰写

### 构建

你可以将本 mdbook 构建成一系列静态 html 页面。这里我们采用 [mdbook](https://rust-lang.github.io/mdBook/index.html) 打包出静态网页。在这之前，你需要安装 [Rust](https://www.rust-lang.org/zh-CN/)。

全局安装 mdbook

```bash
cargo install mdbook
```

cd 到项目目录，然后开始构建。构建好的静态文档会出现在 "./book/html" 中

```bash
mdbook build
```

在本地部署 HTTP 服务器以阅读文档：

```bash
mdbook serve
```

## Ferris AI 学习助手 (全新升级)

网页右侧包含一个可折叠、可自适应调整宽度的 **Ferris AI 学习助手** 面板。通过全新的 RAG（检索增强生成）架构、PostgreSQL 数据库持久化以及智能查询路由检索，为读者提供更加智能、专业的互动式学习支持。

### 🌟 新增功能与特性

1. **智能 RAG 检索增强**：
   - **文档自动解析与分块 (Markdown Chunker)**：自动解析 `SUMMARY.md` 目录结构，并将每章的 Markdown 文件细化拆分为 Section 级别的块 (Document Chunks)，并记录层级标题路径与行号。
   - **混合检索 (Hybrid Search)**：结合 `pgvector` 向量相似度搜索（Cosine Similarity）与 PostgreSQL `pg_trgm` 中英文三元组文本模糊匹配检索，保障检索的精准度和召回率。
   - **智能查询路由 (Query Routing)**：根据提问内容自动分发到最优的检索策略：
     - `NoBook`：通用 Rust 问题，直接调用大模型，不带教材上下文。
     - `CurrentPage`：针对当前阅读页面上下文提问。
     - `SearchKnownChapter`：精准提取并定位到特定章节内容进行深入搜索。
     - `SearchTableOfContents`：先匹配目录树（TOC），再在相关章节中进行局部检索。
   - **引用出处追踪**：AI 回答中会自动附带并展示相关的引用章节链接，点击可直接跳转阅读。

2. **多会话持久化与管理**：
   - 后端使用 PostgreSQL 进行完整的对话会话 (`conversations`) 与历史消息 (`messages`) 存储。
   - 支持新建对话、历史会话切换、基于 SSE (Server-Sent Events) 的打字机式流式消息响应、异常断网重连与状态同步。

3. **前端交互与精致设计**：
   - **侧边栏拖拽调宽**：支持拖拽侧边栏边缘自由调整面板宽度（320px - 560px），自适应大屏阅读。
   - **多模态上下文选择**：下拉菜单支持切换“当前页面”（针对单页精读）、“教材学习”（全书 RAG 检索）、“通用 Rust”（纯模型对话）三种模式。
   - **状态感知**：前端智能检测本地 Rust 服务状态，动态展示连接情况。

---

### 🛠️ 快速启动 AI 服务

AI 服务基于 Rust + Axum 开发，数据存储采用 PostgreSQL (带 pgvector 插件)。

#### 1. 运行数据库

使用 Docker 运行带 `pgvector` 插件的 PostgreSQL：

```bash
docker compose -f ai-server/docker-compose.yml up -d
```

#### 2. 配置环境变量

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑生成的 `.env` 文件，填入你的 API 密钥：

```env
# 核心大模型配置 (支持 DeepSeek 或兼容接口)
DEEPSEEK_API_KEY=你的真实密钥
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 向量嵌入大模型配置 (可选，默认使用 OpenAI text-embedding-3-small)
# EMBEDDING_API_KEY=你的 OpenAI 兼容密钥 (若留空则复用 DEEPSEEK_API_KEY)
# EMBEDDING_BASE_URL=https://api.openai.com/v1
# EMBEDDING_MODEL=text-embedding-3-small

# 数据库连接 (若使用 Docker 默认配置则无需修改)
DATABASE_URL=postgres://postgres:password@127.0.0.1:5432/rust_book_ai
AI_ALLOWED_ORIGIN=http://localhost:3000
```

#### 3. 编译并构建书籍索引 (初次运行必做)

运行索引生成工具，解析本地教材并将其向量化存入数据库：

```bash
cargo run --bin index_book
```

*提示：运行后，索引工具会自动运行 SQL 迁移，建表并开启 GIN 三元组索引。*

#### 4. 分别启动教材和 AI 服务

在不同的终端窗口中启动：

**启动静态教材服务**：
```bash
mdbook serve
```

**启动 AI 服务**：
```bash
cargo run --manifest-path ai-server/Cargo.toml
```

然后访问 <http://localhost:3000>。AI 服务默认监听 `127.0.0.1:8787`。

`.env` 已加入 `.gitignore`，不要将真实密钥写入 `.env.example` 或前端 JavaScript。

## 社区资源

- Rust 语言中文社区：<https://rustcc.cn/>
- Rust 编程语言社区 1 群，群号：303838735（已满，只能内部邀请）
- Rust 编程语言社区 2 群，群号：813448660

## PDF

[Rust 程序设计语言 简体中文版.pdf](https://kaisery.github.io/trpl-zh-cn/Rust%20%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%E8%AF%AD%E8%A8%80%20%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E7%89%88.pdf)

- 由 [mdbook-typst-pdf](https://github.com/KaiserY/mdbook-typst-pdf) 生成，有任何问题欢迎 issue 或 PR

## EPUB

你可以使用项目中提供的 Rust 构建工具将本书编译为 EPUB 电子书。

在此之前，请确保您的系统已安装了 [Pandoc](https://pandoc.org/)。

在项目根目录下，运行以下命令开始编译：

```bash
cargo run --release --manifest-path epub-builder/Cargo.toml
```

编译成功后，会在根目录下生成 `rust_programming_language.epub`。

## GitBook

本翻译主要采用 [mdBook](https://github.com/rust-lang-nursery/mdBook) 格式。同时支持 [GitBook](https://github.com/GitbookIO/gitbook)，但会缺失部分功能，如一些代码没有语法高亮。

本翻译加速查看站点有：

- 深圳站点：<http://120.78.128.153/rustbook>

[GitBook.com](https://www.gitbook.com/) 地址：<https://kaisery.github.io/trpl-zh-cn/>
