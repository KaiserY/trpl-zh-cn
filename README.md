# Rust 程序设计语言（2018版） 简体中文版

[![Build Status](https://travis-ci.org/Turing-Chu/trpl-zh-cn.svg?branch=turing)](https://travis-ci.org/Turing-Chu/trpl-zh-cn)

本仓库包含了“Rust 程序设计语言（简体中文版）”第二版和2018版，并以2018版为主，同时同步更新第二版

## 本地编译构建

```rust
# 如果已经安装过mdbook请跳过
cargo install mdbook

cd 2018-edition && mdbook build
```
编译之后会生成 `book` 目录，请进入book目录并使用浏览器打开 `index.html` 文件查看。

## 状态

持续翻译中，由于[原书](https://github.com/rust-lang/book)一直在更新，因此本书稍微落后于原书。原书有第一版、第二版和2018版，并以2018版为最新，本书基于[KaiserY/trpl-zh-cn](https://github.com/KaiserY/trpl-zh-cn)翻译，请尊重原书作者成果。

每章翻译开头都带有官方链接和 commit hash，若发现与官方不一致，欢迎 Issue 或 PR :)


## mdBook

本翻译主要采用 [mdBook](https://github.com/rust-lang-nursery/mdBook) 格式。同时支持 [GitBook](https://github.com/GitbookIO/gitbook)，但会缺失部分功能，如一些代码没有语法高亮。

[GitBook.com](https://www.gitbook.com/) 地址：[https://www.gitbook.com/book/kaisery/trpl-zh-cn/details](https://www.gitbook.com/book/kaisery/trpl-zh-cn/details)
