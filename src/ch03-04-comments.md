## 注释

> [ch03-04-comments.md](https://github.com/rust-lang/book/blob/master/src/ch03-04-comments.md)
> <br>
> commit 75a77762ea2d2ab7fa1e9ef733907ed727c85651

所有程序员都力求使其代码易于理解，不过有时还需要提供额外的解释。在这种情况下，程序员在源码中留下记录，或者 **注释**（*comments*），编译器会忽略它们，不过阅读代码的人可能觉得有用。

这是一个简单的注释：

```rust
// hello, world
```

在 Rust 中，注释必须以两道斜杠开始，并持续到本行的结尾。对于超过一行的注释，需要在每一行前都加上 `//`，像这样：

```rust
// So we’re doing something complicated here, long enough that we need
// multiple lines of comments to do it! Whew! Hopefully, this comment will
// explain what’s going on.
```

注释也可以在放在包含代码的行的末尾：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let lucky_number = 7; // I’m feeling lucky today
}
```

不过你更经常看到的是以这种格式使用它们，也就是位于它所解释的代码行的上面一行：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    // I’m feeling lucky today
    let lucky_number = 7;
}
```

Rust 还有另一种注释，称为文档注释，我们将在 14 章的 “将 crate 发布到 Crates.io” 部分讨论它。
