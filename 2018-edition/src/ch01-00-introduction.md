# 介绍

> [ch01-00-introduction.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-00-introduction.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

欢迎阅读 “Rust 程序设计语言”，一本介绍 Rust 的书。Rust 是一门着眼于安全、速度和并发的编程语言。其程序设计兼顾底层语言的性能与控制，并不失高级语言强大的抽象能力。其特性适合那些有类 C 语言经验，正在寻找更安全的替代品的开发者；同样适合有着类 Python 语言背景，寻求在不牺牲表现力的前提下，编写更高性能代码的开发者。

Rust 编译时执行绝大部分的安全检查和内存管理决策，对运行时性能的影响微不足道。这使其在其他语言不擅长的应用场景中得以大显身手：可预测时间和空间需求的程序，嵌入到其他语言中，以及编写如设备驱动和操作系统这样的底层代码。Rust 也很擅长 web 程序：它驱动着 Rust 包登记网站（package
registry site），[crates.io]！我们由衷期待**你**使用 Rust 进行创作。

[crates.io]: https://crates.io/

本书的目标读者至少应了解一门其它编程语言。阅读本书之后，你应该能自如的编写 Rust 程序。我们将通过短小精干、前后呼应的例子来学习 Rust，并展示其多样功能的使用方法，同时了解它们幕后如何运行。

## 为本书做出贡献

本书是开源的。如果你发现任何错误，不要犹豫，[在 GitHub 上][on GitHub]发起 issue 或提交 pull request。请查看 [CONTRIBUTING.md] 获取更多信息。

[on GitHub]: https://github.com/rust-lang/book
[CONTRIBUTING.md]: https://github.com/rust-lang/book/blob/master/CONTRIBUTING.md

> 译者注：本译本的 [GitHub 仓库][trpl-zh-cn]，同样欢迎 Issue 和 PR :)

[trpl-zh-cn]: https://github.com/KaiserY/trpl-zh-cn
