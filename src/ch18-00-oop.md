# 面向对象编程特性

[ch18-00-oop.md](https://github.com/rust-lang/book/blob/d46785983db2d2f94ca3d571db2cfbad0f5ad3e6/src/ch18-00-oop.md)

面向对象编程（Object-Oriented Programming，OOP）是一种对程序进行建模的方式。对象（object）作为编程概念，最早出现在 20 世纪 60 年代的 Simula 编程语言中。这些对象影响了 Alan Kay 的编程架构，在那套架构里，对象会互相传递消息。1967 年，他创造了 **面向对象编程**（*object-oriented programming*）这一术语。对于 OOP 到底是什么，存在许多彼此竞争的定义；按其中一些定义，Rust 是面向对象的，而按另一些定义，它又不是。在本章中，我们会考察一些通常被认为具有“面向对象”特征的能力，并看看这些特征在符合 Rust 习惯的写法中是如何体现的。随后，我们还会展示如何在 Rust 中实现一种面向对象的设计模式，并讨论：与改用 Rust 自身的某些优势来实现同类方案相比，这样做的取舍是什么。
