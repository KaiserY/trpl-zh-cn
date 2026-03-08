## Future 与 async 语法

[ch17-01-futures-and-syntax.md](https://github.com/rust-lang/book/blob/0d5a0dd395aba1f82d7e5aaf6dbb59b2b843ad2c/src/ch17-01-futures-and-syntax.md)

Rust 异步编程的关键元素是 *futures* 和 Rust 的 `async` 与 `await` 关键字。

*future* 是一个现在也许还没准备好，但会在将来某个时刻准备好的值。（这个概念在很多语言里都存在，只是有时会用 *task* 或 *promise* 之类的名字。）Rust 提供了 `Future` trait 作为基础构件，让不同的异步操作可以用不同的数据结构来实现，同时又拥有统一的接口。在 Rust 中，future 就是那些实现了 `Future` trait 的类型。每个 future 都保存了自身的进度信息，以及“就绪”到底意味着什么。

`async` 关键字可以用于代码块和函数，表示它们可以被中断和恢复。在 async 块或 async 函数中，你可以使用 `await` 关键字来 *await 一个 future*，也就是等待它变为就绪。在 async 块或函数里，每个等待 future 的位置，都是这个块或函数可能暂停并随后恢复的点。检查 future、看看它的值是否已经可用，这个过程称为 *polling*（轮询）。

其他一些语言，例如 C# 和 JavaScript，也用 `async` 和 `await` 关键字进行异步编程。如果你熟悉这些语言，可能会注意到 Rust 在语法处理上存在一些明显差异。我们会看到，这样设计是有充分理由的。

编写异步 Rust 时，大多数时候我们直接使用 `async` 和 `await` 关键字。Rust 会把它们编译成等价的、基于 `Future` trait 的代码，就像它把 `for` 循环编译成基于 `Iterator` trait 的等价代码一样。不过，既然 Rust 提供了 `Future` trait，你在需要时也可以为自己的数据类型实现它。本章中我们会见到很多函数，它们都返回拥有各自 `Future` 实现的类型。我们会在本章结尾回到这个 trait 的定义，进一步深入理解它的工作原理；不过眼下这些细节已经足够让我们继续前进。

这些内容可能仍然有些抽象，所以我们来写第一个异步程序：一个小型网页抓取器。我们会从命令行传入两个 URL，并发地抓取它们，然后返回那个最先完成的结果。这个例子会带来不少新语法，不过不用担心，我们会一路把需要知道的内容都解释清楚。

## 第一个异步程序

为了让本章专注于学习 async，而不是在生态系统的各种组件之间来回切换，我们准备了一个 `trpl` crate（`trpl` 是 “The Rust Programming Language” 的缩写）。它重新导出了本章需要的所有类型、trait 和函数，主要来自 [`futures`][futures-crate] 和 [`tokio`][tokio] crate。`futures` crate 是 Rust 异步代码实验的官方阵地，`Future` trait 最初就是在那里设计出来的。Tokio 则是目前 Rust 中使用最广泛的异步运行时（async runtime），尤其常见于 Web 应用。生态中也还有其他很优秀的运行时，而且它们可能更适合你的实际用途。我们在 `trpl` 的底层使用 `tokio`，是因为它经过了充分测试，也足够常用。

在某些场景下，`trpl` 还会对原始 API 进行重命名或包装，好让你把注意力集中在本章相关的细节上。如果你想了解这个 crate 实际做了什么，我们建议你看看[它的源码][crate-source]。你可以从中看到每个重导出项究竟来自哪个 crate，我们也留下了很多注释来解释这个 crate 的行为。

创建一个名为 `hello-async` 的二进制项目并将 `trpl` crate 作为一个依赖添加：

```console
$ cargo new hello-async
$ cd hello-async
$ cargo add trpl
```

现在我们可以利用 `trpl` 提供的各种组件来编写第一个异步程序。我们要构建一个小型命令行工具：抓取两个网页，从各自页面中提取 `<title>` 元素，然后打印出那个最先完成整套流程的页面标题。

### 定义 page_title 函数

让我们开始编写一个函数，它获取一个网页 URL 作为参数，请求该 URL 并返回标题元素的文本（见示例 17-1）。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-01/src/main.rs:all}}
```

<figcaption>示例 17-1：定义一个 async 函数来获取一个 HTML 页面的标题元素</figcaption>

</figure>

首先，我们定义了一个名为 `page_title` 的函数，并用 `async` 关键字标记它。然后使用 `trpl::get` 函数抓取传入的 URL，再用 `await` 关键字等待响应。为了得到 `response` 的文本，我们调用它的 `text` 方法，并再次使用 `await` 进行等待。这两个步骤都是异步的。对于 `get` 函数来说，我们必须等待服务器先把响应的第一部分发回来，其中包括 HTTP headers、cookies 等，这些内容可以和响应体分开发送。尤其当响应体很大时，全部数据到达可能要花上一些时间。由于我们必须等待响应*完整*到达，`text` 方法自然也是 async 的。

我们必须显式地等待这两个 future，因为 Rust 中的 future 是 *lazy* 的：在你用 `await` 请求它之前，它什么都不会做。（实际上，如果你创建了 future 却不使用它，Rust 还会给出编译器警告。）这大概会让你想起第十三章[“使用迭代器处理元素序列”][iterators-lazy]中的讨论。迭代器只有在你调用 `next` 方法时才会工作，无论是直接调用，还是通过 `for` 循环，或者借助像 `map` 这样底层会调用 `next` 的方法。future 也是一样，只有你显式要求它运行时，它才会开始工作。这种惰性让 Rust 能够避免在真正需要之前就运行异步代码。

> 注意：这和我们在第十六章[“使用 spawn 创建新线程”][thread-spawn]里看到的 `thread::spawn` 的行为不同，在那里我们传给新线程的闭包会立刻开始执行。它也和许多其他语言处理 async 的方式不同。但这对于 Rust 提供它一贯的性能保证很重要，正如迭代器也是如此。

有了 `response_text` 之后，我们就可以用 `Html::parse` 把它解析成 `Html` 类型的实例。这样一来，我们得到的就不再是原始字符串，而是一个可以把 HTML 当作更丰富数据结构来操作的类型。特别是，我们可以用 `select_first` 方法找到给定 CSS selector 的第一个匹配项。传入字符串 `"title"` 后，我们就能拿到文档中的第一个 `<title>` 元素，如果它存在的话。因为也可能根本没有匹配项，所以 `select_first` 返回的是 `Option<ElementRef>`。最后，我们使用 `Option::map` 方法：如果 `Option` 中有值，它就会对其中的值进行处理；如果没有，就什么都不做。（这里当然也可以使用 `match` 表达式，不过 `map` 更符合惯用写法。）在我们传给 `map` 的闭包里，会对 `title` 调用 `inner_html` 来获取其中的内容，它是一个 `String`。到这里，我们最终得到的就是一个 `Option<String>`。

注意，Rust 的 `await` 关键字放在要等待的表达式*后面*，而不是前面。也就是说，它是一个 *postfix keyword*（后缀关键字）。如果你在其他语言里用过 async，这一点可能和你的习惯不同；但在 Rust 中，这种设计会让链式方法调用更易读。因此，我们可以把 `page_title` 的函数体改写成在 `trpl::get` 和 `text` 调用之间插入 `await` 的链式写法，如示例 17-2 所示：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch17-async-await/listing-17-02/src/main.rs:chaining}}
```

<figcaption>示例 17-2：使用 `await` 关键字的链式调用</figcaption>

</figure>

这样我们就成功编写了第一个异步函数！在我们向 `main` 加入一些代码调用它之前，让我们再多了解下我们写了什么以及它的意义。

当 Rust 遇到一个 `async` 关键字标记的代码块时，会将其编译为一个实现了 `Future` trait 的唯一的、匿名的数据类型。当 Rust 遇到一个被标记为 `async` 的函数时，会将其编译成一个函数体是异步代码块的非异步函数。异步函数的返回值类型是编译器为异步代码块所创建的匿名数据类型。

因此，编写 `async fn` 就等同于编写一个返回类型为 *future* 的函数。当编译器遇到类似示例 17-1 中 `async fn page_title` 的函数定义时，它等价于以下定义的非异步函数：

```rust
# extern crate trpl; // required for mdbook test
use std::future::Future;
use trpl::Html;

fn page_title(url: &str) -> impl Future<Output = Option<String>> {
    async move {
        let text = trpl::get(url).await.text().await;
        Html::parse(&text)
            .select_first("title")
            .map(|title| title.inner_html())
    }
}
```

让我们挨个看一下转换后版本的每一个部分：

- 它使用了之前第十章 [“trait 作为参数”][impl-trait] 部分讨论过的 `impl Trait` 语法。
- 它返回的值实现了 `Future` trait，并且这个 trait 有一个关联类型 `Output`。注意 `Output` 的类型是 `Option<String>`，这和 `async fn` 版本的 `page_title` 的原始返回类型一致。
- 原始函数体中的所有代码都被包进了一个 `async move` 块。回忆一下，代码块本身就是表达式。整个块就是函数返回的那个表达式。
- 如上所述，这个异步代码块产生一个 `Option<String>` 类型的值。这个值与返回类型中的 `Output` 类型一致。这正类似于你已经见过的其它代码块。
- 这个新函数体之所以是 `async move` 块，是由它使用 `url` 参数的方式决定的。（本章后面会更详细地讨论 `async` 和 `async move` 的区别。）

现在我们可以在 `main` 中调用 `page_title`。

### 使用运行时执行异步函数

首先，我们只获取单个页面的标题，如示例 17-3 所示。不幸的是，这段代码还不能编译。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-async-await/listing-17-03/src/main.rs:main}}
```

<figcaption>示例 17-3：在 `main` 中通过一个用户提供的参数调用 `page_title` 函数</figcaption>

</figure>

我们沿用了第十二章[“接受命令行参数”][cli-args]一节中获取命令行参数的模式。然后把 URL 参数传给 `page_title`，再等待它的结果。由于 future 产出的值是 `Option<String>`，我们使用 `match` 表达式来根据页面是否含有 `<title>` 打印不同的信息。

唯一能使用 `await` 关键字的地方，是 async 函数或 async 代码块中，而 Rust 又不允许我们把特殊的 `main` 函数标记为 `async`。

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

大多数支持 async 的语言都会自带运行时，但 Rust 不会。相反，Rust 有很多不同的异步运行时可供选择，每一种都针对自己的目标用例做了不同权衡。比如，一个拥有许多 CPU 核心和大量 RAM 的高吞吐 Web 服务器，和一个单核、RAM 很小、甚至不能进行堆分配的微控制器，需求就截然不同。提供这些运行时的 crate 往往也会一并提供文件或网络 I/O 等常见功能的异步版本。

在这里，以及本章余下的部分，我们会使用 `trpl` crate 提供的 `block_on` 函数。它接受一个 future 作为参数，并阻塞当前线程，直到这个 future 运行完成为止。在内部，调用 `block_on` 会借助 `tokio` crate 设置一个运行时，用来执行传入的 future（`trpl` 的 `block_on` 和其他运行时 crate 提供的同名函数行为类似）。一旦 future 完成，`block_on` 就会返回 future 产生的值。

我们当然可以把 `page_title` 返回的 future 直接传给 `block_on`，并在它完成后对得到的 `Option<String>` 进行匹配，就像我们在示例 17-3 中本来打算做的那样。不过，本章的大部分例子里（以及现实中的大多数 async 代码里），我们都不止会进行一次异步函数调用，因此我们改为传入一个 `async` 块，并在其中显式等待 `page_title` 的结果，如示例 17-4 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,should_panic,noplayground
{{#rustdoc_include ../listings/ch17-async-await/listing-17-04/src/main.rs:run}}
```

<figcaption>示例 17-4：使用 `trpl::block_on` 等待一个 async 代码块</figcaption>

</figure>

当我们运行这段代码时，就会得到一开始期待的行为：

```console
$ cargo run -- https://www.rust-lang.org
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.05s
     Running `target/debug/async_await 'https://www.rust-lang.org'`
The title for https://www.rust-lang.org was
            Rust Programming Language
```

我们终于有了一些可以正常工作的异步代码！不过在我们添加代码让两个网址进行竞争之前，让我们简要地回顾一下 future 是如何工作的。

每一个 *await point*，也就是代码使用 `await` 关键字的地方，代表将控制权交还给运行时的地方。为此 Rust 需要记录异步代码块中涉及的状态，这样运行时可以去执行其他工作，并在准备好时回来继续推进当前的任务。这就像你通过编写一个枚举来保存每一个 `await` point 的状态一样：

```rust
{{#rustdoc_include ../listings/ch17-async-await/no-listing-state-machine/src/lib.rs:enum}}
```

编写代码来手动控制不同状态之间的转换是非常乏味且容易出错的，特别是之后增加了更多功能和状态的时候。相反，Rust 编译器自动创建并管理异步代码的状态机数据结构。如果你感兴趣的话：是的，正常的借用和所有权也全部适用于这些数据结构。幸运的是，编译器也会为我们处理这些检查，并提供友好的错误信息。本章稍后会讲解一些相关内容！

最终，总得有某个组件来执行这个状态机，而那个组件就是运行时。（这也是为什么在了解运行时时，你可能会看到 *executor* 这个词：executor 是运行时中负责执行异步代码的那一部分。）

现在你就能理解，为什么编译器会在示例 17-3 中阻止我们把 `main` 本身写成异步函数了。如果 `main` 是 async 函数，那么就必须有别的东西来管理 `main` 返回的 future 对应的状态机；可 `main` 本身就是程序的入口点！因此，我们改为在 `main` 中调用 `trpl::block_on`，让它设置好运行时，并运行 `async` 块返回的 future，直到执行完成。

> 注意：有些运行时会提供宏，因此你*确实可以*写异步版的 `main` 函数。这些宏会把 `async fn main() { ... }` 重写成普通的 `fn main`，其逻辑和我们在示例 17-4 中手动做的事情一样：调用一个像 `trpl::block_on` 这样的函数，把 future 跑到完成为止。

现在让我们把这些部分组合起来，看看如何编写并发代码。

### 让两个 URL 并发竞争

在示例 17-5 中，我们会对从命令行传入的两个不同 URL 分别调用 `page_title`，并选出最先完成的那个 future。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

<!-- should_panic,noplayground because mdbook does not pass args -->

```rust,should_panic,noplayground
{{#rustdoc_include ../listings/ch17-async-await/listing-17-05/src/main.rs:all}}
```

<figcaption>示例 17-5：对两个 URL 调用 `page_title`，看谁先返回</figcaption>

</figure>

我们首先分别对用户提供的两个 URL 调用 `page_title`。随后把得到的 future 保存到 `title_fut_1` 和 `title_fut_2` 中。记住，它们此时还什么都没做，因为 future 是惰性的，而我们也还没有等待它们。接着我们把这些 future 传给 `trpl::select`，它会返回一个值，用来表明传入的 future 中哪一个最先完成。

> 注意：在底层，`trpl::select` 建立在 `futures` crate 中更通用的 `select` 函数之上。`futures` crate 的 `select` 函数能做很多 `trpl::select` 做不到的事，不过它也带来了一些额外复杂性，所以我们暂时先跳过。

任意一个 future 都有可能“获胜”，因此这里返回 `Result` 并不合理。相反，`trpl::select` 返回的是一个我们之前还没见过的类型：`trpl::Either`。`Either` 在某种程度上有点像 `Result`，也有两个分支；但不同的是，它并没有内建“成功”或“失败”的语义，而是用 `Left` 和 `Right` 来表示“这个或那个”。

```rust
enum Either<A, B> {
    Left(A),
    Right(B),
}
```

如果第一个参数先完成，`select` 就返回 `Left`，其中包含该 future 的输出；如果第二个 future 先完成，则返回 `Right`，其中包含第二个 future 的输出。这正好对应函数调用时参数的顺序：第一个参数位于第二个参数的左边。

我们还更新了 `page_title`，让它把传入的 URL 一并返回。这样一来，即使最先返回的页面无法解析出 `<title>`，我们仍然可以打印出一条有意义的信息。有了这些数据之后，我们最后再调整 `println!` 的输出，让它既能显示哪个 URL 最先完成，也能在页面存在 `<title>` 时打印出标题内容。

至此，你已经构建出了一个可以工作的迷你网页抓取器！随便选两个 URL 运行一下这个命令行工具吧。你会发现有些站点总是比另一些更快，而另一些情况下则每次运行谁快谁慢都不一定。更重要的是，你已经掌握了使用 future 的基础知识，所以现在我们可以继续深入，看看 async 还能做些什么。

[crate-source]: https://github.com/rust-lang/book/tree/main/packages/trpl
[futures-crate]: https://crates.io/crates/futures
[tokio]: https://tokio.rs

[impl-trait]: ch10-02-traits.html#使用-trait-作为参数
[iterators-lazy]: ch13-02-iterators.html
[thread-spawn]: ch16-01-threads.html#使用-spawn-创建新线程
[cli-args]: ch12-01-accepting-command-line-arguments.html
