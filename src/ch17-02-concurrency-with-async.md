## 并发与 async

> [ch17-02-concurrency-with-async.md](https://github.com/rust-lang/book/blob/main/src/ch17-02-concurrency-with-async.md)
> <br>
> commit 62d441060d66f9a1c3d3cdfffa8eed40f817d1aa

在这一部分，我们将使用异步来应对一些与第十六章中通过线程解决的相同的并发问题。因为之前我们已经讨论了很多关键理念了，这一部分我们会专注于线程与 future 的区别。

在很多情况下，使用异步处理并发的 API 与使用线程的非常相似。在其它的一些情况，它们则非常不同。即便线程与异步的的 API *看起来* 很类似，通常它们有着不同的行为，同时它们几乎总是有着不同的性能特点。

### 计数

第十六章中我们应付的第一个任务是在两个不同的线程中计数。让我们用异步来完成相同的任务。`trpl` crate 提供了一个 `spawn_task` 函数，它看起来非常像 `thread::spawn` API，和一个 `sleep` 函数，这是 `thread::sleep` API 的异步版本。我们可以将它们结合使用，实现与线程示例相同的计数功能，如示例 17-6 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-06/src/main.rs:all}}
```

<figcaption>示例 17-6：使用 `spawn_task` 启动两个计数任务</figcaption>

</figure>

作为开始，我们在 `main` 函数中使用 `trpl::run`，这样我们的顶层函数可以是异步的。

> 注意：本章从现在开始，每一个示例的 `main` 中都会包含几乎相同的 `trpl::run` 封装代码，所以我们经常会连同 `main` 一同省略。别忘了在你的代码中加入它们！

接着我们在代码块中编写了两个循环，每个其中都有一个 `trpl::sleep` 调用，每一个都在发送下一个信息之前等待半秒（500 毫秒）。我们将一个循环放到 `trpl::spawn_task` 中并将另一个放在顶层的 `for` 循环中。我们也在 `sleep` 调用之后加入了一个 `await`。

这个实现与基于线程的版本类似，包括在运行时，你可能会在终端中看到消息以不同顺序出现的情况。

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
hi number 1 from the second task!
hi number 1 from the first task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
```

这个版本在 main 中的异步代码块中 for 循环结束后就停止了，因为当 main 函数结束时 `spawn_task` 产生的任务就会关闭。如果运行该任务直到结束，你需要使用一个 join 句柄（join handle）来等待第一个任务完成。对于线程来说，可以使用 `join` 方法来 “阻塞” 直到线程结束运行。在示例 17-7 中，我们可以使用 `await` 来实现相同的效果，因为任务句柄本身是一个 future。它的 `Output` 类型是一个 `Result`，所以我们还需要 unwrap 来 await 它。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-07/src/main.rs:handle}}
```

<figcaption>示例 17-7：在一个 join 句柄上使用 `await` 使得任务运行直到结束</figcaption>

</figure>

更新后的版本会运行 *两个* 循环直到结束。

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
hi number 1 from the second task!
hi number 1 from the first task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
hi number 6 from the first task!
hi number 7 from the first task!
hi number 8 from the first task!
hi number 9 from the first task!
```

目前为止，看起来异步和线程版本给出了基本一样的输出，它们只是使用了不同的语法：在 join 句柄上使用 `await` 而不是调用 `join`，和 await `sleep` 调用。

最大的区别在于无需再产生另一个操作系统线程来进行工作。事实上，我们甚至不需要产生一个任务。因为异步代码块会编译为匿名 future，我们可以将每一个循环放进一个异步代码块并使用 `trpl::join` 方法来让运行时将它们两个都运行至完成。

在第十六章中，我们展示了如何在 `std::thread::spawn` 调用返回的 `JoinHandle` 类型上调用 `join` 方法。`trpl::join` 函数也类似，不过它作用于 future。当你传递两个 future，它会产生单独一个 future 但它的输出是一个元组，当 *两者* 都完成时其中有每一个传递给它的 future 的输出。因此，在示例 17-8 中，我们使用 `trpl::join` 来等待 `fut1` 和 `fut2` 都结束。我们 *没有* await `fut1` 和 `fut2`，而是等待 `trpl::join` 新产生的 future。我们忽略其输出，因为它只是一个包含两个单元值（unit value）的元组。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-08/src/main.rs:join}}
```

<figcaption>示例 17-8：使用 `trpl::join` 来 await 两个匿名 future</figcaption>

</figure>

当运行代码我们会看到两个 future 会运行至结束：

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
hi number 1 from the first task!
hi number 1 from the second task!
hi number 2 from the first task!
hi number 2 from the second task!
hi number 3 from the first task!
hi number 3 from the second task!
hi number 4 from the first task!
hi number 4 from the second task!
hi number 5 from the first task!
hi number 6 from the first task!
hi number 7 from the first task!
hi number 8 from the first task!
hi number 9 from the first task!
```

这里，你每次都会看到完全相同的顺序，这与我们在线程中看到的情况非常不同。这是因为 `trpl::join` 函数是 *公平的*（*fair*），这意味着它以相同的频率检查每一个 future，使它们交替执行，绝不会让一个任务在另一个任务准备好时抢先执行。对于线程来说，操作系统会决定该检查哪个线程和会让它运行多长时间。对于异步 Rust 来说，运行时决定检查哪一个任务。（在实践中，细节会更为复杂，因为异步运行时可能在底层使用操作系统线程来作为其并发管理的一部分，因此要保证公平性可能会增加运行时的工作量，但这仍然是可行的！）运行时无需为任何操作保证公平性，同时运行时也经常提供不同的 API 来让你选择是否需要公平性。

尝试这些不同的 await future 的变体来观察它们的效果：

- 去掉一个或者两个循环外的异步代码块。
- 在定义两个异步代码块后立刻 await 它们。
- 只将第一个循环封装进异步代码块，并在第二个循环体之后 await 作为结果的 future。

作为额外的挑战，看看你能否在运行代码 *之前* 想出每个情况下的输出！

### 消息传递

在 future 之间共享数据也与线程类似：我们会再次使用消息传递，不过这次使用的是异步版本的类型和函数。我们会采用与之前第十六章中使用的稍微不同的方法，来展示一些基于线程的并发与基于 future 的并发之间的关键差异。在示例 17-9 中，我们会从仅有一个异步代码块开始，*不像* 之前产生独立线程那样产生一个独立的任务。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-09/src/main.rs:channel}}
```

<figcaption>示例 17-9：创建一个异步信道（async channel）并赋值其两端为 `tx` 和 `rx`</figcaption>

</figure>

这里我们使用了 `trpl::channel`，一个第十六章用于线程的多生产者、单消费者信道 API 的异步版本。异步版本的 API 与基于线程的版本只有一点微小的区别：它使用一个可变的而不是不可变的 `rx`，并且它的 `recv` 方法产生一个需要 await 的 future 而不是直接返回值。现在我们可以发送端向接收端发送消息了。注意我们无需产生一个独立的线程或者任务；只需等待（await） `rx.recv` 调用。

`std::mpsc::channel` 中的同步 `Receiver::recv` 方法阻塞执行直到它接收一个消息。`trpl::Receiver::recv` 则不会阻塞，因为它是异步的。不同于阻塞，它将控制权交还给运行时，直到接收到一个消息或者信道的发送端关闭。相比之下，我们不用 await `send`，因为它不会阻塞。也无需阻塞，因为信道的发送端的数量是没有限制的。

> 注意：因为所有这些异步代码都运行在一个 `trpl::run` 调用的异步代码块中，其中的所有代码可以避免阻塞。然而，*外面* 的代码会阻塞到 `run` 函数返回。这正是 `trpl::run` 函数的全部意义：它允许你 *选择* 在何处阻塞一部分异步代码，也就是在何处进行同步和异步代码的转换。这正是在大部分运行时中 `run` 实际上被命名为 `block_on` 的原因。

请注意这个示例中的两个地方：首先，消息立刻就会到达！其次，虽然我们使用了 future，但是这里还没有并发。示例中的所有事情都是顺序发生的，就像没涉及到 future 时一样。

让我们通过发送一系列消息并在之间休眠来解决第一个问题，如示例 17-10 所示：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-10/src/main.rs:many-messages}}
```

<figcaption>示例 17-10：通过异步信道发送和接收多个消息并在每个消息之间通过 `await` 休眠</figcaption>

</figure>

除了发送消息之外，我们还需要接收它们。在这个例子中我们可以手动接收，就是调用四次 `rx.recv().await`，因为我们知道进来了多少条消息。然而，在现实世界中，我们通常会等待 *未知* 数量的消息。这时我们需要一直等待直到可以确认没有更多消息了为止。

在示例 16-10 中，我们使用了 `for` 循坏来处理从异步信道接收的所有消息。然而，Rust 目前还没有在 *异步* 序列上编写 `for` 循环的方法。取而代之的是，我们需要一个我们还没有见过的新循环类型，即 `while let` 条件循环。`while let` 循环是我们在第六章中见过的 `if let` 结构的循环版本。只要其指定的模式持续匹配循环就会一直执行。

`rx.recv` 调用产生一个 `Future`，我们会 await 它。运行时会暂停 `Future` 直到它就绪。一旦消息到达，future 会解析为 `Some(message)`，每次消息到达时都会如此。。当信道关闭时，不管是否有 *任何* 消息到达，future 都会解析为 `None` 来表明没有更多的值了，我们也就应该停止轮询，也就是停止等待。

`while let` 循环将上述逻辑整合在一起。如果 `rx.recv().await` 调用的结果是 `Some(message)`，我们会得到消息并可以在循环体中使用它，就像使用 `if let` 一样。如果结果是 `None`，则循环停止。每次循环执行完毕，它会再次触发 await point，如此运行时会再次暂停直到另一条消息到达。

现在代码可以成功发送和接收所有的消息了。不幸的是，这里还有一些问题。首先，消息并不是按照半秒的间隔到达的。它们在程序启动后两秒（2000 毫秒）后立刻一起到达。其次，程序永远也不会退出！相反它会永远等待新消息。你会需要使用 <span class="keystroke">ctrl-c</span> 来关闭它。

让我们开始理解为何消息在全部延迟后立刻一起到达，而不是逐个在延迟后到达。在一个给定的异步代码块，`await` 关键字在代码中出现的顺序也就是程序执行时其发生的顺序。

示例 17-10 中只有一个异步代码块，所以所有的代码线性地执行。这里仍然没有并发。所有 `tx.send` 调用与 `trpl::sleep` 调用及其相关的 await point 是依次进行的。只有在此之后 `while let` 循环才开始执行 `recv` 调用上的 `await` point。

为了得到我们需要的行为，在接收每条消息之间引入休眠延迟，我们需要将 `tx` 和 `rx` 操作放置于它们各自的异步代码块中。这样运行时就可以使用 `trpl::join` 来分别执行它们，就像在计数示例中一样。我们再一次 await `trpl::join` 调用的结果，而不是它们各自的 future。如果我们顺序地 await 单个 future，则就又回到了一个顺序流，这正是我们 *不* 希望做的。

<!-- We cannot test this one because it never stops! -->

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch17-async-await/listing-17-11/src/main.rs:futures}}
```

<figcaption>示例 17-11：将 `send` 和 `recv` 分隔到其各自的 `async` 代码块中并 await 这些代码块的 future</figcaption>

</figure>

采用示例 17-11 中的更新后的代码，消息会以 500 毫秒的间隔打印，而不是在两秒后就全部一起打印。

但是程序仍然永远也不会退出，这是由于 `while let` 循环与 `trpl::join` 的交互方式所致：

- `trpl::join` 返回的 future 只会完成一次，即传递的 *两个* future 都完成的时候。
- `tx` future 在发送 `vals` 中最后一条消息之后的休眠结束后立刻完成。
- `rx` future 直到 `while let` 循环结束之前都不会完成。
- 当信道的另一端关闭后 await `rx.recv` 将只会返回 `None`。
- 信道只有在调用 `rx.close` 或者发送端 `tx` 被丢弃时才会关闭。
- 我们没有在任何地方调用 `rx.close`，并且 `tx` 直到传递给 `trpl::run` 的最外层异步代码块结束前都不会被丢弃。
- 代码块不能结束是因为它阻塞在了等待 `trpl::join` 完成，这就又回到了列表的开头！

我们可以在代码的某处调用 `rx.close` 来手动关闭 `rx`，不过这并没有太多意义。在处理了任意数量的消息后停止可以使程序停止，但是可能会丢失消息。我们需要其它的手段来确保 `tx` 在函数的结尾 *之前* 被丢弃。

目前发送消息的异步代码块只是借用了 `tx`，因为发送消息并不需要其所有权，但是如果我们可以将 `tx` 移动（move）进异步代码快，它会在代码块结束后立刻被丢弃。在第十三章中我们学习了如何在闭包上使用 `move` 关键字，在第十六章中，我们知道了使用线程时经常需要移动数据进闭包。同样的基本原理也适用于异步代码块，因此 `move` 关键字也能像闭包那样作用于异步代码块。

在示例 17-12 中，我们将发送消息的异步代码块从普通的 `async` 代码块修改为 `async move` 代码块。当运行 *这个* 版本的代码时，它会在发送和接收完最后一条消息后优雅地关闭。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-12/src/main.rs:with-move}}
```

<figcaption>示例 17-12：一个可以工作的在 future 之间接收和发送消息的示例，其在结束后会正确地关闭</figcaption>

</figure>

这个异步信道也是一个多生产者信道，所以如果希望从多个 future 发送消息可以调用 `tx` 上的 `clone` 方法。在示例 17-13 中，我们克隆了 `tx`，在第一个异步代码块外面创建 `tx1`。我们像第一个 `tx` 一样将 `tx1` 移动进代码块。接下来，将原始的 `tx` 移动进一个 *新的* 异步代码块，其中会用一个稍微更长的延迟发送更多的消息。我们碰巧将新代码块放在接收消息的异步代码块之后，不过也可以放在之前。关键在于 future 被 await 的顺序，而不是它们创建的顺序。

两个发送消息的异步代码块需要是 `async move` 代码块，如此 `tx` 和 `tx1` 都会在代码块结束后被丢弃。否则我们就会陷入到开始时同样的无限循环。最后，我们从 `trpl::join` 切换到 `trpl::join3` 来处理额外的 future。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-13/src/main.rs:here}}
```

<figcaption>示例 17-13：通过多个异步代码块使用多个发送者</figcaption>

</figure>

现在我们会看到所有来在两个发送 future 的消息。因为发送 future 采用了稍微不同的发送延迟，消息也会以这些不同的延迟接收。

<!-- Not extracting output because changes to this output aren't significant;
the changes are likely to be due to the threads running differently rather than
changes in the compiler -->

```text
received 'hi'
received 'more'
received 'from'
received 'the'
received 'messages'
received 'future'
received 'for'
received 'you'
```

这是一个良好的开始，不过它将我们限制到少数几个 future：`join` 两个，或者 `join3` 三个。让我们看下如何处理更多的 future。

[streams]: ch17-05-streams.html
