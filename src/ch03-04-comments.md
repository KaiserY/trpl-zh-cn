## 注释

[ch03-04-comments.md](https://github.com/rust-lang/book/blob/9cc190796f28505c7a9a9cacea42f50d895ff3bd/src/ch03-04-comments.md)

所有程序员都努力让自己的代码易于理解，不过有时仍然需要额外的解释。在这种情况下，程序员会在源码中留下 **注释**（*comments*），编译器会忽略它们，但阅读源码的人可能会觉得这些注释很有帮助。

这是一个简单的注释：

```rust
// hello, world
```

在 Rust 中，惯用的注释风格是用两个斜杠开始一条注释，并让注释持续到该行末尾。对于跨越多行的注释，你需要在每一行前面都加上 `//`，像这样：

```rust
// So we’re doing something complicated here, long enough that we need
// multiple lines of comments to do it! Whew! Hopefully, this comment will
// explain what’s going on.
```

注释也可以放在包含代码的行的末尾：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-24-comments-end-of-line/src/main.rs}}
```

不过，你更常见到的用法是把注释放在它所解释的代码上一行，像这样：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-25-comments-above-line/src/main.rs}}
```

Rust 还有另一种注释，叫作文档注释，我们会在第十四章的[“将 crate 发布到 Crates.io”][publishing]部分讨论它。

[publishing]: ch14-02-publishing-to-crates-io.html
