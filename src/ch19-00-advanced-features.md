# 高级特征

> [ch19-00-advanced-features.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-00-advanced-features.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

我们已经走得很远了！现在我们已经学习了 99% 的编写 Rust 时需要了解的内容。在第二十章开始的新项目之前，让我们聊聊你可能会遇到的最后 1% 的内容。你可以随意跳过本章并在遇到这些问题时再回过头来；这里将要学习的特征在某些非常特定的情况下非常有用。我们并不想我们不想舍弃这些特性，但你会发现不会经常用到他们。

本章将覆盖如下内容：

* 不安全 Rust：用于当需要舍弃 Rust 的某些保证并告诉编译器你将会负责维持这些保证
* 高级生命周期：用于负责情形的额外的生命周期语法
* 高级 trait：与 trait 相关的关联类型，默认类型参数，完全限定语法（fully qualified syntax），超（父）trait（supertraits）和 newtype 模式
* 高级类型：关于 newtype 模式的更多内容，类型别名，“never” 类型和动态大小类型
* 高级函数和闭包：函数指针和返回闭包

对所有人而言，这都是一个介绍 Rust 迷人特性的宝典！让我们翻开它吧！