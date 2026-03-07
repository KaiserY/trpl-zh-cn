# 一个 I/O 项目：构建一个命令行程序

[ch12-00-an-io-project.md](https://github.com/rust-lang/book/blob/d7c0e477a22bcb37fdb290c6046058565d6738c2/src/ch12-00-an-io-project.md)

本章既是对目前所学诸多技能的一次回顾，也会进一步探索一些标准库功能。我们将构建一个与文件和命令行输入/输出交互的命令行工具，借此练习一些你现在已经掌握的 Rust 概念。

Rust 的运行速度、安全性、单二进制文件输出和跨平台支持使其成为创建命令行程序的理想语言，所以我们的项目将创建一个我们自己版本的经典命令行搜索工具：`grep`。grep 是 “**G**lobally search a **R**egular **E**xpression and **P**rint.” 的首字母缩写。`grep` 最简单的使用场景是在特定文件中搜索指定字符串。为此，`grep` 获取一个文件路径和一个字符串作为参数，接着读取文件并找到其中包含字符串参数的行，然后打印出这些行。

在这个过程中，我们还会展示如何让命令行工具使用许多其他命令行工具都会用到的终端特性。我们会读取环境变量的值，让用户能够配置工具的行为；也会将错误信息打印到标准错误流（`stderr`）而不是标准输出（`stdout`），这样一来，例如用户就可以把成功输出重定向到文件，同时仍然在屏幕上看到错误信息。

一位 Rust 社区的成员，Andrew Gallant，已经创建了一个功能完整且非常快速的 `grep` 版本，名为 `ripgrep`。相比之下，我们的版本将非常简单，本章将教会你一些帮助理解像 `ripgrep` 这样真实项目的背景知识。

我们的 `grep` 项目将会结合之前所学的一些概念：

- 代码组织（[第七章][ch7]）
- vector 和字符串（[第八章][ch8]）
- 错误处理（[第九章][ch9]）
- 合理地使用 trait 和生命周期（[第十章][ch10]）
- 编写测试（[第十一章][ch11]）

另外还会简要地讲到闭包、迭代器和 trait 对象，它们分别会在[第十三章][ch13]和[第十八章][ch18]中详细介绍。

[ch7]: ch07-00-managing-growing-projects-with-packages-crates-and-modules.html
[ch8]: ch08-00-common-collections.html
[ch9]: ch09-00-error-handling.html
[ch10]: ch10-00-generics.html
[ch11]: ch11-00-testing.html
[ch13]: ch13-00-functional-features.html
[ch18]: ch18-00-oop.html
