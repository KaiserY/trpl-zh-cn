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

## Ferris

网页右侧包含一个可折叠的 Ferris 学习助手面板。它可以读取当前教材页面作为上下文，并通过本地代理服务调用 DeepSeek。API Key 仅由本地 Rust 服务读取，不会发送到浏览器。

复制环境变量示例并填写 DeepSeek API Key：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
DEEPSEEK_API_KEY=你的真实密钥
```

分别启动教材和 AI 服务：

```bash
mdbook serve
```

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
