## 优雅停机与清理

<!-- https://github.com/rust-lang/book/blob/main/src/ch21-03-graceful-shutdown-and-cleanup.md -->
<!-- commit 5d22a358fb2380aa3f270d7b6269b67b8e44849e -->

示例 21-20 中的代码如期通过使用线程池异步的响应请求。这里有一些警告说 `workers`、`id` 和 `thread` 字段没有直接被使用，这提醒了我们并没有清理所有的内容。当使用不那么优雅的 <kbd>ctrl</kbd>-<kbd>c</kbd> 终止主线程时，所有其他线程也会立刻停止，即便它们正处于处理请求的过程中。

现在我们要为 `ThreadPool` 实现 `Drop` trait 对线程池中的每一个线程调用 `join`，这样这些线程在关闭前将会执行完它们的请求。接着会为 `ThreadPool` 实现一个告诉线程它们应该停止接收新请求并结束的方式。为了实践这些代码，修改服务端在优雅停机（graceful shutdown）之前只接受两个请求。

在我们开始时需要注意的是：这一切都不会影响处理执行闭包的那部分代码因此如果我们在异步运行时中使用线程池，所有操作也完全相同。

### 为 `ThreadPool` 实现 `Drop` Trait

现在开始为线程池实现 `Drop`。当线程池被丢弃时，应该 join 所有线程以确保它们完成其操作。示例 21-22 展示了 `Drop` 实现的第一次尝试；这些代码还不能够编译：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch21-web-server/listing-21-22/src/lib.rs:here}}
```

<span class="caption">示例 21-22: 当线程池离开作用域时 join 每个线程</span>

这里首先遍历线程池中的每个 `workers`。这里使用了 `&mut` 因为 `self` 本身是一个可变引用而且也需要能够修改 `worker`。对于每一个线程，会打印出说明信息表明此特定 `Worker` 实例正在关闭，接着在 `Worker` 实例的线程上调用 `join`。如果 `join` 调用失败，通过 `unwrap` 使得 panic 并进行不优雅的关闭。

```console
{{#include ../listings/ch21-web-server/listing-21-22/output.txt}}
```

这里的错误告诉我们并不能调用 `join`，因为我们只有每一个 `worker` 的可变借用，而 `join` 需要获取其参数的所有权。为了解决这个问题，需要一个方法将 `thread` 移动出拥有其所有权的 `Worker` 实例以便 `join` 可以消费这个线程。示例 18-15 中我们曾见过这么做的方法：如果 `Worker` 存放的是 `Option<thread::JoinHandle<()>`，就可以在 `Option` 上调用 `take` 方法将值从 `Some` 成员中移动出来而对 `None` 成员不做处理。换句话说，正在运行的 `Worker` 的 `thread` 将是 `Some` 成员值，而当需要清理 worker 时，将 `Some` 替换为 `None`，这样 worker 就没有可以运行的线程了。

然而，这种情况**只**会在丢弃 `Worker` 时出现。相应地，我们必须在任何访问 `worker.thread` 时处理 `Option<thread::JoinHandle<()>>`。在惯用的 Rust 代码中 `Option` 用的很多，但当你发现自己总是知道 `Option` 中一定会有值，却还要将其包装在 `Option` 中来应对这一场景时，就应该考虑其他更优雅的方法了。

在这个例子中，存在一个更好的替代方案：`Vec::drain` 方法。它接受一个 range 参数来指定哪些项要从 `Vec` 中移除，并返回一个这些项的迭代器。使用 `..` range 语法会从 `Vec` 中移除**所有**值。

因此我们需要像下面这样更新 `ThreadPool` 的 `drop` 实现：

<span class="filename">文件名：src/lib.rs</span>

```rust
{{#rustdoc_include ../listings/ch21-web-server/no-listing-04-update-drop-definition/src/lib.rs:here}}
```

这解决了编译器错误且不需要对我们的代码做其它更改。

### 向线程发送信号使其停止接收任务

有了所有这些修改，代码就能编译且没有任何警告。然而，坏消息是，这些代码还不能以我们期望的方式运行。问题的关键在于 `Worker` 实例中分配的线程所运行的闭包中的逻辑：此时，调用 `join` 并不会关闭线程，因为它们一直 `loop` 来寻找任务。如果采用这个实现来尝试丢弃 `ThreadPool`，则主线程会永远阻塞在等待第一个线程结束上。

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

<span class="caption">示例 21-24：当 `recv` 返回错误时显式退地出循环</span>

为了实践这些代码，如示例 21-25 所示修改 `main` 在优雅停机服务端之前只接受两个请求：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch21-web-server/listing-21-25/src/main.rs:here}}
```

<span class="caption">示例 21-25: 在处理两个请求之后通过退出循环来停止服务端</span>

你不会希望真实世界的 web 服务端只处理两次请求就停机了，这只是为了展示优雅停机和清理处于正常工作状态。

`take` 方法定义于 `Iterator` trait，这里限制循环最多头 2 次。`ThreadPool` 会在 `main` 的结尾离开作用域， `drop` 实现会运行。

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

可能会出现不同顺序的 `Worker` ID 和信息输出。可以从信息中看到服务是如何运行的：`Worker` 实例 0 和 3 获取了头两个请求。server 会在头第二个请求后停止接受请求，`ThreadPool` 的 `Drop` 实现甚至会在 `Worker` 3 开始工作之前就开始执行。丢弃 `sender` 会断开所有 `Worker` 实例的连接并让它们关闭。每个 `Worker` 实例在断开时会打印出一个信息，接着线程池调用 `join` 来等待每一个 `Worker` 线程结束。

注意在这个特定的运行过程中一个有趣的地方在于：`ThreadPool` 丢弃 `sender`，而在任何 `Worker` 收到消息之前，就尝试 join `Worker` 0 `Worker` 0 还没有从 `recv` 获得一个错误，所以主线程阻塞直到 `Worker` 0 结束。与此同时，`Worker` 3 接收到一个任务接着所有线程会收到一个错误。一旦 `Worker` 0 结束，主线程就等待余下其他 worker 结束。此时它们都退出了循环并停止。

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

* 为 `ThreadPool` 和其公有方法增加更多文档
* 为库的功能增加测试
* 将 `unwrap` 调用改为更健壮的错误处理
* 使用 `ThreadPool` 进行其他不同于处理网络请求的任务
* 在 [crates.io](https://crates.io/) 上寻找一个线程池 crate 并使用它实现一个类似的 web 服务端，将其 API 和鲁棒性与我们的实现做对比

## 总结

好极了！你已经完成了本书的学习！由衷感谢你与我们一道踏上这段 Rust 之旅。现在你已经准备好实现自己的 Rust 项目并帮助他人了。请不要忘记我们的社区，这里有其他 Rustaceans 正乐于帮助你迎接 Rust 之路上的任何挑战。
