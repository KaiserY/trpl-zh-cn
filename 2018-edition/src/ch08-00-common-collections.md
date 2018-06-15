# 通用集合类型

> [ch08-00-common-collections.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch08-00-common-collections.md)
> <br>
> commit 54e81980185fbb1a4cb5a18dce1dc6deeb66b573

Rust 标准库中包含一系列被称为 **集合**（*collections*）的非常有用的数据结构。大部分其他数据类型都代表一个特定的值，不过集合可以包含多个值。不同于内建的数组和元组类型，这些集合指向的数据是储存在堆上的，这意味着数据的数量不必在编译时就已知并且可以随着程序的运行增长或缩小。每种集合都有着不同能力和代价，而为所处的场景选择合适的集合则是你将要始终成长的技能。在这一章里，我们将详细的了解三个在 Rust 程序中被广泛使用的集合：

* *vector* 允许我们一个挨着一个地储存一系列数量可变的值
* **字符串**（*string*）是一个字符的集合。我们之前见过 `String` 类型，不过在本章我们将深入了解。
* **哈希 map**（*hash map*）允许我们将值与一个特定的键（key）相关联。这是一个叫做 *map* 的更通用的数据结构的特定实现。

对于标准库提供的其他类型的集合，请查看[文档][collections]。

[collections]: https://doc.rust-lang.org/std/collections

我们将讨论如何创建和更新 vector、字符串和哈希 map，以及它们有什么不同。
