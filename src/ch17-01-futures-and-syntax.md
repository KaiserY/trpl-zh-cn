## Futures 和 async 语法

> [ch17-01-futures-and-syntax.md](https://github.com/rust-lang/book/blob/main/src/ch17-01-futures-and-syntax.md)
> <br>
> commit e95efa05706c5c4309df9ed47d5e91d8ed342b7d

Rust 异步编程的关键元素是 *futures* 和 Rust 的 `async` 与 `await` 关键字。

*future* 是一个现在可能还没有准备好但将在未来某个时刻准备好的值。（相同的概念也出现在很多语言中，有时被称为 “task” 或者 “promise”。）Rust 提供了 `Future` trait 作为基础组件，这样不同的异步操作就可以在不同的数据结构上实现。在 Rust 中，我们称实现了 `Future` trait 的类型为 futures。每一个实现了 `Future` 的类型会维护自己的进度状态信息和 "ready" 的定义。

`async` 关键字可以用于代码块和函数，表明它们可以被中断并恢复。在一个 async 块或 async 函数中，可以使用 `await` 关键字来等待一个 future 准备就绪，这一过程称为 *等待一个 future*。async 块或 async 函数中每一个等待 future 的地方都可能是一个 async 块或 async 函数中断并随后恢复的点。检查一个 future 并查看其值是否已经准备就绪的过程被称为 *轮询*（polling）。

其它一些语言也使用 `async` 和 `await` 关键字进行异步编程。如果你熟悉这些语言，则可能会注意到它们与 Rust 的处理方式有显著不同，包括语法上的差异。我们将看到，这样做是有充分理由的！

在大多数情况下，编写异步 Rust 代码时，我们使用 `async` 和 `await` 关键字。Rust 将其编译为等同于使用 `Future` trait 的代码，这非常类似于将 `for` 循环编译为等同于使用 `Iterator` trait 的代码。不过，由于 Rust 提供了 `Future` trait，你也可以在需要时为你自己的数据类型实现它。在整个章节中你会看到很多函数的返回值类型都有其自己的 `Future` 实现。我们会在本章结尾回到这个 trait 的定义，并深入了解它的工作原理，但现在这些细节已经足够让我们继续前进了。

这些内容可能有点抽象。让我们来编写第一个异步程序：一个小型网络爬虫。我们会从命令行传递两个 URL，并发地解析它们，并返回第一个完成解析的结果。这个示例会引入不少的新语法，不过不用担心。我们会逐步解释所有你需要了解的内容。

### 第一个异步程序

为了保持本章的内容专注于学习 async，而不是处理生态系统的部分组件，我们已经创建了一个 `trpl` crate（`trpl` 是 “The Rust Programming Language” 的缩写）。它重导出了你需要的所有类型、traits 和函数，它们主要来自于 [`futures`][futures-crate] 和 [`tokio`][tokio] crates。

- `futures` crate 是一个 Rust 异步代码实验的官方仓库，也正是 `Future` 最初设计的地方。
-  Tokio 是目前 Rust 中应用最广泛的异步运行时（async runtime），特别是（但不仅是！）web 应用。这里还有其他优秀的运行时，它们可能更适合你的需求。我们在 `trpl` 的底层使用 Tokio 是因为它经过了充分测试且广泛使用。

在一些场景中，`trpl` 也会重命名或者封装原始 API 以便我们专注于与本章相关的细节。如果你想了解该 crate 的具体功能，我们鼓励你查看[其源码][crate-source]。你可以看到每个重导出的内容来自哪个 crate，我们留下了大量注释来解释这个 crate 的用途。

创建一个名为 `hello-async` 的二进制项目并将 `trpl` crate 作为一个依赖添加：

```console
$ cargo new hello-async
$ cd hello-async
$ cargo add trpl
```

现在我们可以利用 `trpl` 提供的多种组件来编写第一个异步程序。我们构建了一个小的命令行工具来抓取两个网页，拉取各自的 `<title>` 元素，并打印出第一个完成全部过程的标题。

让我们开始编写一个函数，它获取一个网页 URL 作为参数，请求该 URL 并返回标题元素的文本：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-01/src/main.rs:all}}
```

<figcaption>示例 17-1：定义一个 async 函数来获取一个 HTML 页面的标题元素</figcaption>

</figure>

在示例 17-1 中，我们定义了一个名为 `page_title` 的函数，并使用了 `async` 关键字标记。接着我们使用 `trpl::get` 函数来获取传入的任意 URL，然后使用 `await` 关键字来等待响应。接着我们调用其 `text` 方法来获取响应的文本，这里再一次使用 `await` 关键字等待。这两个步骤都是异步的。对于 `get` 来说，我们需要等待服务器发送回其响应的第一部分，这会包含 HTTP 头（headers）、cookies 等。这部分响应可以独立于响应体发送。特别是在响应体非常大时候，接收完整响应可能会花费一些时间。因此我们不得不等待响应 *整体* 返回，所以 `text` 方法也是异步。

我们必须显示地等待这两个 futures，因为 Rust 中的 futures 是 *惰性*（*lazy*）的：在你使用 `await` 请求之前它们不会执行任何操作。（事实上，如果你不使用一个 futures，Rust 会显示一个编译警告）这应该会让你想起[之前第十三章][iterators-lazy]关于迭代器的讨论。直到你调用迭代器的 `next` 方法（直接调用或者使用 `for` 循环或者类似 `map` 这类在底层使用 `next` 的方法）之前它们什么也不会做。对于 futures 来说，同样的基本理念也是适用的：除非你显式地请求，否则它们不会执行。惰性使得 Rust 可以避免提前运行异步代码，直到真正需要时才执行。

> 注意：这不同于上一章节中 `thread::spawn` 的行为，当时传递给另一个线程的闭包会立即开始运行。这也与许多其他语言处理异步的方式不同！但对于 Rust 而言，这一点非常重要。稍后我们会解释原因。



[impl-trait]: ch10-02-traits.html#trait-作为参数
[iterators-lazy]: ch13-02-iterators.html
<!-- TODO: map source link version to version of Rust? -->
[crate-source]: https://github.com/rust-lang/book/tree/main/packages/trpl
[futures-crate]: https://crates.io/crates/futures
[tokio]: https://tokio.rs
