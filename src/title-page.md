# Rust 程序设计语言

> [title-page.md](https://github.com/rust-lang/book/blob/master/src/title-page.md)
> <br>
> commit 636685fd35ca04a98fa73312d92eb2a46987ac96

**Steve Klabnik 和 Carol Nichols，以及来自 Rust 社区的贡献（Rust 中文社区翻译）**

本书假设你使用 Rust 1.37.0 或更新的版本，且在所有的项目中的 *Cargo.toml* 文件中通过 `edition="2018"` 采用 Rust 2018 Edition 规范。请查看 [第一章的 “安装” 部分][install] 了解如何安装和升级 Rust，并查看新的 [附录 E][editions] 了解版本相关的信息。

Rust 程序设计语言的 2018 Edition 包含许多的改进使得 Rust 更为工程化并更为容易学习。本书的此次迭代包括了很多反映这些改进的修改：

- 第七章 “使用包、Crate 和模块管理不断增长的项目” 基本上被重写了。模块系统和路径（path）的工作方式变得更为一致。
- 第十章新增了名为 “trait 作为参数” 和 “返回实现了 trait 的类型” 部分来解释新的 `impl Trait` 语法。
- 第十一章新增了一个名为 “在测试中使用 `Result<T, E>`” 的部分来展示如何使用 `?` 运算符来编写测试
- 第十九章的 “高级生命周期” 部分被移除了，因为编译器的改进使得其内容变得更为少见。
- 之前的附录 D “宏” 得到了补充，包括了过程宏并移动到了第十九章的 “宏” 部分。
- 附录 A “关键字” 也介绍了新的原始标识符（raw identifiers）功能，这使得采用 2015 Edition 编写的 Rust 代码可以与 2018 Edition 互通。
- 现在的附录 D 名为 “实用开发工具”，它介绍了最近发布的可以帮助你编写 Rust 代码的工具。
- 我们还修复了全书中许多错误和不准确的描述。感谢报告了这些问题的读者们！

注意任何 “Rust 程序设计语言” 早期迭代中的代码在项目的 *Cargo.toml* 中不包含 `edition="2018"` 时仍可以继续编译，哪怕你更新了 Rust 编译器的版本。Rust 的后向兼容性保证了这一切可以正常运行！

本书的 HTML 版本可以在 [https://doc.rust-lang.org/stable/book/](https://doc.rust-lang.org/stable/book/) （[简体中文译本](https://kaisery.github.io/trpl-zh-cn/)）在线阅读，离线版则包含在通过 `rustup` 安装的 Rust 中；运行 `rustup docs --book` 可以打开。

本书的 [纸质版和电子书由 No Starch Press][nsprust] 发行。

[install]: ch01-01-installation.html
[editions]: appendix-05-editions.html
[nsprust]: https://nostarch.com/rust