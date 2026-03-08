## 使用 async 实现并发

[ch17-02-concurrency-with-async.md](https://github.com/rust-lang/book/blob/f78ab89d7545ac17780e6a367055cc089f4cd2ec/src/ch17-02-concurrency-with-async.md)

在这一部分，我们将使用异步来应对一些与第十六章中通过线程解决的相同的并发问题。因为之前我们已经讨论了很多关键理念了，这一部分我们会专注于线程与 future 的区别。

在很多情况下，使用异步处理并发的 API 与使用线程的非常相似。在其它的一些情况，它们则非常不同。即便线程与异步的 API *看起来* 很类似，通常它们有着不同的行为，同时它们几乎总是有着不同的性能特点。

### 使用 `spawn_task` 创建新任务

第十六章中我们应付的第一个任务是在两个不同的线程中计数。让我们用异步来完成相同的任务。`trpl` crate 提供了一个 `spawn_task` 函数，它看起来非常像 `thread::spawn` API，和一个 `sleep` 函数，这是 `thread::sleep` API 的异步版本。我们可以将它们结合使用，实现与线程示例相同的计数功能，如示例 17-6 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-06/src/main.rs:all}}
```

<figcaption>示例 17-6：创建一个新任务，在主任务打印内容的同时打印另一组内容</figcaption>

</figure>

作为起点，我们在 `main` 函数中使用 `trpl::block_on`，这样顶层函数就可以写成 async 风格。

> 注意：从这里开始，本章中的每个示例在 `main` 中都会包含这段几乎完全一样的 `trpl::block_on` 包装代码，所以之后我们通常会像省略 `main` 一样把它省掉。记得在你自己的代码里补上它！

然后我们在这个代码块里写了两个循环，每个循环中都调用了 `trpl::sleep`，在输出下一条消息之前等待半秒（500 毫秒）。其中一个循环放在 `trpl::spawn_task` 的函数体里，另一个则放在顶层的 `for` 循环中。我们还在 `sleep` 调用后加上了 `await`。

这段代码的行为和线程版实现很像，包括当你亲自运行时，终端中的消息顺序可能和这里不完全一样：

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

这个版本会在主 async 块中的 `for` 循环一结束就停止，因为当 `main` 函数结束时，由 `spawn_task` 生成的任务也会被关闭。如果你想让它一直运行到任务自身完成，就需要使用 join handle 来等待第一个任务结束。在线程的版本中，我们使用 `join` 方法“阻塞”等待线程运行结束。在示例 17-7 中，我们可以使用 `await` 做同样的事，因为任务句柄本身就是一个 future。它的 `Output` 类型是 `Result`，所以在等待之后还要再 `unwrap` 一次。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-07/src/main.rs:handle}}
```

<figcaption>示例 17-7：在 join 句柄上使用 `await`，让任务运行到完成</figcaption>

</figure>

更新后的版本会一直运行到*两个*循环都完成为止：

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

到目前为止，看起来 async 和线程只是用不同语法实现了相似效果：在 join handle 上使用 `await`，而不是调用 `join`；同时对 `sleep` 调用也使用 `await`。

更大的不同在于，我们根本不需要再创建另一个操作系统线程来做这件事。实际上，这里甚至连任务都不一定要创建。因为 async 代码块会被编译成匿名 future，我们可以把每个循环都放进一个 async 代码块里，然后让运行时使用 `trpl::join` 让它们都执行到完成。

在第十六章[“等待所有线程完成”][join-handles]一节中，我们展示了如何对 `std::thread::spawn` 返回的 `JoinHandle` 调用 `join` 方法。`trpl::join` 与之类似，不过它面向的是 future。当你把两个 future 传给它时，它会生成一个新的 future；等到*两个*传入的 future 都完成时，这个新 future 的输出就是一个包含它们各自输出值的元组。因此，在示例 17-8 中，我们用 `trpl::join` 来等待 `fut1` 和 `fut2` 完成。我们*不会*分别等待 `fut1` 和 `fut2`，而是等待 `trpl::join` 生成的那个新 future。这里我们忽略它的输出，因为那不过是一个包含两个 unit 值的元组。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-08/src/main.rs:join}}
```

<figcaption>示例 17-8：使用 `trpl::join` 等待两个匿名 future</figcaption>

</figure>

运行后，我们会看到两个 future 都执行到了结束：

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

现在你会发现，每次运行时顺序都完全一样，这和线程版本以及示例 17-7 中使用 `trpl::spawn_task` 的情况非常不同。这是因为 `trpl::join` 是 *fair* 的，也就是它会以同样的频率检查每一个 future，在它们之间交替进行；只要另一个 future 已经就绪，它就不会让其中一个一路领先。在线程模型下，由操作系统决定先检查哪个线程、让它运行多久。对于 async Rust，则由运行时决定先检查哪个任务。（在实践中，细节会复杂得多，因为异步运行时可能会在底层借助操作系统线程来实现并发，因此要保证公平性，对运行时来说可能意味着更多工作，但这仍然是可能做到的。）运行时并不一定会为任何给定操作都保证公平性，而且它们通常会提供不同的 API，让你自行决定是否需要公平性。

尝试这些不同的 await future 的变体来观察它们的效果：

- 去掉一个或者两个循环外的异步代码块。
- 在定义两个异步代码块后立刻 await 它们。
- 只将第一个循环封装进异步代码块，并在第二个循环体之后 await 作为结果的 future。

作为额外的挑战，看看你能否在运行代码 *之前* 想出每个情况下的输出！

<!-- Old headings. Do not remove or links may break. -->

<a id="message-passing"></a>
<a id="counting-up-on-two-tasks-using-message-passing"></a>

### 通过消息传递在两个任务之间发送数据

在 future 之间共享数据的方式也会让你感到熟悉：我们再次使用消息传递，只不过这次使用的是异步版本的类型和函数。为了展示基于线程的并发和基于 future 的并发之间的一些关键差别，我们会和第十六章[“通过消息传递在线程间传送数据”][message-passing-threads]一节稍微走一条不一样的路线。在示例 17-9 中，我们先只使用一个 async 代码块，而*不*像之前那样显式地创建一个独立任务。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-09/src/main.rs:channel}}
```

<figcaption>示例 17-9：创建一个异步信道（async channel）并赋值其两端为 `tx` 和 `rx`</figcaption>

</figure>

这里我们使用了 `trpl::channel`，一个第十六章用于线程的多生产者、单消费者信道 API 的异步版本。异步版本的 API 与基于线程的版本只有一点微小的区别：它使用一个可变的而不是不可变的 `rx`，并且它的 `recv` 方法产生一个需要 await 的 future 而不是直接返回值。现在我们可以发送端向接收端发送消息了。注意我们无需产生一个独立的线程或者任务；只需等待（await） `rx.recv` 调用。

`std::mpsc::channel` 中的同步 `Receiver::recv` 方法阻塞执行直到它接收一个消息。`trpl::Receiver::recv` 则不会阻塞，因为它是异步的。不同于阻塞，它将控制权交还给运行时，直到接收到一个消息或者信道的发送端关闭。相比之下，我们不用 await `send`，因为它不会阻塞。也无需阻塞，因为信道的发送端的数量是没有限制的。

> 注意：因为这些 async 代码都运行在传给 `trpl::block_on` 的 async 代码块里，所以块中的所有内容都可以避免阻塞。不过，块*外部*的代码则会阻塞，直到 `block_on` 返回为止。这正是 `trpl::block_on` 的意义所在：它让你可以*选择*在哪一处对一组 async 代码进行阻塞，从而也就决定了在什么地方切换同步和异步代码。

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

在示例 16-10 中，我们使用 `for` 循环处理从同步信道接收到的所有条目。不过，Rust 目前还没有办法对*异步产生的*一系列条目使用 `for` 循环。因此，我们需要一种前面还没见过的循环：`while let` 条件循环。它正是我们在第六章[“使用 `if let` 和 `let...else` 实现简洁控制流”][if-let]中见过的 `if let` 结构的循环版本。只要它指定的模式还在持续匹配，循环就会继续执行。

`rx.recv` 调用产生一个 `Future`，我们会 await 它。运行时会暂停 `Future` 直到它就绪。一旦消息到达，future 会解析为 `Some(message)`，每次消息到达时都会如此。当信道关闭时，不管是否有 *任何* 消息到达，future 都会解析为 `None` 来表明没有更多的值了，我们也就应该停止轮询，也就是停止等待。

`while let` 循环将上述逻辑整合在一起。如果 `rx.recv().await` 调用的结果是 `Some(message)`，我们会得到消息并可以在循环体中使用它，就像使用 `if let` 一样。如果结果是 `None`，则循环停止。每次循环执行完毕，它会再次触发 await point，如此运行时会再次暂停直到另一条消息到达。

现在代码可以成功发送和接收所有的消息了。不幸的是，这里还有一些问题。首先，消息并不是按照半秒的间隔到达的。它们在程序启动后两秒（2000 毫秒）后立刻一起到达。其次，程序永远也不会退出！相反它会永远等待新消息。你会需要使用 <span class="keystroke">ctrl-c</span> 来关闭它。

#### 一个 async 代码块中的代码会线性执行

先来看为什么这些消息会在完整延迟之后一起到达，而不是在每次延迟之后逐条到达。在一个给定的 async 代码块里，代码中 `await` 出现的顺序，也就是程序运行时它们执行的顺序。

示例 17-10 中只有一个 async 代码块，所以里面的一切都按线性顺序执行。这里依然没有并发。所有 `tx.send` 调用，连同 `trpl::sleep` 调用及其相应的 await 点，都会先全部依次发生。只有在那之后，`while let` 循环才有机会开始执行 `recv` 调用上的那些 await 点。

为了得到我们真正想要的行为，也就是在每条消息之间都出现休眠间隔，我们需要把 `tx` 和 `rx` 的操作分别放进各自的 async 代码块中，如示例 17-11 所示。这样运行时就可以像示例 17-8 那样，使用 `trpl::join` 分别执行它们。我们再次等待的是 `trpl::join` 调用的结果，而不是分别等待每个 future。要是依次等待它们，我们就又回到了顺序执行的流程，这正是我们*不*想要的。

<!-- We cannot test this one because it never stops! -->

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch17-async-await/listing-17-11/src/main.rs:futures}}
```

<figcaption>示例 17-11：将 `send` 和 `recv` 分隔到其各自的 `async` 代码块中并 await 这些代码块的 future</figcaption>

</figure>

使用示例 17-11 中更新后的代码后，消息就会以 500 毫秒的间隔输出，而不是在 2 秒之后一次性全部打印出来。

#### 将所有权移入 async 代码块

但是程序仍然永远也不会退出，这是由于 `while let` 循环与 `trpl::join` 的交互方式所致：

- `trpl::join` 返回的 future 只会完成一次，即传递的 *两个* future 都完成的时候。
- `tx_fut` future 会在发送完 `vals` 中最后一条消息后，再完成最后一次休眠之后结束。
- `rx_fut` future 则要等到 `while let` 循环结束时才会结束。
- 只有当等待 `rx.recv` 的结果变成 `None` 时，`while let` 循环才会结束。
- 只有在信道另一端关闭后，等待 `rx.recv` 才会返回 `None`。
- 只有在我们调用 `rx.close`，或者发送端 `tx` 被 drop 时，信道才会关闭。
- 我们根本没有调用 `rx.close`，而 `tx` 也要等到传给 `trpl::block_on` 的最外层 async 代码块结束后才会被 drop。
- 但那个最外层 async 代码块又必须等 `trpl::join` 完成才能结束，于是我们就又回到了这个列表的起点。

目前，发送消息的那个 async 代码块只是*借用*了 `tx`，因为发送消息并不需要取得它的所有权。但如果我们能把 `tx` *move* 进那个 async 代码块里，那么一旦该代码块结束，`tx` 就会被 drop。在第十三章[“捕获引用或移动所有权”][capture-or-move]中，你学过如何在闭包上使用 `move` 关键字；而正如第十六章[“将 `move` 闭包与线程一同使用”][move-threads]一节提到的那样，在线程场景下我们也经常需要把数据 move 进闭包。相同的基本原理也适用于 async 代码块，因此 `move` 关键字同样可以和 async 代码块一起使用。

在示例 17-12 中，我们把发送消息用的代码块从 `async` 改为 `async move`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-12/src/main.rs:with-move}}
```

<figcaption>示例 17-12：对示例 17-11 的修改版本，它会在完成后正确关闭</figcaption>

</figure>

运行*这个*版本的代码后，它就会在最后一条消息发送并接收完之后正常退出。接下来，我们来看看，如果要从多个 future 发送数据，又需要做哪些变化。

#### 使用 `join!` 宏合并多个 future

这个异步信道同样也是多生产者信道，因此如果我们希望从多个 future 发送消息，就可以对 `tx` 调用 `clone`，如示例 17-13 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-13/src/main.rs:here}}
```

<figcaption>示例 17-13：在 async 代码块中使用多个生产者</figcaption>

</figure>

首先，我们克隆 `tx`，在第一个 async 代码块外创建出 `tx1`。然后像之前处理 `tx` 那样，把 `tx1` move 进这个代码块里。随后，我们再把原始的 `tx` move 进一个*新的* async 代码块，在那里以稍慢一点的节奏继续发送更多消息。这里我们把这个新 async 代码块放在接收消息的 async 代码块后面，不过放在前面也同样可以。关键在于 future 被等待的顺序，而不是它们被创建的顺序。

两个负责发送消息的 async 代码块都必须写成 `async move`，这样当代码块结束时，`tx` 和 `tx1` 都会被 drop。否则，我们又会回到一开始那个无限循环的问题。

最后，我们从 `trpl::join` 切换为 `trpl::join!` 来处理新增的 future。`join!` 宏可以在 future 数量已知于编译期的情况下，等待任意数量的 future。本章稍后我们还会讨论，如何等待一个数量事先未知的 future 集合。

现在我们就能看到来自两个发送 future 的所有消息了。由于这两个发送 future 在发送后使用了略微不同的延迟，接收到这些消息的时间间隔也会相应不同：

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

我们已经探索了如何用消息传递在 future 之间发送数据、一个 async 代码块中的代码如何按顺序执行、如何将所有权 move 进 async 代码块，以及如何合并多个 future。接下来，我们来讨论一下，为什么以及如何告诉运行时：它现在可以切换去执行别的任务了。

[thread-spawn]: ch16-01-threads.html#使用-spawn-创建新线程
[join-handles]: ch16-01-threads.html#等待所有线程结束
[message-passing-threads]: ch16-02-message-passing.html
[if-let]: ch06-03-if-let.html
[capture-or-move]: ch13-01-closures.html#捕获引用或移动所有权
[move-threads]: ch16-01-threads.html#将-move-闭包与线程一同使用
