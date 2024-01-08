# 常见编程概念

> [ch03-00-common-programming-concepts.md](https://github.com/rust-lang/book/blob/main/src/ch03-00-common-programming-concepts.md)
> <br>
> commit d0acb2595c891de97a133d06635c50ab449dd65c

本章介绍一些几乎所有编程语言都有的概念，以及它们在 Rust 中是如何工作的。很多编程语言的核心概念都是共通的，本章中展示的概念都不是 Rust 所特有的，不过我们会在 Rust 上下文中讨论它们，并解释使用这些概念的惯例。

具体来说，我们将会学习变量、基本类型、函数、注释和控制流。每一个 Rust 程序中都会用到这些基础知识，提早学习这些概念会让你在起步时就打下坚实的基础。

> ## 关键字
> Rust 语言有一组保留的 **关键字**（*keywords*），就像大部分语言一样，它们只能由语言本身使用。记住，你不能使用这些关键字作为变量或函数的名称。大部分关键字有特殊的意义，你将在 Rust 程序中使用它们完成各种任务；一些关键字目前没有相应的功能，是为将来可能添加的功能保留的。可以在[附录 A][appendix_a]<!-- ignore --> 中找到关键字的列表。

[appendix_a]: appendix-01-keywords.html
