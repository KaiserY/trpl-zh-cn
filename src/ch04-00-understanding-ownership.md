# 认识所有权

<!-- https://github.com/rust-lang/book/blob/main/src/ch04-00-understanding-ownership.md -->
<!-- commit a5e0c5b2c5f9054be3b961aea2c7edfeea591de8 -->

所有权（系统）是 Rust 最为与众不同的特性，对语言的其他部分有着深刻含义。它让 Rust 无需垃圾回收（garbage collector）即可保障内存安全，因此理解 Rust 中所有权如何工作是十分重要的。本章，我们将讲到所有权以及相关功能：借用（borrowing）、slice 以及 Rust 如何在内存中布局数据。
