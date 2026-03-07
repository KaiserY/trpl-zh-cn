# 常见集合

[ch08-00-common-collections.md](https://github.com/rust-lang/book/blob/2581c23b669eff30c26e036a13475ec5cf70c1b8/src/ch08-00-common-collections.md)

Rust 标准库中包含一些非常有用的数据结构，它们被称为 **集合**（*collections*）。大多数其他数据类型表示的是一个特定的值，而集合可以包含多个值。与内建的数组和元组类型不同，这些集合指向的数据存储在堆上，这意味着数据量不需要在编译时已知，并且可以随着程序运行而增长或缩小。每一种集合都有不同的能力和开销，而根据当前场景选择合适的集合，是一项你会随着时间逐渐掌握的技能。本章将讨论 Rust 程序中非常常用的三种集合：

- **向量**（*vector*）允许你把数量可变的值一个挨一个地存放起来。
- **字符串**（*string*）是字符的集合。此前我们已经提到过 `String` 类型，不过本章会更深入地讨论它。
- **哈希映射**（*hash map*）允许你把某个值与特定的键关联起来。它是更通用的数据结构 *map* 的一种具体实现。

要了解标准库提供的其他集合类型，请参阅[文档][collections]。

我们将讨论如何创建和更新 vector、字符串和哈希映射，以及它们各自的特别之处。

[collections]: https://doc.rust-lang.org/std/collections/index.html
