# 认识所有权

[ch04-00-understanding-ownership.md](https://github.com/rust-lang/book/blob/a5e0c5b2c5f9054be3b961aea2c7edfeea591de8/src/ch04-00-understanding-ownership.md)

所有权是 Rust 最独特的特性，也是对语言其余部分影响最深的特性之一。它使 Rust 无需垃圾回收器（garbage collector）也能提供内存安全保证，因此理解所有权在 Rust 中是如何工作的非常重要。在本章中，我们将讨论所有权，以及几个相关特性：借用（borrowing）、slice，以及 Rust 如何在内存中布局数据。
