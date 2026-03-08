## 深入理解 async 相关的 trait

[ch17-05-traits-for-async.md](https://github.com/rust-lang/book/blob/9fc2a4e8e478ee1388c2b9ba55e3f12e89808bc2/src/ch17-05-traits-for-async.md)

贯穿本章，我们以各种方式使用了 `Future`、`Stream` 和 `StreamExt` trait。不过到目前为止，我们一直刻意没有太深入它们究竟是如何工作的、又是如何彼此配合的。对日常 Rust 编程来说，这通常完全没问题。不过有时你会遇到一些场景，在那里你需要额外理解这些 trait 的更多细节，以及 `Pin` 类型和 `Unpin` trait。在这一节里，我们会适度深入，足够帮助你应对这些情况，但把*真正*深入的内容留给其他文档。

### `Future` trait

让我们先更仔细地看看 `Future` trait 是如何工作的。Rust 中它的定义如下：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

这个 trait 定义里包含了不少新类型，也有一些我们之前还没见过的语法，所以我们逐部分来看。

首先，`Future` 的关联类型 `Output` 指明了这个 future 最终会解析成什么值。这和 `Iterator` trait 里的关联类型 `Item` 是类似的。其次，`Future` 提供了一个 `poll` 方法。它接收一个特殊的 `Pin` 包裹的 `self` 引用、一个指向 `Context` 类型的可变引用，并返回 `Poll<Self::Output>`。稍后我们会再讲 `Pin` 和 `Context`。现在，先聚焦到这个方法的返回值 `Poll`：

```rust
pub enum Poll<T> {
    Ready(T),
    Pending,
}
```

这个 `Poll` 类型有点像 `Option`。它也有一个带值的变体 `Ready(T)`，以及一个不带值的变体 `Pending`。但 `Poll` 的语义和 `Option` 完全不同。`Pending` 表示这个 future 还有工作没做完，因此调用方稍后还需要再次检查。`Ready` 则表示这个 `Future` 已经完成，其结果值 `T` 现在已经可用。

> 注意：直接调用 `poll` 的场景很少，但如果你真的需要这么做，请记住：对于大多数 future 来说，一旦它已经返回过 `Ready`，调用方就不应再对它调用 `poll`。很多 future 在 ready 之后再次被轮询时会 panic。那些可以安全重复轮询的 future，会在文档里明确说明。这和 `Iterator::next` 的行为有些相似。

当你看到使用 `await` 的代码时，Rust 在底层会把它编译成调用 `poll` 的代码。如果你回头看示例 17-4，也就是在单个 URL 的标题解析完成后把它打印出来的那个例子，Rust 编译出来的代码大致会像下面这样（虽然并不完全一致）：

```rust,ignore
match page_title(url).poll() {
    Ready(page_title) => match page_title {
        Some(title) => println!("The title for {url} was {title}"),
        None => println!("{url} had no title"),
    }
    Pending => {
        // 这里该怎么办？
    }
}
```

如果 future 仍然是 `Pending`，那我们该怎么办？我们需要一种办法不断重试，直到 future 最终准备好。换句话说，我们需要一个循环：

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

但如果 Rust 真按这段代码精确地编译，那么每个 `await` 就都会变成阻塞式的，这恰恰和我们想要的效果相反！Rust 实际上会保证：这个循环能够把控制权交给某个东西，由它暂停当前 future 的工作，去处理别的 future，然后稍后再回来重新检查当前这个。正如我们已经见过的，这个“某个东西”就是异步运行时，而调度和协调这些工作，正是运行时的核心职责之一。

在[“通过消息传递在两个任务之间发送数据”][message-passing]<!-- ignore -->一节中，我们描述过等待 `rx.recv` 的过程。`recv` 调用会返回一个 future，而等待这个 future 本质上就是在轮询它。我们之前提到，运行时会暂停这个 future，直到它准备好，最终要么得到 `Some(message)`，要么在信道关闭时得到 `None`。现在，借助对 `Future` trait，尤其是 `Future::poll` 的更深入理解，我们就能看清它的工作方式了：当返回 `Poll::Pending` 时，运行时知道这个 future 还没准备好；反过来，当 `poll` 返回 `Poll::Ready(Some(message))` 或 `Poll::Ready(None)` 时，运行时就知道这个 future 已经准备好，可以继续推进它。

至于运行时具体是怎么做到这一点的，已经超出了本书的范围。不过关键是看清 future 的基本机制：运行时会去*轮询*它所负责的每个 future，而当 future 还没准备好时，就让它重新休眠。

### `Pin` 类型与 `Unpin` trait

回到示例 17-13，我们使用过 `trpl::join!` 宏来等待三个 future。不过，更常见的情况是你会有一个集合，比如一个向量，其中包含若干个 future，而这些 future 的个数要到运行时才知道。让我们把示例 17-13 改成示例 17-23 中的代码：把这三个 future 放进一个向量里，再调用 `trpl::join_all`。不过，这段代码暂时还编译不过。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-23/src/main.rs:here}}
```

<figcaption>示例 17-23：等待一个集合中的多个 future</figcaption>

</figure>

我们把每个 future 都放进了一个 `Box` 中，好把它们变成 *trait object*，就像我们在第十二章“从 `run` 返回错误”那一节做的那样。（我们会在第十八章详细讨论 trait object。）使用 trait object 后，我们就能把这些类型各不相同的匿名 future 当成同一种类型来对待，因为它们全都实现了 `Future` trait。

这也许会让人意外。毕竟，这些 async 代码块都没有返回任何值，所以它们每一个产生的都是 `Future<Output = ()>`。但别忘了：`Future` 是个 trait，而编译器会为每个 async 代码块生成一个独一无二的 enum，即使它们的输出类型完全相同。就像你不能把两个不同的手写 struct 放进同一个 `Vec`，你也同样不能把这些编译器生成的不同 enum 混在一起。

然后，我们把这组 future 传给 `trpl::join_all`，再等待结果。然而，这段代码仍然无法编译。下面是报错中最关键的一部分：

```text
error[E0277]: `dyn Future<Output = ()>` cannot be unpinned
  --> src/main.rs:48:33
   |
48 |         trpl::join_all(futures).await;
   |                                 ^^^^^ the trait `Unpin` is not implemented for `dyn Future<Output = ()>`
   |
   = note: consider using the `pin!` macro
           consider using `Box::pin` if you need to access the pinned value outside of the current scope
   = note: required for `Box<dyn Future<Output = ()>>` to implement `Future`
note: required by a bound in `futures_util::future::join_all::JoinAll`
  --> file:///home/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/futures-util-0.3.30/src/future/join_all.rs:29:8
   |
27 | pub struct JoinAll<F>
   |            ------- required by a bound in this struct
28 | where
29 |     F: Future,
   |        ^^^^^^ required by this bound in `JoinAll`
```

这段错误信息里的 note 告诉我们，应该使用 `pin!` 宏来 *pin* 这些值，也就是把它们放进 `Pin` 类型中，以保证这些值不会在内存中移动。报错之所以说需要 pin，是因为 `dyn Future<Output = ()>` 需要实现 `Unpin` trait，而它当前并没有实现。

`trpl::join_all` 返回的是一个名为 `JoinAll` 的结构体。这个结构体在类型参数 `F` 上是泛型的，而 `F` 又被约束必须实现 `Future` trait。直接通过 `await` 去等待一个 future 时，Rust 会隐式地把它 pin 住。这也正是为什么我们平常不需要在每个想等待 future 的地方都显式写 `pin!`。

但这里，我们并不是直接在等待某个 future。相反，我们是通过把一组 future 传给 `join_all`，构造出了一个新的 future：`JoinAll`。而 `join_all` 的签名要求集合中的元素类型都必须实现 `Future` trait。另一方面，`Box<T>` 只有在它包裹的 `T` 本身是 future 且实现了 `Unpin` trait 时，才会实现 `Future`。

这一下信息量很大！为了真正理解它，我们得再更深入一点，看清 `Future` trait 尤其是 pinning 这一部分到底是如何运作的。再看一遍 `Future` trait 的定义：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

pub trait Future {
    type Output;

    // Required method
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

这里的 `cx` 参数以及它的 `Context` 类型，是运行时在保持 lazy 的同时，真正知道该在什么时候重新检查某个 future 的关键。和前面一样，这部分具体机制超出了本章范围，而且通常也只有在你自己实现 `Future` 时才需要关注。我们这里聚焦的是 `self` 的类型，因为这是我们第一次见到一个方法里的 `self` 带有类型注解。对 `self` 进行类型注解，和给其他函数参数写类型注解类似，但有两个关键区别：

- 它告诉 Rust：要调用这个方法，`self` 必须是什么类型。
- 它不能随便写成任意类型。它必须是方法所实现类型本身、该类型的引用或智能指针，或者是一个包裹了该类型引用的 `Pin`。

我们会在[第十八章][ch-18]<!-- ignore -->里看到更多相关语法。眼下，只要知道：如果我们想通过轮询 future 来检查它到底是 `Pending` 还是 `Ready(Output)`，那么就需要一个 `Pin` 包裹的、指向该类型的可变引用。

`Pin` 是一种针对指针类类型的包装器，比如 `&`、`&mut`、`Box` 和 `Rc`。（严格来说，`Pin` 作用于实现了 `Deref` 或 `DerefMut` 的类型，但实际效果基本等同于“引用和智能指针”。）`Pin` 本身并不是指针，也不像 `Rc` 或 `Arc` 那样自带引用计数之类的行为；它纯粹是一个让编译器能够对指针使用方式施加约束的工具。

回忆一下：`await` 是通过调用 `poll` 实现的。理解这一点以后，前面的错误信息就已经开始变得容易理解了，不过那个报错说的是 `Unpin`，不是 `Pin`。那么，`Pin` 和 `Unpin` 究竟是什么关系？为什么 `Future` 又要求 `self` 必须放在 `Pin` 里才能调用 `poll` 呢？

记住，我们在本章前面提过，一个 future 里的多个 await 点会被编译成一个状态机，而编译器会确保这个状态机遵守 Rust 关于安全性的全部常规规则，包括借用和所有权。为了做到这一点，Rust 会分析：在某个 await 点和下一个 await 点之间，或者直到 async 代码块结束之前，哪些数据是需要保留的。然后，它会在编译出来的状态机里生成对应的变体。每个变体都会得到其对应源代码片段所需的数据访问权限，这种访问可能是获得所有权，也可能是获得可变或不可变引用。

到这里为止，一切都很好：如果你在某个 async 代码块里把所有权或引用关系写错了，借用检查器会告诉你。但当我们想要移动这个代码块对应的 future 时，比如把它放进 `Vec` 然后传给 `join_all`，事情就开始变复杂了。

当我们移动一个 future 时，无论是把它放进数据结构，以便通过 `join_all` 这种方式迭代处理，还是从函数里返回它，本质上都是在移动 Rust 为我们生成的那个状态机。与 Rust 中大多数其他类型不同的是，Rust 为 async 代码块生成的 future，可能会在某个状态变体的字段里保存指向它自身其他字段的引用，就像图 17-4 里的简化示意图那样。

<figure>

<img alt="A single-column, three-row table representing a future, fut1, which has data values 0 and 1 in the first two rows and an arrow pointing from the third row back to the second row, representing an internal reference within the future." src="img/trpl17-04.svg" class="center" />

<figcaption>图 17-4：一个自引用的数据类型</figcaption>

</figure>

但默认情况下，任何包含自引用的对象，一旦移动就是不安全的，因为引用始终指向它们所引用对象的真实内存地址（见图 17-5）。如果我们移动了这个数据结构本身，那么这些内部引用仍然会指向旧位置。然而那个内存地址现在已经失效了。一方面，你之后对数据结构做的修改不会再反映到那些旧引用上；另一方面，更严重的是，计算机此时已经可以把那块内存拿去做别的用途了。最后你很可能会读到完全无关的数据。

<figure>

<img alt="Two tables, depicting two futures, fut1 and fut2, each of which has one column and three rows, representing the result of having moved a future out of fut1 into fut2. The first, fut1, is grayed out, with a question mark in each index, representing unknown memory. The second, fut2, has 0 and 1 in the first and second rows and an arrow pointing from its third row back to the second row of fut1, representing a pointer that is referencing the old location in memory of the future before it was moved." src="img/trpl17-05.svg" class="center" />

<figcaption>图 17-5：移动自引用数据类型后产生的不安全结果</figcaption>

</figure>

理论上，Rust 编译器也可以尝试在对象被移动时更新所有引用，但这样很可能带来大量性能开销，尤其在需要更新的是一整张引用网络的时候。如果我们反过来，确保这个数据结构*根本不在内存中移动*，那就完全不需要更新任何引用。这正是 Rust 借用检查器要做的事：在安全代码里，它会阻止你移动任何仍然存在活动引用的值。

`Pin` 正是在这个基础上，进一步提供了我们需要的精确保证。当我们把一个指向某值的指针包进 `Pin` 里，也就是对这个值进行 *pin* 之后，它就不能再被移动了。因此，如果你有的是 `Pin<Box<SomeType>>`，那么真正被 pin 住的是 `SomeType` 这个值，而*不是* `Box` 指针本身。图 17-6 展示了这个过程。

<figure>

<img alt="Three boxes laid out side by side. The first is labeled “Pin”, the second “b1”, and the third “pinned”. Within “pinned” is a table labeled “fut”, with a single column; it represents a future with cells for each part of the data structure. Its first cell has the value “0”, its second cell has an arrow coming out of it and pointing to the fourth and final cell, which has the value “1” in it, and the third cell has dashed lines and an ellipsis to indicate there may be other parts to the data structure. All together, the “fut” table represents a future which is self-referential. An arrow leaves the box labeled “Pin”, goes through the box labeled “b1” and terminates inside the “pinned” box at the “fut” table." src="img/trpl17-06.svg" class="center" />

<figcaption>图 17-6：把一个指向自引用 future 类型的 `Box` pin 住</figcaption>

</figure>

实际上，`Box` 指针本身仍然可以自由移动。请记住：我们真正关心的是最终被引用的数据必须固定不动。如果指针移动了，*但它指向的数据*仍然留在原地，就像图 17-7 那样，那么就不会产生问题。（你可以把这当作一个独立练习：去查阅相关类型以及 `std::pin` 模块的文档，试着想清楚如果是 `Pin` 包着 `Box`，到底如何做到这一点。）关键在于：那个自引用的类型本身不能移动，因为它仍然是被 pin 住的。

<figure>

<img alt="Four boxes laid out in three rough columns, identical to the previous diagram with a change to the second column. Now there are two boxes in the second column, labeled “b1” and “b2”, “b1” is grayed out, and the arrow from “Pin” goes through “b2” instead of “b1”, indicating that the pointer has moved from “b1” to “b2”, but the data in “pinned” has not moved." src="img/trpl17-07.svg" class="center" />

<figcaption>图 17-7：移动一个指向自引用 future 类型的 `Box`</figcaption>

</figure>

不过，大多数类型即使碰巧放在 `Pin` 指针后面，也完全可以安全移动。只有当某个值内部真的包含引用时，我们才需要关心 pin。比如数字和布尔值这类基本类型显然没有内部引用，所以当然是安全的。你平时在 Rust 里处理的大多数类型也都是这样。比如一个 `Vec` 就可以自由移动而不用担心。考虑到目前为止我们看到的内容，如果你有一个 `Pin<Vec<String>>`，那理论上你必须通过 `Pin` 提供的那套安全但受限的 API 来操作它，哪怕 `Vec<String>` 在没有其他引用存在时始终都是可以安全移动的。因此，我们需要一种机制来告诉编译器：像这种情况，移动它完全没问题。这正是 `Unpin` 的用途。

`Unpin` 是一个标记 trait（marker trait），就像我们在第十六章见过的 `Send` 和 `Sync` 一样，它本身没有任何功能。marker trait 的存在，只是为了告诉编译器：实现了该 trait 的类型，在某种特定上下文里可以被安全使用。`Unpin` 告诉编译器，某个类型*不需要*维护“这个值是否可以安全移动”方面的额外保证。

就像 `Send` 和 `Sync` 一样，只要编译器能证明某个类型这样做是安全的，它就会自动为其实现 `Unpin`。同样也存在一个特殊情况：某个类型*不会*实现 `Unpin`。这种写法是 <code>impl !Unpin for <em>SomeType</em></code>，其中 <code><em>SomeType</em></code> 表示的是：为了在被 `Pin` 指针引用时保持安全，该类型必须保证自身不会被移动。

换句话说，关于 `Pin` 和 `Unpin` 的关系，有两件事要记住。第一，`Unpin` 才是“正常情况”，`!Unpin` 才是特殊情况。第二，一个类型到底实现的是 `Unpin` 还是 `!Unpin`，*只有在*你使用像 <code>Pin<&mut <em>SomeType</em>></code> 这样指向该类型的 pin 过的指针时，才真正有意义。

为了更具体一点，想想 `String`。它内部保存的是长度以及组成它的 Unicode 字符。我们完全可以把一个 `String` 包进 `Pin`，如图 17-8 所示。不过，`String` 会自动实现 `Unpin`，Rust 中绝大多数其他类型也一样。

<figure>

<img alt="A box labeled “Pin” on the left with an arrow going from it to a box labeled “String” on the right. The “String” box contains the data 5usize, representing the length of the string, and the letters “h”, “e”, “l”, “l”, and “o” representing the characters of the string “hello” stored in this String instance. A dotted rectangle surrounds the “String” box and its label, but not the “Pin” box." src="img/trpl17-08.svg" class="center" />

<figcaption>图 17-8：把一个 `String` pin 起来；虚线表示 `String` 实现了 `Unpin` trait，因此它实际上并没有被固定住</figcaption>

</figure>

结果就是，我们可以做一些如果 `String` 实现的是 `!Unpin` 就会非法的事情，比如像图 17-9 那样，在同一块内存位置上把一个字符串直接替换成另一个完全不同的字符串。这并没有违反 `Pin` 的约定，因为 `String` 内部没有那种会让它在移动时变得不安全的自引用。也正因为如此，它实现的是 `Unpin`，而不是 `!Unpin`。

<figure>

<img alt="The same “hello” string data from the previous example, now labeled “s1” and grayed out. The “Pin” box from the previous example now points to a different String instance, one that is labeled “s2”, is valid, has a length of 7usize, and contains the characters of the string “goodbye”. s2 is surrounded by a dotted rectangle because it, too, implements the Unpin trait." src="img/trpl17-09.svg" class="center" />

<figcaption>图 17-9：在内存中用一个完全不同的 `String` 替换原来的 `String`</figcaption>

</figure>

到这里，我们已经知道得足够多，可以理解前面示例 17-23 中那个 `join_all` 调用为什么会报错了。我们最初试图把 async 代码块生成的 future 移动进 `Vec<Box<dyn Future<Output = ()>>>` 中，但正如我们刚刚看到的，那些 future 可能带有内部引用，因此它们不会自动实现 `Unpin`。一旦把它们 pin 住，我们就可以放心地把得到的 `Pin` 类型放进 `Vec`，因为此时这些 future 底层的数据就*不会*再被移动。示例 17-24 展示了修复这段代码的方法：在定义每个 future 的地方调用 `pin!` 宏，并相应调整 trait object 的类型。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-24/src/main.rs:here}}
```

<figcaption>示例 17-24：将 future pin 住，以便把它们移动进向量中</figcaption>

</figure>

这段代码现在已经可以编译和运行了，而且我们还能在运行时动态地从向量里增加或删除 future，再把它们全部 join 在一起。

### `Stream` trait

现在你已经对 `Future`、`Pin` 和 `Unpin` 有了更深入的理解，我们可以把注意力转向 `Stream` trait 了。正如你在本章前面学到的，stream 很像异步迭代器。不过和 `Iterator` 以及 `Future` 不同的是，到本书写作时，标准库里还没有 `Stream` 的定义；但 `futures` crate 提供了一个在整个生态系统中被广泛采用的通用定义。

在看 `Stream` 如何把 `Iterator` 和 `Future` 的特征结合起来之前，我们先回顾一下这两个 trait 的定义。从 `Iterator` 我们得到了“序列”这个概念：它的 `next` 方法返回 `Option<Self::Item>`。从 `Future` 我们得到了“值会随着时间变得就绪”这个概念：它的 `poll` 方法返回 `Poll<Self::Output>`。为了表示“一串会随着时间逐渐就绪的项”，我们就可以定义这样一个 `Stream` trait，把两者的特征合并起来：

```rust
use std::pin::Pin;
use std::task::{Context, Poll};

trait Stream {
    type Item;

    fn poll_next(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>
    ) -> Poll<Option<Self::Item>>;
}
```

`Stream` trait 定义了一个名为 `Item` 的关联类型，用来表示 stream 产生的条目类型。这和 `Iterator` 很像，因为它可以有零个到多个条目；而和 `Future` 不同，后者始终只有一个 `Output`，哪怕这个输出只是 unit 类型 `()`。

`Stream` 还定义了一个获取这些条目的方法。它叫 `poll_next`，这个名字清楚地表明：它既像 `Future::poll` 那样进行轮询，又像 `Iterator::next` 那样生成一个接一个的条目。它的返回类型把 `Poll` 和 `Option` 组合了起来。最外层是 `Poll`，因为和 future 一样，它需要先检查是否就绪；里面那层是 `Option`，因为和迭代器一样，它还得表示“后面是否还有更多条目”。

和这个定义非常相似的版本，将来很可能会进入 Rust 标准库。在此之前，它已经是大多数运行时工具箱的一部分，因此你完全可以依赖它，而我们接下来讲的内容通常也都会成立。

不过，在我们前面[“Stream：按顺序出现的 Future”][streams]<!-- ignore -->一节中见到的那些例子里，我们并没有直接用 `poll_next` 或 `Stream`，而是用了 `next` 和 `StreamExt`。当然，我们*可以*像直接操作 future 的 `poll` 方法那样，手写自己的 `Stream` 状态机，直接基于 `poll_next` 来工作。不过，用 `await` 显然舒服得多，而 `StreamExt` trait 则为此提供了 `next` 方法：

```rust
{{#rustdoc_include ../listings/ch17-async-await/no-listing-stream-ext/src/lib.rs:here}}
```

> 注意：我们在本章前面实际使用到的定义，看起来会和这个稍微有点不同，因为它需要兼容那些还不支持“在 trait 中使用 async 函数”的 Rust 版本。所以它实际上更像这样：
>
> ```rust,ignore
> fn next(&mut self) -> Next<'_, Self> where Self: Unpin;
> ```
>
> 这里的 `Next` 类型是一个实现了 `Future` 的 `struct`，它通过 `Next<'_, Self>` 的形式，把对 `self` 的引用生命周期显式命名出来，这样 `await` 才能和这个方法一起工作。

`StreamExt` trait 还是所有那些“用于 stream 的有趣方法”的所在地。任何实现了 `Stream` 的类型，都会自动获得 `StreamExt` 的实现；不过这两个 trait 之所以分开定义，是为了让社区能够在不影响底层基础 trait 的前提下，不断迭代那些更方便的高层 API。

在 `trpl` crate 使用的这个 `StreamExt` 版本里，这个 trait 不仅定义了 `next` 方法，还给 `next` 提供了一个默认实现，这个实现会正确处理 `Stream::poll_next` 的各种细节。这意味着，即便你将来需要自己写一种流式数据类型，也*只需要*实现 `Stream`；然后，任何使用你这个数据类型的人，都会自动获得 `StreamExt` 及其方法。

关于这些 trait 的底层细节，我们就讲到这里。最后，让我们来想一想：future（包括 stream）、任务和线程到底是如何一起协作的。

[message-passing]: ch17-02-concurrency-with-async.html#通过消息传递在两个任务之间发送数据
[ch-18]: ch18-00-oop.html
[async-book]: https://rust-lang.github.io/async-book/
[under-the-hood]: https://rust-lang.github.io/async-book/02_execution/01_chapter.html
[pinning]: https://rust-lang.github.io/async-book/04_pinning/01_chapter.html
[first-async]: ch17-01-futures-and-syntax.html#第一个异步程序
[any-number-futures]: ch17-03-more-futures.html#使用任意数量的-futures
