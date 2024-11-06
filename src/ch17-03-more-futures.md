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

> 注意：在第八章中，我们讨论过另一种将多种类型包含进一个 `Vec` 的方式：使用一个枚举来代表每个可以出现在向量中的不同类型。不过这里我们不能这么做。一方面，没有方法来命名这些不同的类型，因为它们是匿名的。另一方面，我们最开始采用向量和 `join_all` 的原因是为了处理一个直到运行时之前都不知道是什么的 future 的动态集合。

我们以将 `vec!` 中的每个 future 用 `Box::new` 封装来作为开始，如示例 17-16 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-16/src/main.rs:here}}
```

<figcaption>示例 17-16：尝试用 `Box::new` 来对齐 `Vec` 中 future 的类型</figcaption>

</figure>

不幸的是，代码仍然不能编译。事实上，我们遇到了与之前相同的基本错误，不过这次我们会在第二个和第三个 `Box::new` 调用处各得到一个错误，同时还会得到一个提及 `Unpin` trait 的新错误。我们一会再回到 `Unpin` 错误上。首先，让我们通过显式标注 `futures` 的类型来修复 `Box::new` 调用的类型错误：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-17/src/main.rs:here}}
```

<figcaption>示例 17-17：通过使用一个显式类型声明来修复余下的类型不匹配错误</figcaption>

</figure>

这里必须编写的类型有一点复杂，让我们逐步过一遍：

- 最内层的类型是 future 本身。我们显式地指出 future 的输出类型是单元类型 `()`，其编写为 `Future<Output = ()>`。
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

这里还有一些我们可以进一步探索的内容。首先，因为通过 `Box` 来将这些 futures 放到堆上，使用 `Pin<Box<T>>` 会带来少量的额外开销，而我们这么做仅仅是为了使类型对齐。毕竟这里实际上并不 *需要* 堆分配：这些 futures 对于这个特定的函数来说是本地的。如上所述，`Pin` 本身是一个封装类型，因此我们可以在 `Vec` 中拥有单一类型的好处（也就是使用 `Box` 的初始原因）而不用堆分配。我们可以通过 `std::pin::pin` 宏来直接对每个 future 使用 `Pin`。

然而，我们仍然必须现实地知道被 pin 的引用的类型：否则 Rust 仍然不知道如何将它们解释为动态 trait objects，这是将它们放进 `Vec` 所需的。因此我们在定义每个 future 的时候使用 `pin!`，并将 `futures` 定义为一个包含被 pin 的动态 `Future` 类型的可变引用的 `Vec`，如示例 17-19 所示。

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

我们可以使用 `trpl::join!` 来 await 它们，因为它允许你传递多个 future 类型并产生一个这些类型的元组。我们 *不能* 使用 `trpl::join_all`，因为它要求传递的 future 都拥有相同的类型。请记住，那个错误正是我们开启 `Pin` 探索之旅的原因！

这是一个基础的权衡取舍：要么我们可以使用 `join_all` 处理动态数量的 future，只要它们都有相同的类型；要么我们可以使用 `join` 函数或者 `join!` 宏来处理固定数量的 future，哪怕它们有着不同的类型。不过这与 Rust 处理任何其它类型是一样的。Future 并不特殊，即便我们采用了一些友好的语法来处理它们，而这其实是好事。

### future 竞争

当我们使用 `join` 系列函数和宏来 “join” future 时，我们要求它们 *全部* 结束才能继续。虽然有时我们只需要 *部分* future 结束就能继续，这有点像一个 future 与另一个 future 竞争。

在示例 17-21 中，我们再次使用 `trpl::race` 来运行 `slow` 和 `fast` 两个 future 并相互竞争。它们每一个都会在开始运行时打印一条消息，通过调用并 await `sleep` 暂停一段时间，接着在其结束时打印另一条消息。然后我们将它们传递给 `trpl::race` 并等待其中一个结束。（结果不会令人意外：`fast` 会赢！）不同于我们在[第一个异步程序][async-program]中使用 `race` 的时候，这里忽略了其返回的 `Either` 实例，因为所有有趣的行为都发生在异步代码块中。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-21/src/main.rs:here}}
```

<figcaption>示例 17-21：使用 `race` 来获取哪个 future 最先结束的结果</figcaption>

</figure>

请注意如果你反转 `race` 参数的顺序，“started” 消息的顺序会改变，即使 `fast` future 总是第一个结束。这是因为这个特定的 `race` 函数实现并不是公平的。它总是以传递的参数的顺序来运行传递的 futures。其它的实现 *是* 公平的，并且会随机选择首先轮询的 future。不过无论我们使用的 race 实现是否公平，其中 *一个* future 会在另一个任务开始之前一直运行到异步代码块中第一个 `await` 为止。

回忆一下[第一个异步程序][async-program]中提到在每一个 await point，如果被 await 的 future 还没有就绪，Rust 会给运行时一个机会来暂停该任务并切换到另一个任务。反过来也是正确的：Rust *只会* 在一个 await point 暂停异步代码块并将控制权交还给运行时。await points 之间的一切都是同步。

这意味着如果你在异步代码块中做了一堆工作而没有一个 await point，则那个 future 会阻塞其它任何 future 继续进行。有时你可能会听说这称为一个 future *starving* 其它 future。在一些情况中，这可能不是什么大问题。不过，如果你在进行某种昂贵的设置或者上时间运行的任务，亦或有一个 future 会无限持续运行某些特定任务的话，你会需要思考在何时何地将控制权交还运行时。

同样地，如果你有长时间运行的阻塞操作，异步可能是一个提供了将程序的不同部分相互关联起来的实用工具。

不过在这种情况下 *如何* 将控制权交还运行时呢？

### Yielding

让我们模拟一个长时间运行的操作。示例 17-22 引入了一个 `slow` 函数。它使用 `std::thread::sleep` 而不是 `trpl::sleep` 因此 `slow` 调用会阻塞当前线程若干毫秒。我们可以用 `slow` 来代表现实世界中的长时间运行并阻塞的操作。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-22/src/main.rs:slow}}
```

<figcaption>示例 17-22：使用 `thread::sleep` 来模拟缓慢的操作</figcaption>

</figure>

在示例 17-22 中，我们使用 `slow` 在几个 future 中模拟这类 CPU 密集型工作。首先，每个 future 只会在进行了一系列缓慢操作 *之后* 才将控制权交还给运行时。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-23/src/main.rs:slow-futures}}
```

<figcaption>示例 17-23：使用 `thread::sleep` 来模拟缓慢的操作</figcaption>

</figure>

如果运行代码，你会看到这些输出：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-24/
cargo run
copy just the output
-->

```text
'a' started.
'a' ran for 30ms
'a' ran for 10ms
'a' ran for 20ms
'b' started.
'b' ran for 75ms
'b' ran for 10ms
'b' ran for 15ms
'b' ran for 350ms
'a' finished.
```

与上一个示例一样，`race` 仍然在 `a` 完成后就立刻结束了。两个 future 之间没有交叉。`a` future 一直进行其工作直到 `trpl::sleep` 调用被 await，然后 `b` future 一直进行其工作直到它自己的 `trpl::sleep` 调用被 await，再然后 `a` future 完成。为了使两个 future 在其缓慢任务之间继续进行，我们需要 await point 才能将控制权交还给运行时。这意味着我们需要一些可以 await 的东西！

我们已经在示例 17-23 中见过这类交接发生：如果去掉 `a` future 结尾的 `trpl::sleep`，那么当它完成时 `b` future *完全* 不会运行。也许我们可以使用 `sleep` 函数来作为开始呢？

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-24/src/main.rs:here}}
```

<figcaption>示例 17-24：使用 `sleep` 让操作切换以继续进行</figcaption>

</figure>

在示例 17-24 中，我们在 `slow` 调用之间增加了 `trpl::sleep` 调用和 await points。现在两个 future 的工作会相互交叉：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-24
cargo run
copy just the output
-->

```text
'a' started.
'a' ran for 30ms
'b' started.
'b' ran for 75ms
'a' ran for 10ms
'b' ran for 10ms
'a' ran for 20ms
'b' ran for 15ms
'a' finished.
```

`a` future 仍然会在交还控制权给 `b` 之前运行一会，因为它在调用 `trpl::sleep` 之前就调用了 `slow`，不过在这之后两个 future 会在触发 await point 时来回切换。在这个例子中，我们在 `slow` 之后这么做，不过我们可以在任何合适的地方拆分任务。

但是我们并不希望在这里 *休眠*：我们希望尽可能快地取得进展。我们仅仅是需要交还控制权给运行时。我们可以使用 `yield_now` 函数来直接这么做。在示例 17-25 中，我们将所有的 `sleep` 调用替换为 `yield_now`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-25/src/main.rs:yields}}
```

<figcaption>示例 17-25：使用 `yield_now` 让操作切换以继续进行</figcaption>

</figure>

这不仅更为清楚地表明了实际的意图而且更显著地快于使用 `sleep`，

[collections]: ch08-01-vectors.html#using-an-enum-to-store-multiple-types
[dyn]: ch12-03-improving-error-handling-and-modularity.html
[async-program]: ch17-01-futures-and-syntax.html#第一个异步程序
