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
- 直将第一个循环封装进异步代码块，并在第二个循环体之后 await 作为结果的 future。

作为额外的挑战，看看你能否在运行代码 *之前* 想出每个情况下的输出！

### 消息传递

在 future 之间共享数据也与线程类似：我们会再次使用消息传递，不过会使用异步版本的类型和函数。我们会采用与之前第十六章中使用的稍微不同的方法，来展示一些基于线程的并发与基于 future 的并发之间的关键不同。在示例 17-9 中，我们会从仅有一个异步代码块开始，*不像* 产生独立线程那样产生一个独立的任务。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-09/src/main.rs:channel}}
```

<figcaption>示例 17-9：创建一个异步信道（async channel）并赋值其两端为 `tx` 和 `rx`</figcaption>

</figure>

这里我们使用了 `trpl::channel`，一个第十六章用于现场的多生产者、单消费者信道 API 的异步版本。异步版本的 API 与基于线程的版本只有一点微小的区别：它使用一个可变的而不是不可变的 `rx`，并且它的 `recv` 方法产生一个需要 await 的 future 而不是直接返回值。现在我们可以发送端向接收端发送消息了。注意我们无需产生一个独立的线程或者任务；只需等待（await） `rx.recv` 调用。

`std::mpsc::channel` 中的同步 `Receiver::recv` 方法阻塞执行直到它接收一个消息。`trpl::Receiver::recv` 则不会阻塞，因为它是异步的。不同于阻塞，它将控制权交还给运行时直到接收到一个消息或者信道的发送端关闭。与此相对，我们不用 await `send`，因为它不阻塞。它也不需要，因为信道的发送端的数量是没有限制的。

> 注意：因为所有这些异步代码都运行在一个 `trpl::run` 调用的异步代码块中，其中的所有代码可以避免阻塞。然而，*外面* 的代码会阻塞到 `run` 函数返回。这是 `trpl::run` 函数的全部意义：它允许你 *选择* 在何处阻塞一部分异步代码，也就是在何处进行同步和异步代码的转换。这正是在大部分运行时中 `run` 实际上被命名为 `block_on` 的原因。

注意这个示例中的两个地方：首先，消息立刻就会到达！第二，虽然我们使用了 future，但是这里还没有并发。示例中的所有事情都是顺序发生的，就像没涉及到 future 时一样。

让我们通过发送一系列消息并在之间休眠来解决第一个问题，如示例 17-10 所示：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-09/src/main.rs:channel}}
```

<figcaption>示例 17-10：通过异步信道发送和接收多个消息并在每个消息之间通过 `await` 休眠</figcaption>

</figure>

除了发送消息之外，我们需要接收它们。
