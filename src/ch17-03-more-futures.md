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

相比于需要在 `join` 和 `join3` 和  `join4` 等等之间切换来说这绝对是一个进步！然而，即便是这个宏形式也只能用于我们提前知道 future 的数量的情况。不过，在现实世界的 Rust 中，将 futures 放进一个集合并接着等待集合中的一些或者全部 future 完成是一个常见的模式。

为了检查一些集合中的所有 future，我们需要遍历并 join *全部* 的 future。`trpl::join_all` 函数接受任何实现了 `Iterator` trait 的类型，我们在之前的第十三章中学习过它们，所以这正是我们需要的。让我们将 futures 放进一个向量，并将 `join!` 替换为 `join_all`。

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

这可能有点令人惊讶。毕竟没有一个 future 返回了任何值，所以每个代码块都会产生一个 `Future<Output = ()>`。然而，`Future` 是一个 trait，而不是一个具体类型。其具体类型是编译器为各个异步代码块生成的（不同的）数据结构。你不能将两个不同的手写的 struct 放进同一个 `Vec`，同样的原理也适用于编译器生成的不同 struct。

为了使代码能够正常工作，我们需要使用 *trait objects*，正如我们在第十二章的 [“从 `run` 函数中返回错误”][dyn] 中做的那样。（第十八章会详细介绍 trait objects。）使用 trait objects 允许我们将这些类型所产生的不同的匿名 future 视为相同的类型，因为它们都实现了 `Future` trait。

> 注意：在第八章中，我们讨论过另一种将多种类型包含进一个 `Vec` 的方式：使用一个枚举来代表每个可以出现在向量中的不同类型。不过这里我们不能这么做。首先，没有方法来命名这些不同的类型，因为它们是匿名的。其次，我们最开始采用向量和 `join_all` 的原因是为了处理一个直到运行时之前都不知道是什么的 future 的动态集合。

我们以将 `vec!` 中的每个 future 用 `Box::new` 封装来作为开始，如示例 17-16 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-16/src/main.rs:here}}
```

<figcaption>示例 17-16：尝试用 `Box::new` 来对齐 `Vec` 中 future 的类型</figcaption>

</figure>

不幸的是，代码仍然不能编译。事实上，这里犯了与之前相同的基本错误，不过我们会在第二个和第三个 `Box::new` 调用处得到两个错误，而且还会得到一个提及 `Unpin` trait 的新错误。我们一会再回到 `Unpin` 错误上。首先，让我们通过显式指定 `futures` 的类型来修复 `Box::new` 调用的类型错误：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-17/src/main.rs:here}}
```

<figcaption>示例 17-17：通过使用一个显式类型声明来修复余下的类型不匹配错误</figcaption>

</figure>

这里必须编写的类型有一点复杂，让我们整体过一遍：

- 最内层的类型是 future 本身。
- 接着使用 `dyn` 将 trait 标记为动态的。
- 整个 trait 引用被封装进一个 `Box`。
- 最后，我们显式表明 `futures` 是一个包含这些项的 `Vec`。

这已经有了很大的区别。现在当我们运行编译器时，就只会有提到 `Unpin` 的错误了。虽然这里有三个错误，但请注意它们每个的内容都非常相似。

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-17
cargo build
copy *only* the errors
-->

```text
error[E0277]: `{async block@src/main.rs:8:23: 20:10}` cannot be unpinned
   --> src/main.rs:46:24
    |
46  |         trpl::join_all(futures).await;
    |         -------------- ^^^^^^^ the trait `Unpin` is not implemented for `{async block@src/main.rs:8:23: 20:10}`, which is required by `Box<{async block@src/main.rs:8:23: 20:10}>: std::future::Future`
    |         |
    |         required by a bound introduced by this call
    |
    = note: consider using the `pin!` macro
            consider using `Box::pin` if you need to access the pinned value outside of the current scope
    = note: required for `Box<{async block@src/main.rs:8:23: 20:10}>` to implement `std::future::Future`
note: required by a bound in `join_all`
   --> /Users/chris/.cargo/registry/src/index.crates.io-6f17d22bba15001f/futures-util-0.3.30/src/future/join_all.rs:105:14
    |
102 | pub fn join_all<I>(iter: I) -> JoinAll<I::Item>
    |        -------- required by a bound in this function
...
105 |     I::Item: Future,
    |              ^^^^^^ required by this bound in `join_all`

error[E0277]: `{async block@src/main.rs:8:23: 20:10}` cannot be unpinned
  --> src/main.rs:46:9
   |
46 |         trpl::join_all(futures).await;
   |         ^^^^^^^^^^^^^^^^^^^^^^^ the trait `Unpin` is not implemented for `{async block@src/main.rs:8:23: 20:10}`, which is required by `Box<{async block@src/main.rs:8:23: 20:10}>: std::future::Future`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<{async block@src/main.rs:8:23: 20:10}>` to implement `std::future::Future`
note: required by a bound in `JoinAll`
  --> /Users/chris/.cargo/registry/src/index.crates.io-6f17d22bba15001f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`

error[E0277]: `{async block@src/main.rs:8:23: 20:10}` cannot be unpinned
  --> src/main.rs:46:33
   |
46 |         trpl::join_all(futures).await;
   |                                 ^^^^^ the trait `Unpin` is not implemented for `{async block@src/main.rs:8:23: 20:10}`, which is required by `Box<{async block@src/main.rs:8:23: 20:10}>: std::future::Future`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<{async block@src/main.rs:8:23: 20:10}>` to implement `std::future::Future`
note: required by a bound in `JoinAll`
  --> /Users/chris/.cargo/registry/src/index.crates.io-6f17d22bba15001f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`

Some errors have detailed explanations: E0277, E0308.
For more information about an error, try `rustc --explain E0277`.
```

这里有 *很多* 内容需要分析，所以让我们拆开来看。信息的第一部分告诉我们第一个异步代码块（`src/main.rs:8:23: 20:10`）没有实现 `Unpin` trait，并建议使用 `pin!` 或 `Box::pin` 来修复，在本章的稍后部分我们会深入 `Pin`  和 `Unpin` 的一些更多细节。不过现在我们可以仅仅遵循编译器的建议来解困！在示例 17-18 中，我们以更新 `futures` 的类型声明作为开始，用 `Pin` 来封装每个 `Box`。其次，我们使用 `Box::pin` 来 pin 住 futures 自身。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-18/src/main.rs:here}}
```

<figcaption>示例 17-18：使用 `Pin` 和 `Box::pin` 来约束 `Vec` 的类型</figcaption>

</figure>

如果编译并运行代码，我们终于会得到我们期望的输出：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
received 'hi'
received 'more'
received 'from'
received 'messages'
received 'the'
received 'for'
received 'future'
received 'you'
```

（长舒一口气！）

这里还有一些我们可以探索的内容。首先，因为通过 `Box` 来将这些 futures 放到堆上，使用 `Pin<Box<T>>` 会带来少量的额外开销，而我们这么做仅仅是为了对齐它们的类型。毕竟实际上这里并不 *需要* 堆分配：这些 futures 对于这个特定的函数来说是本地的。如上所示，`Pin` 本身是一个封装类型，所以我们可以获得拥有单一类型 `Vec` 的好处（也就是使用 `Box` 的初始原因）而不用堆分配。我们可以通过 `std::pin::pin` 宏来直接对每个 future 使用 `Pin`。

然而，我们仍然必须现实地知道被 pin 住的引用的类型：否则 Rust 仍然不知道如何将它们解释为动态 trait objects，这是将它们放进 `Vec` 所需的。因此我们在定义每个 future 的时候使用 `pin!`，并将 `futures` 定义为一个包含被 pin 住的动态 `Future` 类型的可变引用的 `Vec`，如示例 17-19 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-19/src/main.rs:here}}
```

<figcaption>示例 17-19：通过 `pin!` 宏来直接使用 `Pin` 以避免不必要的堆分配</figcaption>

</figure>

目前为止我们一直忽略了可能有不同 `Output` 类型的事实。例如，在示例 17-20 中，匿名 future `a` 实现了 `Future<Output = u32>`，匿名 future `b` 实现了 `Future<Output = &str>`，而匿名 future `c` 实现了 `Future<Output = bool>`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-20/src/main.rs:here}}
```

<figcaption>示例 17-20：三个不同类型的 futures</figcaption>

</figure>

我们可以使用 `trpl::join!` 来 await 它们，因为它允许你传递多个 future 类型并产生一个这些类型的元组。

[collections]: ch08-01-vectors.html#using-an-enum-to-store-multiple-types
[dyn]: ch12-03-improving-error-handling-and-modularity.html
[async-program]: ch17-01-futures-and-syntax.html#our-first-async-program
