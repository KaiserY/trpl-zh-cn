## 并发与 async

> [ch17-02-concurrency-with-async.md](https://github.com/rust-lang/book/blob/main/src/ch17-02-concurrency-with-async.md)
> <br>
> commit 62d441060d66f9a1c3d3cdfffa8eed40f817d1aa

在这一部分，我们采用异步来应对一些之前第十六章中采用并发面对的相同的问题。因为之前我们已经讨论了很多关键理念了，这一部分我们会专注于线程与 future 的区别。

在很多情况下，使用异步处理并发的 API 与使用线程的非常相似。在其它的一些情况，它们则非常不同。即便线程与异步的的 API *看起来* 很类似，通常它们有着不同的行为，同时它们几乎总是有着不同的性能特点。

### 计数

第十六章中我们应付的第一个任务是在两个不同的线程中计数。让我们用异步来做相同的事。`trpl` crate 提供了一个 `spawn_task` 函数，它看起来非常像 `thread::spawn` API，和一个 `sleep` 函数，这是 `thread::sleep` API 的异步版本。我们可以结合它们来实现与采用线程的相同的计数示例，如示例 17-6 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-06/src/main.rs:all}}
```

<figcaption>示例 17-6：使用 `spawn_task` 启动两个计数任务</figcaption>

</figure>

作为开始，我们在 `main` 函数中使用 `trpl::run`，这样我们的顶层函数可以是异步的。

> 注意：本章从现在开始，每一个示例的 `main` 中都会包含几乎相同的 `trpl::run` 封装代码，所以我们经常会连同 `main` 一同省略。别忘了在你的代码中加入它们！

接着我们在代码块中编写了两个循环，每个其中都有一个 `trpl::sleep` 调用，每一个都在发送下一个信息之前等待半秒钟（500 毫秒）。我们将一个循环放到 `trpl::spawn_task` 中并将另一个放在顶层的 `for` 循环中。我们也在 `sleep` 调用之后加入了一个 `await`。

它做了与基于线程的版本相同的工作，也包括运行时你可能在终端看到消息以不同的顺序出现的事实。

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

这个版本在 main 中的异步代码块中 for 循环结束后就停止了，因为当 main 函数结束时 `spawn_task` 产生的任务就会关闭。如果运行该任务直到结束，你需要使用一个 join 句柄（join handle）来等待第一个任务完成。对于线程来说，可以使用 `join` 方法来 “阻塞” 直到线程结束运行。在示例 17-7 中，我们可以使用 `await` 来做相同的事情，因为任务句柄本身是一个 future。它的 `Output` 类型是一个 `Result`，所以我们还需要 unwrap 来 await 它。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-07/src/main.rs:handle}}
```

<figcaption>示例 17-7：在一个 join 句柄上使用 `await` 使得任务运行直到结束</figcaption>

</figure>

更新后的版本会运行 *两个* 任务直到结束。

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

最大的区别是无需再产生另一个操作系统线程来进行工作。事实上，我们甚至不需要产生一个任务。因为异步代码块会编译为匿名 future，我们可以将每一个循环放进一个异步代码块并使用 `trpl::join` 方法来让运行时将它们两个都运行至完成。

在第十六章中，我们展示了如何在 `std::thread::spawn` 调用返回的 `JoinHandle` 类型上调用 `join` 方法。`trpl::join` 函数也类似，不过它作用于 future。当你传递两个 future，它会产生单独一个 future 但它的输出是一个元组，当 *两者* 都完成时其中有每一个传递给它的 future 的输出。因此，在示例 17-8 中，我们使用 `trpl::join` 来等待 `fut1` 和 `fut2` 都结束。我们 *没有* await `fut1` 和 `fut2`，而是等待 `trpl::join 新产生的 future。我们忽略其输出，因为它只是一个包含两个单元值（unit value）的元组。

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

这里，你每次都会看到完全相同的顺序，这与我们在线程中看到非常不同。这是因为 `trpl::join` 函数是 *公平的*（*fair*），这意味着它检查每一个 future 的频率一致，使它们交替执行，绝不会让一个任务在其它任务完成后抢先执行。对于线程来说，操作系统会决定该检查哪个线程和会让它运行多长时间。对于异步 Rust 来说，运行时决定检查哪一个任务。（在实践中，细节会更为复杂，因为异步运行时可能在底层使用操作系统线程来作为其并发管理的一部分，所以确保公平性需要比运行时更多的工作，不过这也是可能的！）运行时无需为任何操作保证公平性，同时运行时也经常提供不同的 API 来让你选择是否需要公平性。

尝试这些不同的 await future 的变体来观察它们做了什么：

- 去掉一个或者两个循环外的异步代码块。
- 在定义两个异步代码块后立刻 await 它们。
- 直将第一个循环封装进异步代码块，并在第二个循环体之后 await 作为结果的 future。

作为额外的挑战，看看你能否在运行代码 *之前* 想出每个情况下的输出！
