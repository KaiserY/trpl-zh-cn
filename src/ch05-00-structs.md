# 结构体

> [ch05-00-structs.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch05-00-structs.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

`struct`，是 *structure* 的缩写，是一个允许我们命名并将多个相关值包装进一个有意义的组合的自定义类型。如果你来自一个面向对象编程语言背景，`struct` 就像对象中的数据属性（字段）。在本章中，我们会比较元组与结构体，展示如何使用结构体，并讨论如何在结构体上定义方法和关联函数来指定与结构体数据相关的行为。结构体和 **枚举**（*enum*）（将在第六章讲到）是为了充分利用 Rust 的编译时类型检查来在程序范围内创建新类型的基本组件。
