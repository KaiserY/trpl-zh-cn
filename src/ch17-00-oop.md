# Rust 的面向对象特性

> [ch17-00-oop.md][ch17-00]
> <br>
> commit 07b0ca8c829af09d60ab4eb9e69584b6f4a96f60

[ch17-00]: https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-00-oop.md
[commit]: https://github.com/rust-lang/book/commit/07b0ca8c829af09d60ab4eb9e69584b6f4a96f60

面向对象编程（Object-Oriented Programming，OOP）

面向对象编程（Object-Oriented Programming，OOP）是一种起源于 20 世纪 60 年代的 Simula 编程语言的模式化编程方式，然后在 90 年代随着 C++ 语言开始流行。关于 OOP 是什么有很多相互矛盾的定义，在一些定义下，Rust 是面向对象的；在其他定义下，Rust 不是。在本章节中，我们会探索一些被普遍认为是面向对象的特性和这些特性是如何体现在 Rust 语言习惯中的。接着会展示如何在 Rust 中实现面向对象设计模式，并讨论这么做与利用 Rust 自身的一些优势实现的方案相比有什么取舍。
