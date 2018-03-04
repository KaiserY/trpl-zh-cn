# 高级特征

> [ch19-00-advanced-features.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-00-advanced-features.md)
> <br>
> commit 9f03d42e2f47871fe813496b9324548ef4457862

我们已经走得很远了！现在我们已经学习了 99% 的编写 Rust 时需要了解的内容。在第二十章开始另一个新项目之前，让我们聊聊你可能会遇到的最后 1% 的内容。当你不经意间遇到未知的内容时请随意将本章作为参考；这里将要学习的特征在某些非常特定的情况下很有用处。我们并不希望忽略这些特性，但是你会发现很少会碰到它们。

本章将涉及如下内容：

* 不安全 Rust：用于当需要舍弃 Rust 的某些保证并由你自己负责维持这些保证
* 高级生命周期：用于复杂生命周期情况的语法
* 高级 trait：与 trait 相关的关联类型，默认类型参数，完全限定语法（fully qualified syntax），超（父）trait（supertraits）和 newtype 模式
* 高级类型：关于 newtype 模式的更多内容，类型别名，“never” 类型和动态大小类型
* 高级函数和闭包：函数指针和返回闭包

对所有人而言，这都是一个介绍 Rust 迷人特性的宝典！让我们翻开它吧！