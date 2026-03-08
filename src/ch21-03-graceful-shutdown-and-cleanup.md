## 优雅停机与清理

[ch21-03-graceful-shutdown-and-cleanup.md](https://github.com/rust-lang/book/blob/8aa0d003e6499d733d639de32d70f590efa48657/src/ch21-03-graceful-shutdown-and-cleanup.md)

示例 21-20 中的代码如我们所愿，借助线程池异步地响应请求。这里有一些关于 `workers`、`id` 和 `thread` 字段没有被直接使用的警告，这提醒了我们还有一些东西没有清理。当我们用不那么优雅的 <kbd>ctrl</kbd>-<kbd>c</kbd> 方式终止主线程时，其他所有线程也都会立刻停止，即便它们正处于处理请求的过程中。

接下来，我们要实现 `Drop` trait，在其中对线程池里的每个线程调用 `join`，这样它们就能在关闭前完成手头正在处理的请求。然后，我们还会实现一种方式，通知这些线程停止接收新请求并关闭。为了观察这些代码的实际效果，我们会修改 server，让它在优雅停机之前只接受两个请求。

这里有一点需要先注意：这一切都不会影响执行闭包的那部分代码，因此如果我们是在 async 运行时里使用线程池，这一节中的内容也完全相同。

### 为 `ThreadPool` 实现 `Drop` Trait

现在开始为线程池实现 `Drop`。当线程池被丢弃时，应该 join 所有线程以确保它们完成其操作。示例 21-22 展示了 `Drop` 实现的第一次尝试；这些代码还不能够编译：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch21-web-server/listing-21-22/src/lib.rs:here}}
```

<span class="caption">示例 21-22: 当线程池离开作用域时 join 每个线程</span>

这里首先遍历线程池中的每个 `worker`。之所以使用 `&mut`，是因为 `self` 是一个可变引用，而且我们还需要修改 `worker`。对于每个 `worker`，我们都会打印一条消息，说明该 `Worker` 实例正在关闭，然后对这个 `Worker` 实例中的线程调用 `join`。如果 `join` 调用失败，就用 `unwrap` 让 Rust panic，进入一种不够优雅的关闭方式。

```console
{{#include ../listings/ch21-web-server/listing-21-22/output.txt}}
```

这里的错误告诉我们不能调用 `join`，因为我们手里只有每个 `worker` 的可变借用，而 `join` 需要拿走其参数的所有权。要解决这个问题，我们需要把 `thread` 从拥有它的 `Worker` 实例中移出来，这样 `join` 才能消费这个线程。一种做法和示例 18-15 中类似：如果 `Worker` 存放的是 `Option<thread::JoinHandle<()>>`，就可以在这个 `Option` 上调用 `take` 方法，把值从 `Some` 变体中移出来，并在原地留下一个 `None`。换句话说，正在运行的 `Worker` 会在 `thread` 字段中持有一个 `Some`，而当我们想清理这个 `Worker` 时，就把 `Some` 替换成 `None`，这样这个 `Worker` 就不再持有可运行的线程。

然而，这种情况**只**会在丢弃 `Worker` 时出现。相应地，我们必须在任何访问 `worker.thread` 时处理 `Option<thread::JoinHandle<()>>`。在惯用的 Rust 代码中 `Option` 用的很多，但当你发现自己总是知道 `Option` 中一定会有值，却还要将其包装在 `Option` 中来应对这一场景时，就应该考虑其他更优雅的方法了。

在这个例子中，存在一个更好的替代方案：`Vec::drain` 方法。它接受一个 range 参数来指定哪些项要从 `Vec` 中移除，并返回一个这些项的迭代器。使用 `..` range 语法会从 `Vec` 中移除**所有**值。

因此我们需要像下面这样更新 `ThreadPool` 的 `drop` 实现：

<span class="filename">文件名：src/lib.rs</span>

```rust
{{#rustdoc_include ../listings/ch21-web-server/no-listing-04-update-drop-definition/src/lib.rs:here}}
```

这解决了编译器错误，而且不需要对我们的代码做任何其他修改。注意，因为 `drop` 可能在 panic 过程中被调用，这里的 `unwrap` 也可能再次 panic，造成双重 panic，并立刻让程序崩溃，中断正在进行的清理。对于示例程序来说这没问题，但在生产代码中并不推荐这样做。

### 向线程发出信号，让它们停止接收任务

有了这些修改后，我们的代码已经可以无警告编译。然而坏消息是，它还不能按我们期望的方式工作。关键在于 `Worker` 实例中线程所运行的闭包逻辑：目前我们确实调用了 `join`，但这并不会让线程停止，因为它们会永远 `loop` 下去寻找新任务。如果用当前这个 `drop` 实现去丢弃 `ThreadPool`，主线程会永远阻塞，等待第一个线程结束。

为了修复这个问题，我们将修改 `ThreadPool` 的 `drop` 实现并修改 `Worker` 循环。

首先修改 `ThreadPool` 的 `drop` 实现在等待线程结束前显式地丢弃 `sender`。示例 21-23 展示了 `ThreadPool` 显式丢弃 `sender` 所作的修改。与处理线程时不同，这里**确实**需要使用 `Option`，以便能够使用 `Option::take` 将 `sender` 从 `ThreadPool` 中移出。

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground,not_desired_behavior
{{#rustdoc_include ../listings/ch21-web-server/listing-21-23/src/lib.rs:here}}
```

<span class="caption">示例 21-23: 在 join `Worker` 线程之前显式丢弃 `sender`</span>

丢弃 `sender` 会关闭信道，这表明不会有更多的消息被发送。这时 `Worker` 实例中的无限循环中的所有 `recv` 调用都会返回错误。在示例 21-24 中，我们修改 `Worker` 循环在这种情况下优雅地退出，这意味着当 `ThreadPool` 的 `drop` 实现调用 `join` 时线程会结束。

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch21-web-server/listing-21-24/src/lib.rs:here}}
```

<span class="caption">示例 21-24: 当 `recv` 返回错误时显式跳出循环</span>

为了实践这些代码，如示例 21-25 所示修改 `main` 在优雅停机服务端之前只接受两个请求：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch21-web-server/listing-21-25/src/main.rs:here}}
```

<span class="caption">示例 21-25: 在处理两个请求之后通过退出循环来停止服务端</span>

你不会希望真实世界的 web 服务端只处理两次请求就停机了，这只是为了展示优雅停机和清理处于正常工作状态。

`take` 方法定义在 `Iterator` trait 上，它会把迭代限制为至多前两个元素。`ThreadPool` 会在 `main` 结束时离开作用域，随后 `drop` 实现就会运行。

使用 `cargo run` 启动服务端，并发起三个请求。第三个请求应该会失败，而终端的输出应该看起来像这样：

```console
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.41s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Shutting down.
Shutting down worker 0
Worker 3 got a job; executing.
Worker 1 disconnected; shutting down.
Worker 2 disconnected; shutting down.
Worker 3 disconnected; shutting down.
Worker 0 disconnected; shutting down.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
```

你看到的 `Worker` ID 和打印消息顺序可能会有所不同。我们可以从这些消息中看出代码是如何工作的：`Worker` 实例 0 和 3 处理了前两个请求。server 在接收到第二个连接后就停止接受新连接，而 `ThreadPool` 上的 `Drop` 实现甚至会在 `Worker` 3 真正开始处理任务之前就开始执行。丢弃 `sender` 会让所有 `Worker` 实例断开连接，并通知它们关闭。每个 `Worker` 实例在断开时都会打印一条消息，然后线程池会调用 `join`，等待每个 `Worker` 线程结束。

注意这个具体执行过程里有个有意思的地方：`ThreadPool` 丢弃了 `sender` 之后，在任何一个 `Worker` 收到错误之前，就先尝试去 join `Worker` 0。此时 `Worker` 0 还没有从 `recv` 得到错误，所以主线程会阻塞，等待 `Worker` 0 结束。与此同时，`Worker` 3 收到了一个任务，然后所有线程都会收到错误。当 `Worker` 0 完成后，主线程再等待其余 `Worker` 实例结束。那时，它们都已经退出循环并停止了。

恭喜！现在我们完成了这个项目，也有了一个使用线程池异步响应请求的基础 web 服务端。我们能对服务端执行优雅停机，它会清理线程池中的所有线程。

如下是完整的代码参考：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch21-web-server/no-listing-07-final-code/src/main.rs}}
```

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch21-web-server/no-listing-07-final-code/src/lib.rs}}
```

我们还能做得更多！如果你希望继续增强这个项目，如下是一些点子：

- 为 `ThreadPool` 和它的公有方法补充更多文档。
- 为这个库的功能添加测试。
- 把对 `unwrap` 的调用改成更健壮的错误处理。
- 用 `ThreadPool` 来执行除处理 web 请求之外的其他任务。
- 在 [crates.io](https://crates.io/) 上找一个线程池 crate，用它实现一个类似的 web server，然后比较它的 API 和鲁棒性与我们实现的线程池有何不同。

## 总结

好极了！你已经完成了本书的学习！由衷感谢你与我们一道踏上这段 Rust 之旅。现在你已经准备好实现自己的 Rust 项目并帮助他人了。请不要忘记我们的社区，这里有其他 Rustaceans 正乐于帮助你迎接 Rust 之路上的任何挑战。
