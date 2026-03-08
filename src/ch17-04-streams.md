## Stream：按顺序出现的 Future

[ch17-04-streams.md](https://github.com/rust-lang/book/blob/2c56b53dfb99d0c3eca23b36e37fb0638eb57dbe/src/ch17-04-streams.md)

回忆一下本章前面在[“通过消息传递在两个任务之间发送数据”][17-02-messages]<!-- ignore -->一节中，我们是如何使用异步信道的接收端的。异步版的 `recv` 方法会随着时间推移产出一系列条目。这正是一种更普遍模式的实例，通常称为 *流*（*stream*）。很多概念都很自然地适合表示成 stream：队列中逐步变得可用的项、当完整数据集太大而无法一次装入内存时从文件系统中逐块拉取的数据、或者随着时间逐渐从网络到达的数据。由于 stream 本身也和 future 密切相关，我们可以把它和其他类型的 future 一起使用，并以有趣的方式进行组合。比如，我们可以把事件分批处理，以避免触发过多网络调用；可以为一串长时间运行的操作设置超时；也可以对 UI 事件进行节流，避免做无谓的工作。

我们在第十三章[“Iterator trait 和 `next` 方法”][iterator-trait]<!-- ignore -->一节中已经见过“按顺序产生一系列项”这回事，但迭代器和异步信道接收端之间有两个区别。第一个区别是时间：迭代器是同步的，而信道接收端是异步的。第二个区别是 API。直接处理 `Iterator` 时，我们会调用同步的 `next` 方法；而对于 `trpl::Receiver` 这个具体的 stream 来说，我们调用的是异步的 `recv` 方法。除此之外，这些 API 给人的感觉非常相似，而这种相似并非巧合。stream 就像迭代的一种异步形式。不过，`trpl::Receiver` 专门用于等待接收消息，而更通用的 stream API 则宽泛得多：它像 `Iterator` 一样提供“下一个条目”，只不过是以异步方式来做。

Rust 中迭代器和 stream 的这种相似性意味着，我们实际上可以从任意迭代器创建一个 stream。和使用迭代器一样，我们也可以通过调用 stream 的 `next` 方法，再等待其输出，来处理它，如示例 17-21 所示。不过这段代码暂时还编译不过。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-21/src/main.rs:stream}}
```

<figcaption>示例 17-21：从迭代器创建一个 stream，并打印出其中的值</figcaption>

</figure>

我们从一个数字数组开始，把它转换为迭代器，然后调用 `map` 把其中所有值都翻倍。接着再使用 `trpl::stream_from_iter` 函数，把这个迭代器转换成一个 stream。最后，我们用 `while let` 循环，在 stream 中的值陆续到达时逐个处理它们。

遗憾的是，当我们尝试运行这段代码时，编译器并不会通过，而是报告说没有可用的 `next` 方法：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-21
cargo build
copy only the error output
-->

```text
error[E0599]: no method named `next` found for struct `tokio_stream::iter::Iter` in the current scope
  --> src/main.rs:10:40
   |
10 |         while let Some(value) = stream.next().await {
   |                                        ^^^^
   |
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

正如这段输出解释的那样，编译错误的原因是：我们需要把正确的 trait 放进作用域，才能使用 `next` 方法。根据前面的讨论，你很可能会合理地猜测这个 trait 应该是 `Stream`，但实际上它是 `StreamExt`。这里的 `Ext` 是 *extension* 的缩写；在 Rust 社区里，用一个 trait 去扩展另一个 trait，是非常常见的模式。

`Stream` trait 定义的是一个底层接口，它实际上把 `Iterator` 和 `Future` trait 的特征结合在了一起。`StreamExt` 则在 `Stream` 之上提供了一组更高层的 API，其中包括 `next` 方法，以及其他一些和 `Iterator` trait 提供的工具方法相似的辅助方法。`Stream` 和 `StreamExt` 目前都还不是 Rust 标准库的一部分，不过生态系统中的大多数 crate 都使用相似的定义。

修复这个编译错误的方式，就是像示例 17-22 那样，添加一条 `use trpl::StreamExt` 语句。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-22/src/main.rs:all}}
```

<figcaption>示例 17-22：成功把迭代器作为 stream 的基础来使用</figcaption>

</figure>

把这些部分拼起来之后，这段代码就会按我们想要的方式工作！更重要的是，既然我们已经把 `StreamExt` 引入作用域，就也能像使用迭代器时那样，使用它提供的整套工具方法。

[17-02-messages]: ch17-02-concurrency-with-async.html#通过消息传递在两个任务之间发送数据
[iterator-trait]: ch13-02-iterators.html#iterator-trait-和-next-方法
