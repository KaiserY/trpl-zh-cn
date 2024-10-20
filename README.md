# Rust 程序设计语言（2021 edition）简体中文版

![Build Status](https://github.com/KaiserY/trpl-zh-cn/workflows/CI/badge.svg)

## 状态

- 新增 ch17 async & await 施工中

PS:

* 对照源码位置：[https://github.com/rust-lang/book/tree/main/src][source]
* 每章翻译开头都带有官方链接和 commit hash，若发现与官方不一致，欢迎 Issue 或 PR :)

[source]: https://github.com/rust-lang/book/tree/main/src

## 校对

部分翻译采用 ChatGPT 4o 进行翻译校对。提示词详见 [proofreading_prompt.md](proofreading_prompt.md)

## 静态页面构建与文档撰写

### 构建

你可以将本 mdbook 构建成一系列静态 html 页面。这里我们采用 [mdbook](https://rust-lang.github.io/mdBook/index.html) 打包出静态网页。在这之前，你需要安装 [Rust](https://www.rust-lang.org/zh-CN/)。

全局安装 mdbook

``` bash
cargo install mdbook
```

cd 到项目目录，然后开始构建。构建好的静态文档会出现在 "./book/html" 中

```bash
mdbook build
```

### 文档撰写

可以通过任意的 http 服务器来预览构建的文档。举个例子：

```bash
cargo install simple-http-server
simple-http-server .\book\html\ -i
```

## 社区资源

- Rust 语言中文社区：<https://rust.cc/>
- Rust 中文 Wiki：<https://wiki.rust-china.org/>
- Rust 编程语言社区 1 群，群号：303838735（已满，只能内部邀请）
- Rust 编程语言社区 2 群，群号：813448660
- Rust 水群 (编程社区子群)，电报群：[t.me/rust_deep_water](//t.me/rust_deep_water)

## PDF

[Rust 程序设计语言 简体中文版.pdf](https://kaisery.github.io/trpl-zh-cn/Rust%20%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%E8%AF%AD%E8%A8%80%20%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%E7%89%88.pdf)

- 由 [mdbook-typst-pdf](https://github.com/KaiserY/mdbook-typst-pdf) 生成，有任何问题欢迎 issue 或 PR

## GitBook

本翻译主要采用 [mdBook](https://github.com/rust-lang-nursery/mdBook) 格式。同时支持 [GitBook](https://github.com/GitbookIO/gitbook)，但会缺失部分功能，如一些代码没有语法高亮。

本翻译加速查看站点有：
 - 深圳站点：<http://120.78.128.153/rustbook>

[GitBook.com](https://www.gitbook.com/) 地址：<https://kaisery.github.io/trpl-zh-cn/>
