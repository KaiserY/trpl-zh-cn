## Futures 和 async 语法

> [ch17-01-futures-and-syntax.md](https://github.com/rust-lang/book/blob/main/src/ch17-01-futures-and-syntax.md)
> <br>
> commit e95efa05706c5c4309df9ed47d5e91d8ed342b7d

Rust 异步编程的关键元素是 *futures* 和 Rust 的 `async` 与 `await` 关键字。

*future* 是一个现在可能还没有准备好但将在未来某个时刻准备好的值。（相同的概念也出现在很多语言中，有时被称为 “task” 或者 “promise”。）Rust 提供了 `Future` trait 作为基础组件，这样不同的异步操作就可以在不同的数据结构上实现。在 Rust 中，我们称实现了 `Future` trait 的类型为 futures。每一个实现了 `Future` 的类型会维护自己的进度状态信息和 “ready” 的定义。

`async` 关键字可以用于代码块和函数，表明它们可以被中断并恢复。在一个 async 块或 async 函数中，可以使用 `await` 关键字来等待一个 future 准备就绪，这一过程称为 *等待一个 future*。async 块或 async 函数中每一个等待 future 的地方都可能是一个 async 块或 async 函数中断并随后恢复的点。检查一个 future 并查看其值是否已经准备就绪的过程被称为 *轮询*（polling）。

其它一些语言也使用 `async` 和 `await` 关键字进行异步编程。如果你熟悉这些语言，则可能会注意到它们与 Rust 的处理方式有显著不同，包括语法上的差异。我们将看到，这样做是有充分理由的！

在大多数情况下，编写异步 Rust 代码时，我们使用 `async` 和 `await` 关键字。Rust 将其编译为等同于使用 `Future` trait 的代码，这非常类似于将 `for` 循环编译为等同于使用 `Iterator` trait 的代码。不过，由于 Rust 提供了 `Future` trait，你也可以在需要时为你自己的数据类型实现它。在整个章节中你会看到很多函数的返回值类型都有其自己的 `Future` 实现。我们会在本章结尾回到这个 trait 的定义，并深入了解它的工作原理，但现在这些细节已经足够让我们继续前进了。

这些内容可能有点抽象。让我们来编写第一个异步程序：一个小型网络爬虫。我们会从命令行传递两个 URL，并发地解析它们，并返回第一个完成解析的结果。这个示例会引入不少的新语法，不过不用担心。我们会逐步解释所有你需要了解的内容。

### 第一个异步程序

为了保持本章的内容专注于学习 async，而不是处理生态系统的部分组件，我们已经创建了一个 `trpl` crate（`trpl` 是 “The Rust Programming Language” 的缩写）。它重导出了你需要的所有类型、traits 和函数，它们主要来自于 [`futures`][futures-crate] 和 [`tokio`][tokio] crates。

- `futures` crate 是一个 Rust 异步代码实验的官方仓库，也正是 `Future` 最初设计的地方。
-  Tokio 是目前 Rust 中应用最广泛的异步运行时（async runtime），特别是（但不仅是！）web 应用。这里还有其他优秀的运行时，它们可能更适合你的需求。我们在 `trpl` 的底层使用 Tokio 是因为它经过了充分测试且广泛使用。

在一些场景中，`trpl` 也会重命名或者封装原始 API 以便我们专注于与本章相关的细节。如果你想了解该 crate 的具体功能，我们鼓励你查看[其源码][crate-source]。你可以看到每个重导出的内容来自哪个 crate，我们留下了大量注释来解释这个 crate 的用途。

创建一个名为 `hello-async` 的二进制项目并将 `trpl` crate 作为一个依赖添加：

```console
$ cargo new hello-async
$ cd hello-async
$ cargo add trpl
```

现在我们可以利用 `trpl` 提供的多种组件来编写第一个异步程序。我们构建了一个小的命令行工具来抓取两个网页，拉取各自的 `<title>` 元素，并打印出第一个完成全部过程的标题。

让我们开始编写一个函数，它获取一个网页 URL 作为参数，请求该 URL 并返回标题元素的文本：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-01/src/main.rs:all}}
```

<figcaption>示例 17-1：定义一个 async 函数来获取一个 HTML 页面的标题元素</figcaption>

</figure>

在示例 17-1 中，我们定义了一个名为 `page_title` 的函数，并使用了 `async` 关键字标记。接着我们使用 `trpl::get` 函数来获取传入的任意 URL，然后使用 `await` 关键字来等待响应。接着我们调用其 `text` 方法来获取响应的文本，这里再一次使用 `await` 关键字等待。这两个步骤都是异步的。对于 `get` 来说，我们需要等待服务器发送回其响应的第一部分，这会包含 HTTP 头（headers）、cookies 等。这部分响应可以独立于响应体发送。特别是在响应体非常大时候，接收完整响应可能会花费一些时间。因此我们不得不等待响应 *整体* 返回，所以 `text` 方法也是异步。

我们必须显式地等待这两个 futures，因为 Rust 中的 futures 是 *惰性*（*lazy*）的：在你使用 `await` 请求之前它们不会执行任何操作。（事实上，如果你不使用一个 futures，Rust 会显示一个编译警告）这应该会让你想起[之前第十三章][iterators-lazy]关于迭代器的讨论。直到你调用迭代器的 `next` 方法（直接调用或者使用 `for` 循环或者类似 `map` 这类在底层使用 `next` 的方法）之前它们什么也不会做。对于 futures 来说，同样的基本理念也是适用的：除非你显式地请求，否则它们不会执行。惰性使得 Rust 可以避免提前运行异步代码，直到真正需要时才执行。

> 注意：这不同于上一章节中 `thread::spawn` 的行为，当时传递给另一个线程的闭包会立即开始运行。这也与许多其他语言处理异步的方式不同！但对于 Rust 而言，这一点非常重要。稍后我们会解释原因。

当我们有了 `response_text` 函数，就可以使用 `Html::parse` 将其解析为一个 `Html` 类型的实例。不同于原始字符串，现在我们有了一个可以将 HTML 作为更丰富数据结构来操作的数据类型。特别是我们可以使用 `select_first` 方法来找出给定 CSS 选择器（selector）中第一个匹配元素。通过传递字符串 `"title"`，我们会得到文档中的第一个 `<title>` 元素，如果它存在的话。由于可能没有任何匹配的元素，`select_first` 返回一个 `Option<ElementRef>`。最后我们使用 `Option::map` 方法，它允许我们在 `Option` 中有元素时对其进行处理，而在没有时则什么也不做。（这里也可以使用一个 `match` 表达式，但 `map` 更符合惯用的写法。）在传递给 `map` 的函数体中，我们调用了 `title_element` 上的 `inner_html` 来获取其内容，这是一个 `String`。当上面所讲的都完成后，我们会得到一个 `Option<String>`。

注意 Rust 的 `await` 关键字出现在需要等待的表达式之后而不是之前。也就是说，这是一个 *后缀关键字*（*postfix keyword*）。如果你在其它语言中使用过 async 的话，这可能与你所熟悉的有所不同。Rust 如此选择是因为这使得方法的链式调用更加简洁。因此，我们可以修改 `page_url_for` 的函数体来链式调用 `trpl::get` 和 `text` 并在其之间使用 `await`，如示例 17-2 所示：


<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-02/src/main.rs:chaining}}
```

<figcaption>示例 17-2：使用 `await` 关键字的链式调用</figcaption>

</figure>

这样我们就成功编写了第一个异步函数！在我们向 `main` 加入一些代码调用它之前，让我们再多了解下我们写了什么以及它的意义。

当 Rust 遇到一个 `async` 关键字标记的代码块时，会将其编译为一个实现了 `Future` trait 的唯一的、匿名的数据类型。当 Rust 遇到一个被标记为 `async` 的函数时，会将其编译进一个拥有异步代码块的非异步函数。异步函数的返回值类型是编译器为异步代码块所创建的匿名数据类型。

因此，编写 `async fn` 就等同于编写一个返回类型的 *future* 的函数。当编译器遇到类似示例 17-1 中 `async fn page_title` 的函数定义时，它等价于以下定义的非异步函数：

```rust
# extern crate trpl; // required for mdbook test
use std::future::Future;
use trpl::Html;

fn page_title(url: &str) -> impl Future<Output = Option<String>> + '_ {
    async move {
        let text = trpl::get(url).await.text().await;
        Html::parse(&text)
            .select_first("title")
            .map(|title| title.inner_html())
    }
}
```

让我们挨个看一下转换后版本的每一个部分：

- 它使用了之前第十章 [“trait 作为参数”][impl-trait] 部分讨论过的 `impl Trait` 语法
- 它返回的 trait 是一个 `Future`，它有一个关联类型 `Output`。注意 `Output` 的类型是 `Option<String>`，这与 `async fn` 版本的 `page_title` 的原始返回值类型相同。
- 所有原始函数中被调用的代码被封装进一个 `async move` 块。回忆一下，代码块是表达式。这整个块就是函数所返回的表达式
- 如上所述，这个异步代码块产生一个 `Option<String>` 类型的值。这个值与返回类型中的 `Output` 类型一致。这正类似于你已经见过的其它代码块。
- 新版函数的函数体是一个 `async move` 代码块，因为它如何使用 `url` 参数决定了这一点。（本章后续部分将更详细地讨论 `async` 和 `async move` 之间的区别。）
- 新版本的函数在返回类型中使用了一种我们之前未见过的生命周期标记：`'_`。因为函数返回的 `Future` 指向一个引用（在这个例子中是指向 `url` 参数的引用）我们需要告诉 Rust 引用的生命周期。这里无需命名该生命周期，因为 Rust 足够智能到能理解这里只涉及到唯一一个引用，不过我们 *必须* 明确指出返回的 `Future` 受该生命周期的约束。

现在我们可以在 `main` 中调用 `page_title`。首先，我们只会获取一个页面的标题。在示例 17-3 中，我们沿用了第十二章中获取命令行参数的相同模式。接着我们传递第一个 URL 给 `page_title`，并等待结果。因为 future 产生的值是一个 `Option<String>`，我们使用 `match` 表达式来根据页面是否有 `<title>` 来打印不同的信息。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-03/src/main.rs:main}}
```

<figcaption>示例 17-3：在 `main` 中通过一个用户提供的参数调用 `page_title` 函数</figcaption>

</figure>

很不幸的是这还不能编译。唯一可以使用 `await` 关键字的地方是异步函数或者代码块中，同时 Rust 不允许将特殊的 `main` 函数标记为 `async`。

<!-- manual-regeneration
cd listings/ch17-async-await/listing-17-03
cargo build
copy just the compiler error
-->

```text
error[E0752]: `main` function is not allowed to be `async`
 --> src/main.rs:6:1
  |
6 | async fn main() {
  | ^^^^^^^^^^^^^^^ `main` function is not allowed to be `async`
```

`main` 不能标记为 `async` 的原因是异步代码需要一个 *运行时*：即一个管理执行异步代码细节的 Rust crate。一个程序的 `main` 函数可以 *初始化* 一个运行时，但是其 *自身* 并不是一个运行时。（稍后我们会进一步解释原因。）每一个执行异步代码的 Rust 程序必须至少有一个设置运行时并执行 futures 的地方。

大部分支持异步的语言会打包一个运行时在语言中，Rust 则不是。相反，这里有很多不同的异步运行时，每一个都有适合其目标的权衡取舍。例如，一个拥有很多核心和大量内存的高吞吐 web server 与一个单核、少量内存并且没有堆分配能力的微控制器相比有着截然不同的需求。提供这些运行时的 crate 通常也提供了例如文件或者网络 IO 这类常用功能的异步版本。

从这里到本章余下部分，我们会使用 `trpl` crate 的 `run` 函数，它获取一个 future 作为参数并运行到结束。在内部，调用 `run` 会设置一个运行时来运行传递的 future。一旦 future 完成，`run` 返回 future 返回的任何值。

我们可以将 `page_title` 返回的 future 直接传递给 `run`。一旦其完成，我们能够匹配返回的 `Option<String>`，正如示例 17-3 我们尝试的那样。然而，在本章的大部分示例中（以及大多数实际应用中的异步代码中！），我们会执行不止一次异步函数调用，所以相反我们会传递一个 `async` 块并显式地等待 `page_title` 调用的结果，如示例 17-4 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,should_panic,noplayground
{{#rustdoc_include ../listings/ch17-async-await/listing-17-04/src/main.rs:run}}
```

<figcaption>示例 17-4：等待一个使用异步代码块的 `trpl::run`</figcaption>

</figure>

当我们运行代码，我们会得到最初预想的行为：

```console
{{#include ../listings/ch17-async-await/listing-17-04/output.txt}}
```

我们终于有了一些可以正常工作的异步代码！现在它们可以成功编译并运行。在我们添加代码让两个网址进行竞争之前，让我们简要地回顾一下 future 是如何工作的。

每一个 *await point*，也就是代码使用 `await` 关键字的地方，代表将控制权交还给运行时的地方。为此 Rust 需要记录异步代码块中涉及的状态，这样运行时可以去执行其他工作，并在准备好时回来继续推进当前的任务。这就像你通过编写一个枚举来保存每一个 `await` point 的状态一样：

```rust
{{#rustdoc_include ../listings/ch17-async-await/no-listing-state-machine/src/lib.rs:enum}}
```

编写代码来手动控制不同状态之间的转换是非常乏味且容易出错的，特别是之后增加了更多功能和状态的时候。相反，Rust 编译器自动创建并管理异步代码的状态机数据结构。如果你感兴趣的话：是的，正常的借用和所有权也全部适用于这些数据结构。幸运的是，编译器也会为我们处理这些检查，并提供友好的错误信息。本章稍后会讲解一些相关内容！

最终需要某个组件来执行状态机。这就是运行时。（这也是为什么在了解运行时的时候，你可能会看到 *executors* 这个词：executor 是运行时中负责执行异步代码的部分。）

现在我们能够理解了之前示例 17-3 中为何编译器阻止我们将 `main` 本身标记为异步函数了。如果 `main` 是一个异步函数，需要有其它组件来管理 `main` futrue 返回的状态机，但是 `main` 是程序的入口点！为此我们在 `main` 函数中调用 `trpl::run`，它设置了一个运行时并运行 `async` 块返回的 future 并等待它返回 `Ready`。

> 注意：一些运行时提供了相关的宏所以你 *可以* 编写一个异步 `main` 函数。这些宏将 `async fn main() { ... }` 重写为正常的 `fn main`，执行的逻辑与我们在示例 17-5 中手动实现的一样：像 `trpl::run` 一样调用一个函数运行 future 直到结束。

让我们将这些代码片段整理一下来看看如何编写并发代码，这里通过两个来自命令行的不同 URL 来调用 `page_title` 并使其相互竞争。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

<!-- should_panic,noplayground because mdbook does not pass args -->

```rust,should_panic,noplayground
{{#rustdoc_include ../listings/ch17-async-await/listing-17-05/src/main.rs:all}}
```

<figcaption>示例 17-5</figcaption>

</figure>

示例 17-5 中以分别由用户提供的 URL 调用 `page_title` 开始。我们将调用 `page_title` 产生的 future 分别保存为 `title_fut_1` 和 `title_fut_2`。请记住，它们还没有进行任何工作，因为 future 是惰性的，并且我们还没有 `await` 它们。接着我们将 futures 传递给 `trpl::race`，它返回一个值表明哪个传递的 future 最先返回。

> 注意：在内部 `race` 构建在一个更通用的函数 `select` 之上，你会在真实的 Rust 代码中更常遇到它。`select` 函数可以做很多 `trpl::race` 函数做不了的事，不过它也有一些额外的复杂性，所以目前我们先略过介绍。

由于任何一个 future 都可以合理地 “获胜”，所以返回 `Result` 没有意义。相反 `race` 返回了一个我们之前没有见过的类型 `trpl::Either`。`Either` 类型有点类似于 `Result`，它也有两个成员。但是不同于 `Either`，`Either` 没有内置成功或者失败的概念。相反它使用 `Left` 和 `Right` 来表示 “一个或另一个”。

```rust
enum Either<A, B> {
    Left(A),
    Right(B),
}
```

`race` 函数返回 `Left`，如果第一个参数先完成，并包含该 future 的输出，如果 *第二个* future 先完成，则返回 `Right` 和第二个 future 的输出。这匹配调用函数时参数出现的顺序：第一个参数在第二个参数的左边。

我们还更新了 `page_title` 来返回与传递时相同的 URL。如此如果首先返回的页面没有可以解析的 `<title>`，仍然可以打印出有意义的信息。有了这些信息，我们对 `println!` 的输出进行了封装和更新，以表明哪个 URL 最先完成，并在页面有 `<title>` 时打印出它的内容。

现在我们完成一个小型网页爬虫的构建了！挑选一对 URL 并运行命令行工具。你会发现某些网站稳定地快于其它网站，而有些情况哪些网站会 *赢* 则每次都不同。更重要的是，你已经掌握了处理 futures 的基础知识，因此我们现在可以进一步探索更多异步操作的可能性了。

[impl-trait]: ch10-02-traits.html#trait-作为参数
[iterators-lazy]: ch13-02-iterators.html
<!-- TODO: map source link version to version of Rust? -->
[crate-source]: https://github.com/rust-lang/book/tree/main/packages/trpl
[futures-crate]: https://crates.io/crates/futures
[tokio]: https://tokio.rs
