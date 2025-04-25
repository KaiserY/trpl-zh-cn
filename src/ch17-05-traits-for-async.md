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

这个错误信息不仅告诉我们需要对这些值进行 pin 操作，还解释了为什么 pin 是必要的。`trpl::join_all` 函数返回一个叫做 `JoinAll` 的结构体。这个结构体是一个 `F` 类型的泛型，它被限制为需要实现 `Future` trait。通过 `await` 直接 await 一个 future 会隐式地 pin 住这个函数。这也就是为什么我们不需要在任何想要 await future 的地方使用 `pin!`。

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

这里的 `cx` 参数及其 `Context` 类型，是运行时如何在仍保持 lazy 的情况下实际知道何时去检查任何给定的 future 的关键。同样，它们是如何工作的细节超出了本章的范畴，通常你只有在编写自定义 `Future` 实现时才需要思考它。相反我们将关注 `self` 的类型，因为这是第一次见到 `self` 有类型注解的方法。`self` 的类型注解与其它参数的类型注解类似，但有两个关键区别：

- 它告诉 Rust 在调用该方法时 `self` 必须具备的类型。
- 它不能是任意类型。这限制了实现了该方法的类型，是一个该类型的引用或者智能指针，或者一个封装了该类型引用的 `Pin`。

我们会在 [第十八章][ch-18] 更多地看到这个语法。现在，知道如果要轮询一个 future 来检查它是 `Pending` 或者 `Ready(Output)`，我们需要一个 `Pin` 封装的该类型的可变引用就够了。

`Pin` 是一个类指针类型的封装，比如 `&`，`&mut`，`Box` 和 `Rc`。（从技术上来说，`Pin` 适用于实现了 `Deref` 或 `DerefMut` trait 的类型，不过这实际上等同于只能适用于指针。）`Pin` 本身并不是一个指针并且也不具备类似 `Rc` 和 `Arc` 那样引用技术的功能；它单纯地是一个编译器可以用来约束指针使用的工具。

回忆一下 `await` 的实现是基于对 `poll` 的调用，这有助于解释之前见到的错误信息，不过那是关于 `Unpin` 的。所以 `Pin` 具体与 `Unpin` 有何关联，又为什么 `Future` 需要 `self` 在一个 `Pin` 类型中才能调用 `poll`？

回忆一下本章之前 future 中一系列的 await point 被编译为一个状态机，而编译器确保这个状态机遵守所有 Rust 在安全方面的正常规则，包括借用和所有权。为了使其正常工作，Rust 检查在一个 await point 和另一个 await point 之间或到异步代码块结尾之间什么数据是需要的。它接着在编译的状态机中创建一个相应的变体。每一个变体获得其在源码中对应片段所用到的数据的访问权限，要么获取数据的所有权要么获取其可变或不可变引用。

到目前为止, 一切正常：如果你在给定异步代码块中搞错了所有权或者引用，借用检查器会告诉你。当我们需要移动对应代码块的 future -- 例如将其移动到 `Vec` 中或者传递给 `join_all` -- 事情就会变得棘手。

当我们移动一个 future -- 将其移动进一个数据结构通过 `join_all` 将其用作迭代器或者将其从函数返回 -- 这实际上意味着将 Rust 创建的状态机移动给我们。同时不同于 Rust 中大部分其它类型，Rust 为异步代码块创建的 future 可能最终会在任意给定变体的字段中有其自身的引用，如图 17-4 中的简化图所示。

<figure>

<img alt="A single-column, three-row table representing a future, fut1, which has data values 0 and 1 in the first two rows and an arrow pointing from the third row back to the second row, representing an internal reference within the future." src="img/trpl17-04.svg" class="center" />

<figcaption>图 17-4: 一个自引用数据类型。</figcaption>

</figure>

但是，默认移动任何拥有其自身引用的对象是不安全（unsafe）的，因为引用总是会指向任何其引用数据的实际内存地址（见图 17-5）。如果我们移动数据结构本身，这些内部引用会停留在指向老的地址。然后，这些内存地址现在是无效的。一方面，当修改这些数据结构时这些值不会被更新。另一个更重要的方面是，电脑现在可以随意复用这些内存用于其它用途！之后你最终可能会读取到完全不相关的数据。

<figure>

<img alt="Two tables, depicting two futures, fut1 and fut2, each of which has one column and three rows, representing the result of having moved a future out of fut1 into fut2. The first, fut1, is grayed out, with a question mark in each index, representing unknown memory. The second, fut2, has 0 and 1 in the first and second rows and an arrow pointing from its third row back to the second row of fut1, representing a pointer that is referencing the old location in memory of the future before it was moved." src="img/trpl17-05.svg" class="center" />

<figcaption>图 17-5: 移动一个自引用数据类型的不安全结果。</figcaption>

</figure>

理论上来说，Rust 编译器也可以在对象被移动时尝试更新其所有的引用，不过这会增加很多性能开销，特别是在有一整个网状的引用需要更新的时候。相反如果我们确保相关的数据结构**不能再内存中移动**，我们就无需更新任何引用。这正是 Rust 的借用检查器所要求的：在安全代码中，禁止移动任何有自身活动引用的项。

构建于这之上的 `Pin` 正好给了我们所需的保证。当我们通过 `Pin` 封装一个值的引用来 **pin** 住它时，它就不能再移动了。也就是说，如果有 `Pin<Box<SomeType>>`，你实际上 ping 住了 `SomeType` 的值，而**不是** `Box` 指针。图 17-6 解释了这一过程。

<figure>

<img alt="Three boxes laid out side by side. The first is labeled “Pin”, the second “b1”, and the third “pinned”. Within “pinned” is a table labeled “fut”, with a single column; it represents a future with cells for each part of the data structure. Its first cell has the value “0”, its second cell has an arrow coming out of it and pointing to the fourth and final cell, which has the value “1” in it, and the third cell has dashed lines and an ellipsis to indicate there may be other parts to the data structure. All together, the “fut” table represents a future which is self-referential. An arrow leaves the box labeled “Pin”, goes through the box labeled “b1” and has terminates inside the “pinned” box at the “fut” table." src="img/trpl17-06.svg" class="center" />

<figcaption>图 17-6: pin 住一个指向自引用 future 类型的 `Box`。</figcaption>

</figure>

事实上，`Box` 指针仍然可以随意移动。请记住：我们关心确保最终被引用的数据保持不动。如果指针移动了，**但是它指向的数据还在相同的位置**，就像图 17-7 一样，就不会有潜在的问题。（作为一个独立的练习，查看一下 `Pin` 类型以及 `std::pin` 模块的文档来尝试理解如何通过 `Pin` 封装一个 `Box` 来做到这些。）其关键在于自引用类型本身不可移动，因为它仍然是被 pin 住的。

<figure>

<img alt="Four boxes laid out in three rough columns, identical to the previous diagram with a change to the second column. Now there are two boxes in the second column, labeled “b1” and “b2”, “b1” is grayed out, and the arrow from “Pin” goes through “b2” instead of “b1”, indicating that the pointer has moved from “b1” to “b2”, but the data in “pinned” has not moved." src="img/trpl17-07.svg" class="center" />

<figcaption>图 17-7: 移动一个指向自引用 future 类型的 `Box`。</figcaption>

</figure>

[ch-18]: ch18-00-oop.html
[async-book]: https://rust-lang.github.io/async-book/
[under-the-hood]: https://rust-lang.github.io/async-book/02_execution/01_chapter.html
[pinning]: https://rust-lang.github.io/async-book/04_pinning/01_chapter.html
[first-async]: ch17-01-futures-and-syntax.html#第一个异步程序
[any-number-futures]: ch17-03-more-futures.html#使用任意数量的-futures
