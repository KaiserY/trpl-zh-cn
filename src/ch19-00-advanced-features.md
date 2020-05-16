# 高级特征

> [ch19-00-advanced-features.md](https://github.com/rust-lang/book/blob/master/src/ch19-00-advanced-features.md)
> <br>
> commit 10f89936b02dc366a2d0b34083b97cadda9e0ce4

现在我们已经学习了 Rust 编程语言中最常用的部分。在第二十章开始另一个新项目之前，让我们聊聊一些总有一天你会遇上的部分内容。你可以将本章作为不经意间遇到未知的内容时的参考。本章将要学习的功能在一些非常特定的场景下很有用处。虽然很少会碰到它们，我们希望确保你了解 Rust 提供的所有功能。

本章将涉及如下内容：

* 不安全 Rust：用于当需要舍弃 Rust 的某些保证并负责手动维持这些保证
* 高级 trait：与 trait 相关的关联类型，默认类型参数，完全限定语法（fully qualified syntax），超（父）trait（supertraits）和 newtype 模式
* 高级类型：关于 newtype 模式的更多内容，类型别名，never 类型和动态大小类型
* 高级函数和闭包：函数指针和返回闭包
* 宏：定义在编译时定义更多代码的方式

对所有人而言，这都是一个介绍 Rust 迷人特性的宝典！让我们翻开它吧！
