# 面向对象编程特性

<!-- https://github.com/rust-lang/book/blob/main/src/ch18-00-oop.md -->
<!-- commit 56ec353290429e6547109e88afea4de027b0f1a9 -->

面向对象编程（Object-Oriented Programming，OOP）是一种对程序进行建模方式。对象（Object）作为一个编程概念来源于 20 世纪 60 年代的 Simula 编程语言。这些对象影响了 Alan Kay 的编程架构，该架构中对象之间互相传递消息。他于 1967 年创造了**面向对象编程**（*object-oriented programming*）这一术语。对于 OOP 的定义众说纷纭；在一些定义下，Rust 是面向对象的；在其他定义下，Rust 不是。在本章节中，我们会探索一些被普遍认为是面向对象的特性和这些特性是如何体现在 Rust 语言习惯中的。接着会展示如何在 Rust 中实现面向对象设计模式，并讨论这么做与利用 Rust 自身的一些优势实现的方案相比有什么取舍。
