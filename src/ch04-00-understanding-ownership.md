# 认识所有权

> [ch04-00-understanding-ownership.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch04-00-understanding-ownership.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

所有权（系统）是 Rust 最独特的功能，其令 Rust 无需垃圾回收（garbage collector）即可保障内存安全。因此，理解 Rust 中所有权如何工作是十分重要的。本章我们将讲到所有权以及相关功能：借用、slice 以及 Rust 如何在内存中布局数据。