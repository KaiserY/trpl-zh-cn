# 认识所有权

> [ch04-00-understanding-ownership.md](https://github.com/rust-lang/book/blob/master/src/ch04-00-understanding-ownership.md)
> <br>
> commit 759067b651a48a4a66485fe0876d318d398fb4fe

所有权（系统）是 Rust 最独特的功能，它令 Rust 可以无需垃圾回收（garbage collector）就能保障内存安全。因此，理解 Rust 中所有权如何工作是十分重要的。本章我们将讲到所有权以及相关功能：借用、slices 以及 Rust 如何在内存中安排数据。