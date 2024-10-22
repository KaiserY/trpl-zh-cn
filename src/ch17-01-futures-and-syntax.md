## Futures 和 async 语法

> [ch17-01-futures-and-syntax.md](https://github.com/rust-lang/book/blob/main/src/ch17-01-futures-and-syntax.md)
> <br>
> commit e95efa05706c5c4309df9ed47d5e91d8ed342b7d

Rust 异步编程的关键元素是 *futures* 和 Rust 的 `async` 与 `await` 关键字。

*future* 是一个现在可能还没有准备好但是在将来的某个时刻会准备好的值。（相同的概念出现在很多语言中，有时被称为 “task” 或者 “promise”。）Rust 提供了 `Future` trait 作为基础组件，这样不同的异步操作就可以在不同的数据结构上实现。在 Rust 中，我们称实现了 `Future` trait 的类型为 futures。每一个实现了 `Future` 的类型会保存自己的进度状态信息和 "ready" 的意义。

`async` 关键字可以作用于代码块和函数来指定它们可以被中断和继续。在一个 async 块或 async 函数中，可以使用 `await` 关键字来等待一个 future 准备就绪，这被称为 *等待一个 future*。async 块或 async 函数中每一个等待 future 的地方就是一个 async 块或 async 函数可能中断或继续的地方。检查一个 future 并查看其值是否已经准备就绪的过程被称为 *轮询*（polling）。

其它一些语言也会使用 `async` 和 `await` 关键字进行异步编程。如果你熟悉这些语言，则可能会注意到它们与 Rust 如何处理有显著的不同，包括语法处理。我们会看到这样做是有好的原因的。

大部分时间，当编写异步 Rust 时，我们使用 `async` 和 `await` 关键字。Rust 将其编译为等同于使用 `Future` trait 的代码，这非常类似于将 `for` 循环编译为等同于 `Iterator` trait 的代码。因为 Rust 提供了 `Future` trait，当需要的时候可以为你自己的类型实现它。在整个章节中你会看到很多函数的返回值类型都有其自己的 `Future` 实现。在本章的结尾我们会回到这个 trait 的定义并深入理解它是如何工作的，不过现在的细节已经足够我们继续学习了。

这感觉可能有一点抽象。让我们编写第一个异步程序：一个小型网络爬虫。我们会从命令行传递两个 URL，并发地解析它们，并返回第一个完成解析的结果。这个示例会有不少的新语法，不过不用担心。我们会解释所有你需要知道的内容。

### 第一个异步程序
