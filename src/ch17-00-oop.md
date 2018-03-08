# Rust 是一个面向对象的编程语言吗？

> [ch17-00-oop.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-00-oop.md)
> <br>
> commit 28d0efb644d18e8d104c2e813c8cdce50d040d3d

面向对象编程（Object-Oriented Programming）是一种起源于 20 世纪 60 年代的 Simula 编程语言的模式化编程方式，然后在 90 年代随着 C++ 语言开始流行。关于 OOP 是什么有很多相互矛盾的定义，在一些定义下，Rust 是面向对象的；在其他定义下，Rust 不是。在本章节中，我们会探索一些被普遍认为是面向对象的特性和这些特性是如何体现在 Rust 语言习惯中的。接着会展示如何在 Rust 中实现面向对象设计模式，并讨论这么做与利用 Rust 自身的一些优势实现的方案相比有什么取舍。