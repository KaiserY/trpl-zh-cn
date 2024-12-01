## 流（Streams）

> [ch17-04-streams.md](https://github.com/rust-lang/book/blob/main/src/ch17-04-streams.md)
> <br>
> commit f04d20fe8d1a49c3bffa10a3086c58e527ff0a90

到本章的目前为止，我们大部分时间停留在独立的 future 上。一个大的例外就是我们用过的异步信道。回忆一下在本章之前的 [“消息传递”][17-02-messages] 中我们如何使用的异步信道的。异步 `recv` 方法随着时间的推移产生一个序列的项。这是一个通用的多的模式的实例，通常被称为 *流*（*stream*）。

一个序列的项是我们之前是见过的，回忆一下第十三章的 `Iterator` trait，不过迭代器和异步信道接收端有两个区别。第一个区别是时间元素：迭代器是同步的，而信道接收端是异步的。第二个区别是 API。当直接处理 `Iterator` 时，我们会调用其 `next` 方法。对于这个特定的 `trpl::Receiver` 流，我们调用一个异步的 `recv` 方法，不过这些 API 看起来非常相似。

这种相似性并不是巧合。流类似于一种异步形式的迭代器。不过鉴于 `trpl::Receiver` 专门等待接收消息，多用途的流 API 则更为同用：它像 `Iterator` 一样提供了下一个项，不过是异步版本的。Rust 中迭代器和流的相似性意味着我们实际上可以从任何迭代器上创建流。就迭代器而言，可以通过调用其 `next` 方法并 await 输出来使用流，如示例 17-30 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-30/src/main.rs:stream}}
```

<figcaption>示例 17-30：从迭代器创建流并打印其值</figcaption>

</figure>

我们以一组数字作为开始，将其转换为一个迭代器并接着调用 `map` 将其所有值翻倍。然后使用 `trpl::stream_from_iter` 函数将迭代器转换为流。再然后在 `while let` 循环中到达时循环流中的项。

不幸的是当我们尝试运行代码时，它不能编译。相反如果我们观察其输出，它会报告没有可用的 `next` 方法。

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-30
cargo build
copy only the error output
-->

```console
error[E0599]: no method named `next` found for struct `Iter` in the current scope
  --> src/main.rs:10:40
   |
10 |         while let Some(value) = stream.next().await {
   |                                        ^^^^
   |
   = note: the full type name has been written to 'file:///projects/async_await/target/debug/deps/async_await-9de943556a6001b8.long-type-1281356139287206597.txt'
   = note: consider using `--verbose` to print the full type name to the console
   = help: items from traits can only be used if the trait is in scope
help: the following traits which provide `next` are implemented but not in scope; perhaps you want to import one of them
   |
1  + use crate::trpl::StreamExt;
   |
1  + use futures_util::stream::stream::StreamExt;
   |
1  + use std::iter::Iterator;
   |
1  + use std::str::pattern::Searcher;
   |
help: there is a method `try_next` with a similar name
   |
10 |         while let Some(value) = stream.try_next().await {
   |                                        ~~~~~~~~
```

正如输出中所建议的，编译器错误的原因是我们需要在作用域中有正确的 trait 以便能够使用 `next` 方法。鉴于目前为止的讨论，你可能会合理地推测是 `Stream`，不过这里需要的 trait 实际上是 `StreamExt`。这里的 `Ext` 是 “extension”：在 Rust 社区中这是用另一个 trait 扩展 trait 的常见模式。

为什么我们需要 `StreamExt` 而不是 `Stream`，而 `Stream` trait 本身又是做什么的呢？简单来说，答案是贯穿整个 Rust 生态系统，`Stream` trait 定义了一个底层接口用于有效地组合 `Iterator` 和 `Future` trait。`StreamExt` trait 在 `Stream` 之上提供了一组高层 API，这包括 `next` 和其它类似于 `Iterator` trait 提供的工具方法。在本章的最后我们会回到 `Stream` 和 `StreamExt` 并介绍更多细节。现在这已经足够我们继续了。

对编译器错误的修复是增加一个 `trpl::StreamExt` 的 `use` 语句，如示例 17-31 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-31/src/main.rs:all}}
```

<figcaption>示例 17-31：成功使用迭代器作为流的基础</figcaption>

</figure>

[17-02-messages]: ch17-02-concurrency-with-async.html#消息传递