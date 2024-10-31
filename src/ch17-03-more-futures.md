## 使用任意数量的 futures

> [ch17-03-more-futures.md](https://github.com/rust-lang/book/blob/main/src/ch17-03-more-futures.md)
> <br>
> commit 9e85fcc9938e8f8c935d0ad8b4db7f45caaa2ca4

当我们在上一部分从使用两个 future 到三个 future 的时候，我们也必须从使用 `join` 切换到 `join3`。每次我们想要改变 join 的 future 数量时都不得不调用一个不同的函数是很烦人的。令人高兴的是，我们有一个宏版本的 `join` 可以传递任意数量的参数。它还会自行处理 await 这些 future。因此，我们可以重写示例 17-13 中的代码来使用 `join!` 而不是 `join3`，如示例 17-14 所示：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-14/src/main.rs:here}}
```

<figcaption>示例 17-14：使用 `join!` 来等待多个 future</figcaption>

</figure>

相比需要在 `join` 和 `join3` 和  `join4` 等等直接切换来说这绝对是一个进步！然而，即便是这个宏形式也只能用于我们提前知道 future 的数量的时候。不过，在现实世界的 Rust 中，将 futures 放进一个集合并接着等待集合中的一些或者全部 future 完成是一个常见的模式。

为了检查一些集合中的所有 future，我们需要遍历并 join 它们 *全部*。`trpl::join_all` 函数接受任何实现了 `Iterator` trait 的类型，我们在之前的第十三章中学习过它们，所以这正是我们需要的。让我们将 futures 放进一个向量，并将 `join!` 替换为 `join_all`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-15/src/main.rs:here}}
```

<figcaption>示例 17-15：将匿名 futures 储存在一个向量中并调用 `join_all`</figcaption>

</figure>

不幸的是这还不能编译。相反我们会得到这个错误：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-16/
cargo build
copy just the compiler error
-->


```text
error[E0308]: mismatched types
  --> src/main.rs:43:37
   |
8  |           let tx1_fut = async move {
   |  _______________________-
9  | |             let vals = vec![
10 | |                 String::from("hi"),
11 | |                 String::from("from"),
...  |
19 | |             }
20 | |         };
   | |_________- the expected `async` block
21 |
22 |           let rx_fut = async {
   |  ______________________-
23 | |             while let Some(value) = rx.recv().await {
24 | |                 println!("received '{value}'");
25 | |             }
26 | |         };
   | |_________- the found `async` block
...
43 |           let futures = vec![tx1_fut, rx_fut, tx_fut];
   |                                       ^^^^^^ expected `async` block, found a different `async` block
   |
   = note: expected `async` block `{async block@src/main.rs:8:23: 20:10}`
              found `async` block `{async block@src/main.rs:22:22: 26:10}`
   = note: no two async blocks, even if identical, have the same type
   = help: consider pinning your async block and and casting it to a trait object
```

这可能有点令人惊讶。毕竟没有一个 future 返回了任何值，所以每个代码块都会产生一个 `Future<Output = ()>`。然而，`Future` 是一个 trait，不是一个具体类型。其具体类型是编译器为各个异步代码块生成的（不同的）数据结构。你不能将两个不同的手写的 struct 放进同一个 `Vec`，同样的原理也适用于编译器生成的不同 struct。

为了使代码能够正常工作，我们需要使用 *trait objects*，正如我们在第十二章的 [“从 `run` 函数中返回错误”][dyn] 中做的那样。（第十八章会详细介绍 trait objects。）使用 trait objects 允许我们将这些类型所产生的不同的匿名 future 看作相同的类型，因为它们都实现了 `Future` trait。

> 注意：在第八章中，我们讨论过另一种将多种类型包含进一个 `Vec` 的方式：使用一个枚举来代表每个可以出现在向量中的不同类型。不过这里我们不能这么做。首先，没有方法来命名这些不同的类型，因为它们是匿名的。

[collections]: ch08-01-vectors.html#using-an-enum-to-store-multiple-types
[dyn]: ch12-03-improving-error-handling-and-modularity.html
[async-program]: ch17-01-futures-and-syntax.html#our-first-async-program
