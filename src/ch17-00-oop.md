# Rust 的面向对象特性

> [ch17-00-oop.md](https://github.com/rust-lang/book/blob/master/src/ch17-00-oop.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

面向对象编程（Object-Oriented Programming，OOP）是一种模式化编程方式。对象（Object）来源于 20 世纪 60 年代的 Simula 编程语言。这些对象影响了 Alan Kay 的编程架构中对象之间的消息传递。他在 1967 年创造了 **面向对象编程** 这个术语来描述这种架构。关于 OOP 是什么有很多相互矛盾的定义；在一些定义下，Rust 是面向对象的；在其他定义下，Rust 不是。在本章节中，我们会探索一些被普遍认为是面向对象的特性和这些特性是如何体现在 Rust 语言习惯中的。接着会展示如何在 Rust 中实现面向对象设计模式，并讨论这么做与利用 Rust 自身的一些优势实现的方案相比有什么取舍。
