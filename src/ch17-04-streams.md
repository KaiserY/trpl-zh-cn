## 流（Streams）：顺序的 Futrues

> [ch17-04-streams.md](https://github.com/rust-lang/book/blob/main/src/ch17-04-streams.md)
> <br>
> commit c7edf19e58701f894b4d906a6f7bd738ad4de801

到本章的目前为止，我们大部分时间都专注于单个的 future 上。一个重要的例外就是我们用过的异步信道。回忆一下在本章之前的 [“消息传递”][17-02-messages] 中我们如何使用异步信道接收端的。异步 `recv` 方法随着时间的推移产生一个序列的项。这是一个更通用的模式的实例，通常被称为 *流*（*stream*）。

我们之前在第十三章的 [Iterator trait 和 `next` 方法][iterator-trait] 部分已经见过项的序列，不过迭代器和异步信道接收端有两个区别。第一个区别是时间维度：迭代器是同步的，而信道接收端是异步的。第二个区别是 API。当直接处理 `Iterator` 时，我们会调用其同步 `next` 方法。对于这个特定的 `trpl::Receiver` 流，我们调用一个异步的 `recv` 方法。除此之外，这两种 API 在使用上感觉十分相似，这种相似性并非巧合。流类似于一种异步形式的迭代器。不过鉴于 `trpl::Receiver` 专门等待接收消息，多用途的流 API 则更为通用：它像 `Iterator` 一样提供了下一个项，但采用异步的方式。

Rust 中迭代器和流的相似性意味着我们实际上可以从任何迭代器上创建流。就迭代器而言，可以通过调用其 `next` 方法并 await 输出来使用流，如示例 17-30 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-30/src/main.rs:stream}}
```

<figcaption>示例 17-30：从迭代器创建流并打印其值</figcaption>

</figure>

我们以一组数字作为开始，将其转换为一个迭代器并接着调用 `map` 将其所有值翻倍。然后使用 `trpl::stream_from_iter` 函数将迭代器转换为流。随后，我们使用 `while let` 循环在项到达时对流中的每个项进行循环处理。

遗憾的是当我们尝试运行代码时，代码无法编译，而是报告没有可用的 `next` 方法。

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
   = note: the full type name has been written to '/Users/chris/dev/rust-lang/book/main/listings/ch17-async-await/listing-17-30/target/debug/deps/async_await-575db3dd3197d257.long-type-14490787947592691573.txt'
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

正如输出中所建议的，编译器错误的原因是我们需要在作用域中有正确的 trait 以便能够使用 `next` 方法。鉴于目前为止的讨论，你可能会合理地推测是 `Stream`，但实际上需要的是 `StreamExt`。这里的 `Ext` 是 “extension”：在 Rust 社区中这是用另一个 trait 扩展 trait 的常见模式。

我们稍后会在本章末尾更详细地介绍 `Stream` 和 `StreamExt` trait，目前你只需知道 `Stream` trait 定义了一个底层接口用于有效地组合 `Iterator` 和 `Future` trait。

为什么我们需要 `StreamExt` 而不是 `Stream`，而 `Stream` trait 本身又是做什么的呢？简单来说，答案是贯穿整个 Rust 生态系统，`Stream` trait 定义了一个底层接口用于有效地结合 `Iterator` 与 `Future` trait。`StreamExt` trait 在 `Stream` 之上提供了一组高层 API，其中包括了 `next` 和其它类似于 `Iterator` trait 提供的工具方法。`Stream` 和 `StreamExt` 目前尚未被纳入 Rust 的标准库，但大多数生态系统 crate 都使用相同的定义。

对编译器错误的修复是增加一个 `trpl::StreamExt` 的 `use` 语句，如示例 17-31 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-31/src/main.rs:all}}
```

<figcaption>示例 17-31：成功使用迭代器作为流的基础</figcaption>

</figure>

将所有这些代码片段拼凑在一起，这段代码如我们预期般运行！更重要的是，现在我们将 `StreamExt` 引入了作用域，就可以像使用迭代器一样使用它的所有工具方法。例如在示例 17-32 中，我们使用 `filter` 方法来过滤出仅为 3 或 5 的倍数的项。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-32/src/main.rs:all}}
```

<figcaption>示例 17-32：使用 `StreamExt::filter` 方法来过滤 `Stream`</figcaption>

</figure>

当然这并不是非常的有趣。我们完全可以使用普通的迭代器而不用任何异步操作来做到这些。所以让我们看看流能实现的一些独特功能。

### 组合流

很多概念天然地适合用流来表示：队列中陆续可用的项、数据量超过计算机内存限制时逐步从文件系统拉取的数据块，或者随时间推移通过网络逐渐到达的数据。因为流本身也是 future，我们也可以将其用于任何其它类型的 future，并以一些非常有趣的方式组合它们。例如，我们可以批量处理事件来避免触发过多的网络调用，为一系列的长时间运行的任务设置超时，或者对用户接口事件限速来避免进行不必要的工作。

让我们构建一个小的消息流作为开始，将其作为一个可能从 WebSocket 或者其它现实世界中的通信协议中遇到的数据流的替代，如示例 17-33 所示。

在示例 17-33 中，作为其实现，我们创建了一个异步信道，循环英文字母表的前十个字符，并通过信道发送它们。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-33/src/main.rs:all}}
```

<figcaption>示例 17-33：使用 `rx` 接收端作为一个 `ReceiverStream`</figcaption>

</figure>

首先，我们创建了一个返回 `impl Stream<Item = String>` 的 `get_messages` 函数。作为其实现，我们创建了一个异步信道，遍历前十个英文字母，并通过信道发送它们。


我们还使用了一个新类型：`ReceiverStream`，它将 `trpl::channel` 的 `rx` 接收端转换为一个带有带有 `next` 方法的 `Stream`。回到 `main`，我们使用了一个 `while let` 循环来打印来自流中的所有消息。

当运行这段代码时，我们会得到正如我们期望的代码：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
Message: 'a'
Message: 'b'
Message: 'c'
Message: 'd'
Message: 'e'
Message: 'f'
Message: 'g'
Message: 'h'
Message: 'i'
Message: 'j'
```

虽然再一次，我们可以使用常规的 `Receiver` API 甚至是 `Iterator` API 来做到这些，所以让我们增加一个需要流的功能：增加一个适用于流中所有项的超时，和一个发送项的延时，如示例 17-34 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-34/src/main.rs:timeout}}
```

<figcaption>示例 17-34：使用 `StreamExt::timeout` 方法为流中的项设置时限</figcaption>

</figure>

我们通过 `timeout` 方法在流上增加超时来作为开始，它来自 `StreamExt` trait。接着我们更新 `while let` 循环体，因为现在流返回一个 `Result`。`Ok` 变体表明消息及时到达；`Err` 变体表明任何消息到达前就触发超时了。我们 `match` 其结果要么在成功接收时打印消息要么打印一个超时的提示。最后，注意我们在加上超时之后 pin 了这些消息，因为超时助手函数产生了一个需要 pin 住才能拉取的流。

然后，因为消息之间没有延时，超时并不会改变程序的行为。让我们为发送的消息增加一个延时变量，如示例 17-35 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-35/src/main.rs:messages}}
```

<figcaption>示例 17-35：通过 `tx` 和一个异步延时而不是将 `get_messages` 变成异步函数来发送消息</figcaption>

</figure>

在 `get_messages` 中，我们在 `messages` 数组上使用 `enumerate` 迭代器方法以便能够一起获得项本身和其索引。然后我们在偶数索引的项引入 100 毫秒的延时并为奇数索引的项引入 300 毫秒的延时来模拟真实世界的消息流中可能见到的不同的延时。因为我们的延时为 200 毫秒左右，这应该会影响一半的消息。

为了在 `get_messages` 函数中的消息之前休眠而不阻塞，我们需要使用异步。然而，我们不能将 `get_messages` 函数本身变为异步函数，因为这样它会返回一个 `Future<Output = Stream<Item = String>>` 而不是 `Stream<Item = String>>`。调用者则不得不等待 `get_messages` 本身来获取流。不过请记住：在一个给定的 future 中的一切都是顺序发生的；并发发生在 futures **之间**。等待 `get_messages` 会要求其发送所有的消息，包括消息之间的休眠延时，在返回接收端流之前。其结果是，超时将毫无用处。流本身没有任何的延时；它们甚至全都发生在流可用之前。

相反，我们保持 `get_messages` 为一个返回流的常规函数，并产生一个任务来处理异步 `sleep` 调用。

> 注意：像这样调用 `spawn_task` 可以工作是因为我们已经设置了运行时；如果没有，则会造成 panic。其它的实现则选择了不同的权衡取舍：它们可能会产生一个新的运行时来避免 panic 不过最终会有一些额外开销，或者它们可能简单地在没有运行时的引用的情况下不提供一个独立的方式来产生任务。请务必理解你的运行时所选择的取舍来编写相应的代码！

现在我们的代码有了一个更为有趣的结果。每隔一对消息会有一个 `Problem: Elapsed(())` 错误。

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
Message: 'a'
Problem: Elapsed(())
Message: 'b'
Message: 'c'
Problem: Elapsed(())
Message: 'd'
Message: 'e'
Problem: Elapsed(())
Message: 'f'
Message: 'g'
Problem: Elapsed(())
Message: 'h'
Message: 'i'
Problem: Elapsed(())
Message: 'j'
```

超时最终并不会阻止消息到达。我们仍然能够得到所有原始的消息，因为我们的信道是 **无限的**（**unbounded**）：它可以存储内存所允许的所有消息。如果消息在超时之前没有到达，流处理器会做出反应，不过当再次拉取流时，消息现在可能已经到达了。

如果需要的话通过使用不同的信道或者其他更通用的流来得到不同行为。让我们看一个实际的通过结合一个时间间隔的流和这个消息流的例子。

### 合并流

首先，让我们创建另一个流，如果直接运行它的话它会每毫秒发送一个项。

[17-02-messages]: ch17-02-concurrency-with-async.html#消息传递
[iterator-trait]: ch13-02-iterators.html#the-iterator-trait-and-the-next-method
