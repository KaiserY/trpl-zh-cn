### 将控制权交还给运行时

[ch17-03-more-futures.md](https://github.com/rust-lang/book/blob/dec931300f1a00e6e26021907192b0634980950c/src/ch17-03-more-futures.md)

回忆一下我们在[“第一个异步程序”][async-program]<!-- ignore -->一节中提到的内容：在每个 await 点，如果被等待的 future 还没准备好，Rust 就会给运行时一个机会来暂停当前任务并切换到其他任务。反过来也成立：Rust *只会* 在 await 点暂停 async 代码块，并把控制权交还给运行时。await 点之间的所有内容都是同步执行的。

这意味着，如果你在一个 async 代码块中做了大量工作，却没有任何 await 点，那么这个 future 就会阻止其他 future 取得进展。有时你会听到人们把这称为一个 future 让其他 future *starve*（饥饿）。在某些场景下，这也许不是什么大问题；但如果你在做昂贵的初始化、长时间运行的工作，或者你有一个会无限执行某项任务的 future，就需要认真考虑该在何时、何地把控制权交还给运行时。

让我们通过模拟一个长时间运行的操作来展示这种“饥饿”问题，再看看该如何解决。示例 17-14 引入了一个 `slow` 函数。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-14/src/main.rs:slow}}
```

<figcaption>示例 17-14：使用 `thread::sleep` 来模拟缓慢的操作</figcaption>

</figure>

这段代码使用的是 `std::thread::sleep`，而不是 `trpl::sleep`，因此调用 `slow` 会让当前线程阻塞若干毫秒。我们可以把 `slow` 看作现实世界中那些既耗时又会阻塞的操作的替身。

在示例 17-15 中，我们用 `slow` 来模拟在一对 future 中执行这类 CPU 密集型工作。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-15/src/main.rs:slow-futures}}
```

<figcaption>示例 17-15：调用 `slow` 函数来模拟缓慢操作</figcaption>

</figure>

每个 future 都会在完成一大串缓慢操作之后，才把控制权交还给运行时。如果你运行这段代码，就会看到如下输出：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-15/
cargo run
copy just the output
-->

```text
'a' started.
'a' ran for 30ms
'a' ran for 10ms
'a' ran for 20ms
'b' started.
'b' ran for 75ms
'b' ran for 10ms
'b' ran for 15ms
'b' ran for 350ms
'a' finished.
```

和示例 17-5 中用 `trpl::select` 让两个 URL 获取任务竞争时一样，`select` 仍然会在 `a` 完成时立刻结束。不过，这两个 future 里的 `slow` 调用之间完全没有交错执行。`a` future 会一路把自己的工作做完，直到等待 `trpl::sleep` 调用；接着 `b` future 又一路做完自己的工作，直到它自己的 `trpl::sleep` 被等待；最后 `a` future 才完成。要想让两个 future 在这些缓慢任务之间都取得进展，我们就需要一些 await 点，好把控制权交还给运行时。也就是说，我们得有某种可以被 await 的东西！

实际上，我们已经能在示例 17-15 中看到这种“交接”是如何发生的：如果去掉 `a` future 末尾的 `trpl::sleep`，那么它会直接完成，而 `b` future *根本不会运行*。让我们先从 `trpl::sleep` 入手，试着让这些操作能够轮流取得进展，如示例 17-16 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-16/src/main.rs:here}}
```

<figcaption>示例 17-16：使用 `trpl::sleep` 让操作轮流推进</figcaption>

</figure>

我们在每次调用 `slow` 之间都插入了 `trpl::sleep` 调用和 await 点。现在，两个 future 的工作就交错在一起了：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-16
cargo run
copy just the output
-->

```text
'a' started.
'a' ran for 30ms
'b' started.
'b' ran for 75ms
'a' ran for 10ms
'b' ran for 10ms
'a' ran for 20ms
'b' ran for 15ms
'a' finished.
```

`a` future 仍然会在第一次把控制权交给 `b` 之前先运行一阵，因为它是在第一次调用 `trpl::sleep` 之前先执行了 `slow`；但在那之后，每当其中一个 future 命中 await 点，它们就会来回切换。在这个例子中，我们是在每次 `slow` 之后这么做的，不过实际上也可以按任何对你最合理的方式来拆分工作。

但我们其实并不是真的想在这里*休眠*（*sleep*）；我们只是希望程序尽可能快地前进。我们真正需要的只是把控制权交还给运行时。可以直接通过 `trpl::yield_now` 来做到这一点。在示例 17-17 中，我们把前面的 `trpl::sleep` 全部替换成 `trpl::yield_now`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-17/src/main.rs:yields}}
```

<figcaption>示例 17-17：使用 `yield_now` 让操作轮流推进</figcaption>

</figure>

这段代码不仅更清楚地表达了真实意图，而且通常也会比使用 `sleep` 快得多，因为像 `sleep` 使用的那类计时器，往往都会受到最小粒度限制。比如我们这里使用的 `sleep`，即使你传入的是 1 纳秒的 `Duration`，它也至少会睡眠 1 毫秒。再说一次，现代计算机是非常*快*的：1 毫秒里已经能完成大量工作了！

这说明：即使面对计算密集型任务，async 依然可能是有用的，具体取决于你的程序还在做什么，因为它提供了一种很实用的手段，用来组织程序不同部分之间的关系（当然代价是 async 状态机本身也有一定开销）。这是一种 *协作式多任务*（*cooperative multitasking*）：每个 future 都可以通过 await 点来决定何时交出控制权，因此每个 future 也都负有避免长时间阻塞的责任。在某些基于 Rust 的嵌入式操作系统中，这甚至是*唯一*的多任务形式！

当然，在真实代码里，你通常不会在每一行之间都交替插入函数调用和 await 点。像这样主动交出控制权虽然相对便宜，但并不是没有代价。在很多情况下，试图把一个计算密集型任务切得太碎，反而可能显著拖慢它的执行速度，所以有时为了*整体*性能，让某个操作短暂阻塞一下反而更好。还是那句老话：一定要靠测量来确认代码真正的性能瓶颈。不过，如果你发现原本预期会并发执行的工作，实际上却大量串行发生，那么就要记住这里的底层机制。

### 构建我们自己的异步抽象

我们还可以把多个 future 组合在一起，创造出新的模式。比如，完全可以用手头已有的 async 构件来写一个 `timeout` 函数。等我们做完，它本身就会成为另一个可以继续拿来构建更多 async 抽象的基础模块。

示例 17-18 展示了我们希望这个 `timeout` 在面对一个缓慢 future 时应该如何工作。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-18/src/main.rs:here}}
```

<figcaption>示例 17-18：使用我们设想的 `timeout` 为一个缓慢操作设置时间限制</figcaption>

</figure>

让我们来实现它。首先先想想 `timeout` 的 API：

- 它本身需要是一个 async 函数，这样我们才能等待它。
- 它的第一个参数应该是一个要执行的 future。我们可以把它设计成泛型，从而支持任意 future。
- 它的第二个参数应该是最大等待时间。如果用 `Duration`，就能很方便地直接传给 `trpl::sleep`。
- 它应该返回一个 `Result`。如果传入的 future 成功完成，结果应当是 `Ok`，内部带上该 future 产生的值；如果先发生超时，结果就应当是 `Err`，内部带上等待的时长。

示例 17-19 展示了这个声明。

<!-- This is not tested because it intentionally does not compile. -->

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-19/src/main.rs:declaration}}
```

<figcaption>示例 17-19：定义 `timeout` 的签名</figcaption>

</figure>

这样类型层面的目标就满足了。接下来想想我们需要的*行为*：我们希望让传入的 future 和这个时长“竞争”。可以用 `trpl::sleep` 根据这个时长构造一个计时器 future，再用 `trpl::select` 让计时器和调用者传入的 future 一起运行。

在示例 17-20 中，我们通过匹配 `trpl::select` 的等待结果来实现 `timeout`。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-20/src/main.rs:implementation}}
```

<figcaption>示例 17-20：使用 `select` 和 `sleep` 定义 `timeout`</figcaption>

</figure>

`trpl::select` 的实现并不是公平的：它总是按参数传入的顺序进行轮询（其他一些 `select` 实现会随机选择先轮询哪个参数）。因此，我们把 `future_to_try` 作为第一个参数传给 `select`，好让它即使在 `max_time` 很短的情况下，也仍然有机会先完成。如果 `future_to_try` 先完成，`select` 会返回 `Left`，其中包含 `future_to_try` 的输出；如果 `timer` 先完成，`select` 就会返回 `Right`，其中包含计时器的输出 `()`。

如果 `future_to_try` 成功完成，并且我们得到了 `Left(output)`，那么就返回 `Ok(output)`。如果相反是睡眠计时器先结束，我们得到 `Right(())`，那就用 `_` 忽略这个 `()`，并返回 `Err(max_time)`。

这样一来，我们就用另外两个 async 小工具拼出了一个可工作的 `timeout`。如果运行代码，它会在超时后打印出失败信息：

```text
Failed after 2 seconds
```

因为 future 可以和其他 future 组合，你就能利用更小的 async 构件构建出非常强大的工具。比如，完全可以用同样的方法把 timeout 和 retry 组合起来，再进一步把它们用在网络请求一类的操作上（例如示例 17-5 里的那些）。

在实践中，你通常会主要直接使用 `async` 和 `await`，其次才是像 `select` 这样的函数，以及像 `join!` 这样的宏，来控制最外层的 future 应该如何执行。

到这里，我们已经看过好几种同时处理多个 future 的方式了。接下来，我们将看看如何借助 *stream*，按照时间顺序处理一串 future。

[async-program]: ch17-01-futures-and-syntax.html#第一个异步程序
