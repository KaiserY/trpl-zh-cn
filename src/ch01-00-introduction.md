# 介绍

> [ch01-00-introduction.md](https://github.com/rust-lang/book/blob/master/src/ch01-00-introduction.md)
> <br>
> commit c51c14215d2ee2cb481bc8a942a3769c6d9a2e1a

欢迎阅读“Rust 程序设计语言”，一本关于 Rust 的介绍性书籍。Rust 是一个着用于安全、速度和并发的编程语言。它的设计不仅可以使程序获得性能和对底层语言的控制，并且能够享受高级语言强大的抽象能力。这些特性使得 Rust 适合那些有类似 C 语言经验并正在寻找一个更安全的替代者的程序员，同时也适合那些来自类似 Python 语言背景，正在探索在不牺牲表现力的情况下编写更好性能代码的人们。

Rust 在编译时进行其绝大多数的安全检查和内存管理决策，因此程序的运行时性能没有受到影响。这让其在许多其他语言不擅长的应用场景中得以大显身手：有可预测空间和时间要求的程序，嵌入到其他语言中，以及编写底层代码，如设备驱动和操作系统。Rust 也很擅长 web 程序：它驱动着 Rust 包注册网站（package
registry site），[crates.io]！我们期待看到**你**使用 Rust 进行创作。

[crates.io]: https://crates.io/

本书是为已经至少了解一门编程语言的读者而写的。读完本书之后，你应该能自如的编写 Rust 程序。我们将通过小而集中并相互依赖的例子来学习 Rust，并向你展示如何使用 Rust 多样的功能，同时了解它们在后台是如何执行的。

## 为本书做出贡献

本书是开源的。如果你发现任何错误，请不要犹豫，[在 GitHub 上][on GitHub]发起 issue 或提交 pull request。

[on GitHub]: https://github.com/rust-lang/book