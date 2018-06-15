# 常见编程概念

> [ch03-00-common-programming-concepts.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch03-00-common-programming-concepts.md)
> <br>
> commit 04aa3a45eb72855b34213703718f50a12a3eeec8

本章涉及一些几乎所有编程语言都有的概念，以及它们在 Rust 中是如何工作的。很多编程语言的核心概念都是共通的，本章中展示的概念都不是 Rust 所特有的，不过我们会在 Rust 环境中讨论它们，解释它们的使用习惯。

具体地，我们将会学习变量，基本类型，函数，注释和控制流。这些基础知识将会出现在每一个 Rust 程序中，提早学习这些概念会为你奠定坚实的起步基础。

> ### 关键字
>
> Rust 语言有一系列保留的 **关键字**（*keywords*），就像大部分语言一样，它们只能由语言本身使用，你不能使用这些关键字作为变量或函数的名称。大部分关键字有特殊的意义，并被用来完成 Rust 程序中的各种任务；一些关键字目前没有相应的功能，是为将来可能添加的功能保留的。可以在附录 A 中找到关键字的列表。
