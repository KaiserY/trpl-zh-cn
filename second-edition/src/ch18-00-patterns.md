# 模式用来匹配值的结构

> [ch18-00-patterns.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch18-00-patterns.md)
> <br>
> commit 928790637fb32026643c855915b4b2fd9d5abff3

模式是 Rust 中特殊的语法，它用来匹配类型中的结构，无论类型是简单还是复杂。结合使用模式和 `match` 表达式以及其他结构可以提供更多对程序控制流的支配权。模式由如下一些内容组合而成：

- 字面量
- 解构的数组、枚举、结构体或者元组
- 变量
- 通配符
- 占位符

这些部分描述了我们要处理的数据的形状，接着可以用其匹配值来决定程序是否拥有正确的数据来运行特定部分的代码。

<!-- I think we need a concise description of what we use patterns for here,
what they provide the programmer. Hopefully you can see what I've trying to do,
above! But I think you'll agree it's not quite right, can you have a whack, try
to give the reader that explanation? -->
<!-- We tweaked the wording a bit, how's this? /Carol -->

我们通过将一些值与模式相比较来使用它。如果模式匹配这些值，我们对值部分进行相应处理。回忆一下第六章讨论 `match` 表达式时像硬币分类器那样使用模式。如果数据符合这个形状，就可以使用这些命名的片段。如果不符合，与该模式相关的代码则不会运行。

本章是所有模式相关内容的参考。我们将涉及到使用模式的有效位置，*refutable* 与 *irrefutable* 模式的区别，和你可能会见到的不同类型的模式语法。在最后，你将会看到如何使用模式创建强大而简洁的代码。
