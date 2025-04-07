## 深入理解 async 相关的 traits

> [ch17-05-traits-for-async.md](https://github.com/rust-lang/book/blob/main/src/ch17-05-traits-for-async.md)
> <br>
> commit 56ec353290429e6547109e88afea4de027b0f1a9

贯穿本章，我们通过多种方式使用了 `Future`、`Pin`、`Unpin`、`Stream` 和 `StreamExt` trait。但是直到目前为止，我们避免过多地了解它们如何工作或者如何组合在一起的细节，这对你日常的 Rust 开发而言通常是没问题的。不过有时你会遇到需要了解更多细节的场景。在本小节，我们会足够深入以便理解这些场景，并仍会将 *真正* 有深度的内容留给其它文档。

### `Future` trait

让我们以更深入地了解 `Future` trait 作为开始。这里是 Rust 中其如何定义的：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

trait 定义中包含一些的新类型和我们之前没有见过新语法，所以让我们逐步详细地解析一下这个定义。

首先， `Future` 的关联类型 `Output` 表明 future 最终解析出的类型。这类似于 `Iterator` trait 的关联类型 `Item`。其次，`Future` 还有一个 `poll` 方法，其有一个特殊的 `self` 参数的 `Pin` 引用和一个 `Context` 类型的可变引用，并返回一个 `Poll<Self::Output>`。稍后我们再细说  `Pin` 和 `Context`。现在让我们专注于方法返回的 `Poll` 类型：

```rust
enum Poll<T> {
    Ready(T),
    Pending,
}
```

`Poll` 类型类似于一个 `Option`。它有一个包含值的变体 `Ready(T)`，和一个没有值的变体 `Pending`。不过 `Poll` 所代表的意义与 `Option` 非常不同！`Pending` 变体表明 future 仍然还有工作要进行，所有调用者稍后需要再次检查。`Ready` 变体表明 future 已经完成了其工作并且 `T` 的值是可用的。

> 注意：对于大部分功能，调用者不应在 future 返回 `Ready` 后再次调用 `poll`。很多 future 在完成后再次轮询会 panic。可以安全地再次轮询的 future 会在文档中显示地说明。这类似于 `Iterator::next` 的行为。

当你见到使用 `await` 的代码时，Rust 会在底层将其编译为调用 `poll` 的代码。如果你回头看下示例 17-4，其在一个单个 URL 解析完成后打印出页面标题，Rust 将其编译为一些类似（虽然不完全是）这样的代码：

```rust,ignore
match page_title(url).poll() {
    Ready(page_title) => match page_title {
        Some(title) => println!("The title for {url} was {title}"),
        None => println!("{url} had no title"),
    }
    Pending => {
        // But what goes here?
    }
}
```

如果 future 仍然是 `Pending` 的话我们应该做什么呢？我们需要某种方式不断重试，直到 future 最终准备好。换句话说，我们需要一个循环：

```rust,ignore
let mut page_title_fut = page_title(url);
loop {
    match page_title_fut.poll() {
        Ready(value) => match page_title {
            Some(title) => println!("The title for {url} was {title}"),
            None => println!("{url} had no title"),
        }
        Pending => {
            // continue
        }
    }
}
```

不过，如果 Rust 真的将代码精确地编译成那样，那么每一个 `await` 都会变成阻塞操作 -- 这恰恰与我们的目标相反！相反，Rust 确保循环可以将控制权交给一些可以暂停当前 future 转而去处理其它 future 并在之后再次检查当前 future 的内容。如你所见，这就是异步运行时，这种安排和协调的工作是其主要工作之一。

在本章前面的内容中，我们描述了等待 `rx.recv`。`recv` 调用返回一个 future，并 await 轮询它的 future。我们注意到当信道关闭时运行时会暂停 future 直到它就绪并返回 `Some(message)` 或 `None` 为止。随着我们对 `Future` trait，尤其是 `Future::poll` 的理解的深入，我们可以看出其是如何工作的。运行时知道 future 返回 `Poll::Pending` 时它还没有完成。反过来说，当 `poll` 返回 `Poll::Ready(Some(message))` 或 `Poll::Ready(None)` 时运行时知道 future **已经**完成了并继续运行。

运行时如何工作的具体细节超出了本书的范畴。不过关键在于理解 future 的基本机制：运行时**轮询**其所负责的每一个 future，在它们还没有完成时使其休眠。

### `Pin` 和 `Unpin` traits

当我们在示例 17-16 中引入 pin 的概念时，我们遇到了一个很不友好的错误信息。这里再次展示其中相关的部分：

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-16
cargo build
copy *only* the final `error` block from the errors
-->

```text
error[E0277]: `{async block@src/main.rs:10:23: 10:33}` cannot be unpinned
  --> src/main.rs:48:33
   |
48 |         trpl::join_all(futures).await;
   |                                 ^^^^^ the trait `Unpin` is not implemented for `{async block@src/main.rs:10:23: 10:33}`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<{async block@src/main.rs:10:23: 10:33}>` to implement `Future`
note: required by a bound in `futures_util::future::join_all::JoinAll`
  --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`
```

这个错误信息不仅告诉我们需要 ping 住这个值而且还告诉我们为何 pin 是必须的。`trpl::join_all` 函数返回一个叫做 `JoinAll` 的结构体。这个结构体是一个 `F` 类型的泛型，它被限制为需要实现 `Future` trait。通过 `await` 直接 await 一个 future 会隐式地 pin 住这个函数。这也就是为什么我们不需要在任何想要 await future 的地方使用 `pin!`。

然而，这里我们没有直接 await 一个 future。相反我们通过向 `join_all` 函数传递一个 future 集合来构建了一个新 future `JoinAll`。`join_all` 的签名要求集合中项的类型都要实现 `Future` trait，而 `Box<T>` 只有在其封装的 `T` 是一个实现了 `Unpin` trait 的 future 时才会实现 `Future`。

这有很多需要吸收的知识！为了真正地理解它，让我们稍微深入理解 `Future` 实际上是如何工作的，特别是 *pinning* 那一部分。

再次观察 `Future` trait 的定义：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    // Required method
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```
