# 使用结构体组织相关联的数据

> [ch05-00-structs.md](https://github.com/rust-lang/book/blob/master/src/ch05-00-structs.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

*struct*，或者 *structure*，是一个自定义数据类型，允许你命名和包装多个相关的值，从而形成一个有意义的组合。如果你熟悉一门面向对象语言，*struct* 就像对象中的数据属性。在本章中，我们会对比元组与结构体的异同，演示结构体的用法，并讨论如何在结构体上定义方法和关联函数来指定与结构体数据相关的行为。你可以在程序中基于结构体和枚举（*enum*）（在第六章介绍）创建新类型，以充分利用 Rust 的编译时类型检查。
