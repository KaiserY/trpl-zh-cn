## 变量和可变性

[ch03-01-variables-and-mutability.md](https://github.com/rust-lang/book/blob/9cc190796f28505c7a9a9cacea42f50d895ff3bd/src/ch03-01-variables-and-mutability.md)

正如第二章中[“使用变量储存值”][storing-values-with-variables] 一节提到的那样，变量默认是不可变的（immutable）。这是 Rust 给你的众多提醒之一，促使你以能充分利用 Rust 所提供的安全性和易于并发的方式来编写代码。不过，你仍然可以把变量设为可变。让我们来探讨 Rust 为何以及如何鼓励你偏向使用不可变性，以及为什么有时你会想要选择不这么做。

当变量不可变时，一旦值被绑定一个名称上，你就不能改变这个值。为了对此进行说明，使用 `cargo new variables` 命令在 *projects* 目录生成一个叫做 *variables* 的新项目。

接着，在新建的 *variables* 目录中，打开 *src/main.rs* 并将其中的代码替换为下面这段代码。它现在还不能编译：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-01-variables-are-immutable/src/main.rs}}
```

保存并使用 `cargo run` 运行程序。应该会看到一条与不可变性有关的错误信息，如下输出所示：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-01-variables-are-immutable/output.txt}}
```

这个例子展示了编译器如何帮助你发现程序中的错误。编译错误可能令人沮丧，但它们其实只意味着你的程序还没有以安全的方式完成你希望它完成的工作；这**并不**意味着你不是一个好程序员！经验丰富的 Rustaceans 也一样会遇到编译错误。

你收到的错误信息 ``cannot assign twice to immutable variable `x` ``，是因为你试图给不可变变量 `x` 赋第二个值。

当我们尝试修改一个被指定为不可变的值时，能够得到编译时错误是很重要的，因为这种情况可能会导致 bug。如果代码的一部分假设某个值永远不会改变，而另一部分代码却改变了这个值，那么前一部分代码就可能无法按设计那样运行。事后要追踪这类 bug 的根源会非常困难，尤其是当第二段代码只是**有时**才会修改这个值的时候。

Rust 编译器保证，如果声明一个值不会变，它就真的不会变，所以你不必自己跟踪它。这意味着你的代码更易于推导。

不过，可变性也非常有用，能让代码写起来更方便。尽管变量默认是不可变的，你仍然可以像[第二章][storing-values-with-variables]中那样，在变量名前加上 `mut` 使其变为可变。添加 `mut` 也能向未来阅读代码的人传达一种意图：这个变量的值将会被代码的其他部分改变。

例如，让我们将 *src/main.rs* 修改为如下代码：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-02-adding-mut/src/main.rs}}
```

现在运行这个程序，会出现如下内容：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-02-adding-mut/output.txt}}
```

使用 `mut` 后，我们就可以把绑定到 `x` 的值从 `5` 改成 `6`。归根结底，是否使用可变性由你自己决定，这取决于在特定场景下你觉得怎样会让代码更清晰。

### 常量

和不可变变量类似，*常量（constants）* 也是绑定到某个名称且不允许改变的值，不过常量和变量之间还是有一些区别。

首先，你不能对常量使用 `mut`。常量不只是默认不可变，它们永远都是不可变的。声明常量时要用 `const` 关键字，而不是 `let`，并且 *必须* 标注值的类型。在下一节[“数据类型”][data-types]中，我们会介绍类型和类型注解，所以现在先不用担心细节；你只要记住：声明常量时必须总是标注类型。

常量可以在任何作用域中声明，包括全局作用域，这在一个值需要被很多部分的代码用到时很有用。

最后一个区别是，常量只能被设置为常量表达式，而不能是那些只能在运行时计算出来的值。

下面是一个声明常量的例子：

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

这个常量的名字是 `THREE_HOURS_IN_SECONDS`，它的值通过 60（一分钟中的秒数）乘以 60（一小时中的分钟数）再乘以 3（我们这个程序中要计算的小时数）得出。Rust 对常量的命名约定是全部大写，并用下划线分隔单词。编译器可以在编译时对一组有限的操作进行求值，因此我们可以选择用更易于理解和验证的方式来写出这个值，而不是将此常量设置为值 10,800。关于声明常量时可以使用哪些操作的更多信息，请参阅 [Rust Reference 中关于常量求值的部分][const-eval]。

在其声明所在的作用域内，常量在程序运行的整个过程中都有效。这一特性使常量非常适合作为应用领域中的全局值，比如游戏中所有玩家能够获得的最高分，或者光速这样的值。

把散落在应用程序中的硬编码值提取为常量，有助于让以后维护代码的人理解这个值的含义。如果未来需要更新这个硬编码值，也只需要修改一个地方。

### 遮蔽

正如我们在[第二章][comparing-the-guess-to-the-secret-number]的猜数字游戏中看到的，我们可以定义一个与之前变量同名的新变量。Rustaceans 把这种情况称为第一个变量被第二个变量 **遮蔽（shadowed）** 了。这意味着，当你使用这个变量名时，编译器看到的是第二个变量。实际上，第二个变量会遮住第一个变量，使得后续所有对该名称的使用都指向第二个变量，直到它自己又被遮蔽，或者它的作用域结束。我们可以通过重复使用同一个变量名并再次写出 `let` 关键字来遮蔽一个变量，如下所示：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-03-shadowing/src/main.rs}}
```

这个程序首先把 `x` 绑定到值 `5`。接着，它再次写出 `let x =`，创建了一个新的变量 `x`，取原来的值并加上 `1`，于是 `x` 的值变成了 `6`。然后，在由花括号创建的内部作用域中，第三个 `let` 语句再次遮蔽了 `x`，并创建了一个新变量，把之前的值乘以 `2`，因此 `x` 的值变成了 `12`。当这个作用域结束时，内部的遮蔽也随之结束，`x` 又回到 `6`。运行这个程序时，会得到如下输出：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-03-shadowing/output.txt}}
```

遮蔽和把变量标记为 `mut` 是不同的。如果你不小心尝试在没有使用 `let` 关键字的情况下重新给变量赋值，就会得到编译时错误。而通过再次使用 `let`，我们可以对这个值做一些变换，同时又能让变量在变换完成后继续保持不可变。

`mut` 和遮蔽之间的另一个区别是：当我们再次使用 `let` 时，实际上是在创建一个新变量，因此我们可以改变值的类型，同时继续复用相同的名字。例如，假设程序要求用户输入若干空格，以表示他们希望在某段文本之间显示多少空格，随后我们想把这个输入保存成一个数字：

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-04-shadowing-can-change-types/src/main.rs:here}}
```

第一个 `spaces` 变量是字符串类型，而第二个 `spaces` 变量是数字类型。遮蔽让我们不必想出不同的名字，比如 `spaces_str` 和 `spaces_num`；相反，我们可以继续复用更简单的 `spaces`。不过，如果像下面这样尝试使用 `mut`，就会得到一个编译时错误：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-05-mut-cant-change-types/src/main.rs:here}}
```

这个错误说明，我们不能修改变量的类型：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-05-mut-cant-change-types/output.txt}}
```

现在我们已经了解了变量如何工作，让我们看看变量可以拥有的更多数据类型。

[comparing-the-guess-to-the-secret-number]:ch02-00-guessing-game-tutorial.html#比较猜测的数字和秘密数字
[data-types]: ch03-02-data-types.html#数据类型
[storing-values-with-variables]: ch02-00-guessing-game-tutorial.html#使用变量储存值
[const-eval]: https://doc.rust-lang.org/reference/const_eval.html
