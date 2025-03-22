## 流（Streams）：顺序的 Futrues

> [ch17-04-streams.md](https://github.com/rust-lang/book/blob/main/src/ch17-04-streams.md)
> <br>
> commit 56ec353290429e6547109e88afea4de027b0f1a9

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

首先，我们创建了一个返回 `impl Stream<Item = String>` 的 `get_messages` 函数。作为其实现，我们创建了一个异步信道，循环遍历英文字母表的前 10 个字母，并通过信道发送它们。

我们还使用了一个新类型：`ReceiverStream`，它将 `trpl::channel` 的 `rx` 接收端转换为一个带有带有 `next` 方法的 `Stream`。回到 `main`，我们使用了一个 `while let` 循环来打印来自流中的所有消息。

运行这段代码时，我们将得到与预期完全一致的结果：

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

我们通过 `timeout` 方法在流上增加超时来作为开始，它来自 `StreamExt` trait。接着我们更新 `while let` 循环体，因为现在流返回一个 `Result`。`Ok` 变体表明消息及时到达；`Err` 变体表明任何消息到达前就触发超时了。我们 `match` 其结果要么在成功接收时打印消息要么打印一个超时的提示。最后，请注意我们在加上超时之后 pin 住了这些消息，因为超时辅助函数产生了一个需要 pin 住才能轮询的流。

然后，因为消息之间没有延时，超时并不会改变程序的行为。让我们为发送的消息增加一个延时变量，如示例 17-35 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-35/src/main.rs:messages}}
```

<figcaption>示例 17-35：通过 `tx` 和一个异步延时而不是将 `get_messages` 变成异步函数来发送消息</figcaption>

</figure>

在 `get_messages` 中，我们在 `messages` 数组上使用 `enumerate` 迭代器方法以便能够同时获得项本身和其索引。然后我们为偶数索引的项引入 100 毫秒的延时并为奇数索引的项引入 300 毫秒的延时来模拟真实世界的消息流中可能出现的不同的延时。因为我们的延时为 200 毫秒，这应该会影响到其中一半的消息。

为了在 `get_messages` 函数中实现消息间的延迟且不造成阻塞，我们需要使用异步。然而，我们不能将 `get_messages` 函数本身变为异步函数，因为这样它会返回一个 `Future<Output = Stream<Item = String>>` 而不是 `Stream<Item = String>>`。调用者则不得不 await `get_messages` 本身来获取流。不过请记住：在一个给定的 future 中的一切都是线性发生的；并发发生在 futures **之间**。await `get_messages` 会要求其在返回接收端流之前发送所有的消息，包括消息之间的休眠延时。其结果是，超时将毫无用处。流本身没有任何的延时；它们甚至全都发生在流可用之前。

相反，我们保持 `get_messages` 为一个返回流的常规函数，并 spawn 一个任务来处理异步 `sleep` 调用。

> 注意：像这样调用 `spawn_task` 可以工作是因为我们已经设置了运行时；如果没有，则会造成 panic。其它的实现则选择了不同的权衡策略：它们可能会产生一个新的运行时来避免 panic 不过最终会有一些额外开销，有的则可能根本不提供一种独立的、脱离运行时引用的方式来 spawn 任务。请务必理解你的运行时所选择的权衡策略来编写相应的代码！

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

超时最终并不会阻止消息到达。我们仍然能够得到所有原始的消息，因为我们的信道是 **无限的**（**unbounded**）：它可以存储内存所允许的所有消息。如果消息在超时之前没有到达，流处理器会做出相应处理，不过当再次轮询流时，消息现在可能已经到达了。

如果需要的话可以通过使用不同的信道或者其他更通用的流来实现不同行为。让我们看一个实际的将一个表示时间间隔的流和这个消息流合并的例子。

### 合并流

首先，让我们创建另一个流，如果直接运行它的话它会每毫秒发送一个项。为了简单起见，我们可以使用 `sleep` 函数来延迟发送一个消息并采用与 `get_messages` 函数中从信道创建流时相同的方式来合并它们。区别是这一次，我们将发送已经过去的间隔次数，所以返回值类型将会是 `impl Stream<Item = u32>`，函数可以命名为 `get_intervals`（如示例 17-36 所示）。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-36/src/main.rs:intervals}}
```

<figcaption>示例 17-36：用一个会每毫秒触发一次的计数器来创建流</figcaption>

</figure>

我们以在任务中定义一个 `count` 作为开始。（我们也可以在任务外面定义它，不过限定任何变量的作用域会更明确。）接着我们创建一个无限循环。循环的每一次迭代会异步休眠一毫秒，递增计数器，并接着通过信道发送该值。因为这些全都封装在 `spawn_task` 创建的任务中，因此它们（包括无限循环）都会随着运行时的销毁而被清理。

这类在运行时被回收时才会结束的无限循环，在异步 Rust 中相当常见：很多程序需要无限地运行下去。通过异步编程，这不会阻塞任何其它内容，只要循环的每次迭代中有至少一个 await point。

现在回到 main 函数的异步代码块，我们可以尝试合并 `messages` 和 `intervals` 流，如示例 17-37 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-37/src/main.rs:main}}
```

<figcaption>示例 17-37：尝试合并 `messages` 和 `intervals` 流</figcaption>

</figure>

我们以调用 `get_intervals` 作为开始。接着通过 `merge` 方法合并 `messages` 和 `intervals` 流，它将多个流合并为一个从任何一个来源流的项可用时返回项的流，并且不会保持任何特定顺序。最后循环遍历合并后的流而不是 `messages`。

此时，`messages` 和 `intervals` 都不需要被 pin 住或是可变的，因为它们都会被合并进一个单一的 `merged` 流。然而，这个 `merge` 调用并不能编译！（`while let` 循环中的 `next` 调用也不行，稍后我们会回到这里。）这是因为两个流有着不同的类型。`messages` 流有着 `Timeout<impl Stream<Item = String>>` 类型，其中 `Timeout` 是在调用 `timeout` 时实现了 `Stream` 的类型。`intervals` 有着 `impl Stream<Item = u32>` 类型。为了合并这两个类型，我们需要将其中一个流转换以适配另一个流。我们将重构 `intervals` 流，因为 `messages` 流已经有了我们期望的基本形态而且我们必须处理超时错误（如示例 17-38 所示）。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch17-async-await/listing-17-38/src/main.rs:main}}
```

<figcaption>示例 17-38：将 `intervals` 流的类型与 `messages` 流对齐</figcaption>

</figure>

首先，我们可以使用 `map` 辅助方法将 `intervals` 转换为字符串。再次，我们需要匹配 `messages` 中的 `Timeout`。但是因为我们不 **希望** `intervals` 有超时，因此可以直接创建一个比其他超时时长更长的超时。这里通过 `Duration::from_secs(10)` 创建了一个十秒的超时。最后我们需要将 `stream` 变为可变，这样 `while let` 循环的 `next` 调用可以遍历流，并且需要 pin 住它才能安全地执行。这 **几乎** 到了我们需要的地方。每一个类型都检查正确了。但是，如果你运行它，这会有两个问题。第一，它永远也不会停止！你需要使用 <span class="keystroke">ctrl-c</span> 来停止它。第二，来自英文字母表的消息会淹没在所有的间隔计数消息之中：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the tasks running differently rather than
changes in the compiler -->

```text
--snip--
Interval: 38
Interval: 39
Interval: 40
Message: 'a'
Interval: 41
Interval: 42
Interval: 43
--snip--
```

示例 17-39 展示了一种解决最后两个问题的方法。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-39/src/main.rs:throttle}}
```

<figcaption>示例 17-39：使用 `throttle` and `take` 来处理合并后的流</figcaption>

</figure>

首先，我们在 `intervals` 流上使用 `throttle` 方法以便其不会淹没 `messages`。**限流**（**Throttling**）是一种限制函数被调用速率的方式，或者在本例中是限制流被轮询的频率。每 100 毫秒一次较为合适。因为这大概是消息到达的间隔。

为了限制我们从流接收的项的数量，可以在 `merged` 流上调用 `take` 方法，因为我们希望限制最终输出，而不仅仅是两个流中的某一个。

现在当我们运行程序时，它在从流中轮询 20 个项后停止，同时间隔不会淹没消息。我们也不会看到 `Interval: 100` 或 `Interval: 200` 等信息，而是 `Interval: 1`、`Interval: 2` 等等，即便来源流**可以**每毫秒产生一个事件。这是因为 `throttle` 调用产生了一个封装了原始流的新流，这样原始流只会在限制速率下而不是其 “原生” 速率下轮询。我们不会有大量未处理的间隔消息来选择性地丢弃，我们最开始就从未产生这些间隔消息！这又是 Rust 的 future 所固有的 “惰性” 在起作用，它允许我们自主选择程序的性能特点。

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
Interval: 1
Message: 'a'
Interval: 2
Interval: 3
Problem: Elapsed(())
Interval: 4
Message: 'b'
Interval: 5
Message: 'c'
Interval: 6
Interval: 7
Problem: Elapsed(())
Interval: 8
Message: 'd'
Interval: 9
Message: 'e'
Interval: 10
Interval: 11
Problem: Elapsed(())
Interval: 12
```

还有最后一个需要处理的问题：错误！有了这两个基于信道的流，当信道的另一端关闭时 `send` 方法可能会失败，这取决于运行时如何执行组成流的 future。直到现在为止，我们通过 `unwrap` 调用忽略了这种可能性。但在一个行为良好的应用程序中，我们应明确地处理该错误，至少应终止循环，以避免继续尝试发送消息。示例 17-40 展示了一个简单的错误处理策略：打印问题并从循环 `break` 出来。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-40/src/main.rs:errors}}
```

<figcaption>示例 17-40：处理错误并关闭循环</figcaption>

</figure>

同往常一样，正确处理消息发送失败的方式会有所不同：只要确保你有一个策略即可。

现在我们已经看过了很多异步实践，让我们稍作回顾，更深入地探讨一下 Rust 中用于实现异步的 `Future`、`Stream` 和其它关键 trait 的一些细节。

[17-02-messages]: ch17-02-concurrency-with-async.html#消息传递
[iterator-trait]: ch13-02-iterators.html#iterator-trait-和-next-方法
