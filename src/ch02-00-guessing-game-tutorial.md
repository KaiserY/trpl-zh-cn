# 编写一个猜数字游戏

[ch02-00-guessing-game-tutorial.md](https://github.com/rust-lang/book/blob/95dd8a023b2c736d12377a713bb6b8ed77e48678/src/ch02-00-guessing-game-tutorial.md)

让我们一起动手完成一个项目来快速上手 Rust！本章将介绍一些 Rust 中常见的概念，并通过真实的程序来展示如何运用它们。你将会学到 `let`、`match`、方法（methods）、关联函数（associated functions）、外部 crate 等知识！后续章节会深入探讨这些概念的细节。在这一章，我们将主要练习基础内容。

我们会实现一个经典的新手编程问题：猜数字游戏。游戏的规则如下：程序将会生成一个 1 到 100 之间的随机整数。然后提示玩家输入一个猜测值。输入后，程序会指示该猜测是太低还是太高。如果猜对了，游戏会打印祝贺信息并退出。

## 准备一个新项目

要创建一个新项目，进入第一章中创建的 _projects_ 目录，使用 Cargo 新建一个项目，如下：

```console
$ cargo new guessing_game
$ cd guessing_game
```

第一条命令 `cargo new` 将项目名称（`guessing_game`）作为第一个参数。第二条命令则进入新创建的项目目录。

看看生成的 _Cargo.toml_ 文件：

<span class="filename">文件名：Cargo.toml</span>

```toml
{{#include ../listings/ch02-guessing-game-tutorial/no-listing-01-cargo-new/Cargo.toml}}
```

正如第一章那样，`cargo new` 生成了一个 “Hello, world!” 程序。查看 _src/main.rs_ 文件：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/no-listing-01-cargo-new/src/main.rs}}
```

现在使用 `cargo run` 命令，一步完成 “Hello, world!” 程序的编译和运行：

```console
{{#include ../listings/ch02-guessing-game-tutorial/no-listing-01-cargo-new/output.txt}}
```

当你需要在项目中快速迭代时，`run` 命令就能派上用场，正如我们在这个游戏项目中做的，在下一次迭代之前快速测试每一次迭代。

重新打开 _src/main.rs_ 文件。我们将会在这个文件中编写全部的代码。

## 处理一次猜测

猜数字程序的第一部分请求和处理用户输入，并检查输入是否符合预期的格式。首先，我们会允许玩家输入一个猜测。在 _src/main.rs_ 中输入示例 2-1 中的代码。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:all}}
```

<figcaption>示例 2-1：获取用户猜测并打印的代码</figcaption>

</figure>

这些代码包含很多信息，我们一行一行地讲解。为了获取用户输入并将结果打印为输出，我们需要把输入/输出库 `io` 引入当前作用域。`io` 库来自标准库，也被称为 `std`：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:io}}
```

默认情况下，Rust 会把标准库中的一组内容自动带入每个程序的作用域，这组内容被称为 *预导入（prelude）*。你可以在[标准库文档][prelude]中查看 prelude 里都有哪些内容。

如果你需要的类型不在 prelude 中，就必须使用 `use` 语句显式地将其引入作用域。`std::io` 库提供了许多有用的功能，其中包括接收用户输入。

如第一章所提及，`main` 函数是程序的入口点：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:main}}
```

`fn` 语法声明了一个新函数，小括号 `()` 表明没有参数，大括号 `{` 作为函数体的开始。

第一章也提及了 `println!` 是一个在屏幕上打印字符串的宏：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:print}}
```

这些代码仅仅打印提示，介绍游戏的内容然后请求用户输入。

### 使用变量储存值

接下来，创建一个 **变量**（_variable_）来储存用户输入，像这样：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:string}}
```

现在程序开始变得有意思了！这一小行代码发生了很多事。我们使用 `let` 语句来创建变量。这里是另外一个例子：

```rust,ignore
let apples = 5;
```

这行代码新建了一个叫做 `apples` 的变量并把它绑定到值 `5` 上。在 Rust 中，变量默认是不可变的，这意味着一旦我们给变量赋值，这个值就不可以再修改了。我们将会在第三章的 [“变量与可变性”][variables-and-mutability] 部分详细讨论这个概念。下面的例子展示了如何在变量名前使用 `mut` 来使一个变量可变：

```rust,ignore
let apples = 5; // 不可变
let mut bananas = 5; // 可变
```

> 注意：`//` 语法开始一个注释，持续到行尾。Rust 忽略注释中的所有内容，[第三章][comments]将会详细介绍注释。

回到猜数字程序中。现在我们知道了 `let mut guess` 会引入一个叫做 `guess` 的可变变量。等号（`=`）告诉 Rust 我们现在想将某个值绑定在变量上。等号的右边是 `guess` 所绑定的值，它是 `String::new` 的结果，这个函数会返回一个 `String` 的新实例。[`String`][string]<!-- ignore --> 是一个标准库提供的字符串类型，它是 UTF-8 编码的可增长文本块。

`::new` 那一行的 `::` 语法表明 `new` 是 `String` 类型的一个 **关联函数**（_associated function_）。关联函数是针对某个类型实现的函数，在这个例子中是 `String`。这个 `new` 函数创建了一个新的空字符串。你会发现许多类型上都有一个 `new` 函数，因为这是为某种类型创建新值的常用函数名。

总的来说，`let mut guess = String::new();` 这一行创建了一个可变变量，当前它绑定到一个新的 `String` 空实例上。呼！

### 接收用户输入

回忆一下，我们在程序的第一行使用 `use std::io;` 从标准库中引入了输入/输出功能。现在调用 `io` 库中的函数 `stdin`，这允许我们处理用户输入：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:read}}
```

如果程序的开头没有使用 `use std::io;` 引入 `io` 库，我们仍可以通过把函数调用写成 `std::io::stdin` 来使用该函数。`stdin` 函数返回一个 [`std::io::Stdin`][iostdin]<!-- ignore --> 的实例，这是一种代表终端标准输入句柄的类型。

接下来，代码中的 `.read_line(&mut guess)` 调用了标准输入句柄上的 [`read_line`][read_line]<!-- ignore --> 方法，以获取用户输入。我们还将 `&mut guess` 作为参数传递给 `read_line` 函数，让其将用户输入储存到这个字符串中。`read_line` 的工作是，无论用户在标准输入中键入什么内容，都将其追加（不会覆盖其原有内容）到一个字符串中，因此它需要字符串作为参数。这个字符串参数应该是可变的，以便 `read_line` 将用户输入附加上去。

`&` 表示这个参数是一个 **引用**（_reference_），它允许多处代码访问同一处数据，而无需在内存中多次拷贝。引用是一个复杂的特性，Rust 的一个主要优势就是安全而简单的操纵引用。完成当前程序并不需要了解如此多细节。现在，我们只需知道它像变量一样，默认是不可变的。因此，需要写成 `&mut guess` 来使其可变，而不是 `&guess`。（第四章会更全面地讲解引用。）

### 使用 `Result` 类型来处理潜在的错误

我们还没有完全分析完这行代码。虽然我们已经讲到了第三行文本，但要注意：它仍然属于同一条逻辑代码。接下来的部分是这个方法（method）：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:expect}}
```

我们也可以将代码这样写：

```rust,ignore
io::stdin().read_line(&mut guess).expect("Failed to read line");
```

不过，过长的代码行难以阅读，所以最好拆开来写。通常来说，当使用 `.method_name()` 语法调用方法时，适当加入换行和空白来拆分长代码行是很明智的。现在来看看这行代码到底做了什么。

之前提到了 `read_line` 会将用户输入附加到传递给它的字符串中，不过它也会返回一个类型为 `Result` 的值。[`Result`][result]<!-- ignore --> 是一种[*枚举类型*][enums]<!-- ignore -->，通常也写作 *enum*，它可以是多种可能状态中的一个。我们把每种可能的状态称为一种 **枚举成员**（*variant*）。

[第六章][enums]将介绍枚举的更多细节。这里的 `Result` 类型将用来编码错误处理的信息。

`Result` 的成员是 `Ok` 和 `Err`，`Ok` 成员表示操作成功，内部包含成功时产生的值。`Err` 成员则意味着操作失败，并且 `Err` 中包含有关操作失败的原因或方式的信息。

`Result` 类型的值，像其他类型一样，拥有定义于其实例上的方法。`Result` 的实例拥有 [`expect` 方法][expect]<!-- ignore -->。如果 `io::Result` 实例的值是 `Err`，`expect` 会导致程序崩溃，并输出当做参数传递给 `expect` 的信息。所以当 `read_line` 方法返回 `Err`，则可能是来源于底层操作系统错误的结果。如果 `Result` 实例的值是 `Ok`，`expect` 会获取 `Ok` 中的值并原样返回。在本例中，这个值是用户输入到标准输入中的字节数。

如果不调用 `expect`，程序也能编译，不过会出现一个警告：

```console
{{#include ../listings/ch02-guessing-game-tutorial/no-listing-02-without-expect/output.txt}}
```

Rust 警告我们没有使用 `read_line` 的返回值 `Result`，说明有一个可能的错误没有处理。

消除警告的正确做法是实际去编写错误处理代码，不过由于我们就是希望程序在出现问题时立即崩溃，所以直接使用 `expect`。[第九章][recover] 会学习如何从错误中恢复。

### 使用 `println!` 占位符打印值

除了位于结尾的右花括号，目前为止就只有这一行代码值得讨论一下了：

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-01/src/main.rs:print_guess}}
```

这行代码现在打印了存储用户输入的字符串。`{}` 这对大括号是一个占位符：把 `{}` 想象成小蟹钳，可以夹住合适的值。当打印变量的值时，变量名可以写进大括号中。当打印表达式的执行结果时，格式化字符串（format string）中大括号中留空，格式化字符串后跟逗号分隔的需要打印的表达式列表，其顺序与每一个空大括号占位符的顺序一致。在一个 `println!` 调用中打印变量和表达式的值看起来像这样：

```rust
let x = 5;
let y = 10;

println!("x = {x} and y + 2 = {}", y + 2);
```

这行代码会打印出 `x = 5 and y + 2 = 12`。

### 测试第一部分代码

让我们来测试下猜数字游戏的第一部分。使用 `cargo run` 运行：

```console
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 6.44s
     Running `target/debug/guessing_game`
Guess the number!
Please input your guess.
6
You guessed: 6
```

至此为止，游戏的第一部分已经完成：我们从键盘获取输入并打印了出来。

## 生成一个秘密数字

接下来，需要生成一个秘密数字，好让用户来猜。秘密数字应该每次都不同，这样重复玩才不会乏味；范围应该在 1 到 100 之间，这样才不会太困难。Rust 标准库中尚未包含随机数功能。然而，Rust 团队还是提供了一个包含上述功能的 [`rand` crate][randcrate]。

### 使用 crate 来增加更多功能

记住，crate 是一组 Rust 源代码文件。我们正在构建的项目是一个 *二进制 crate*，它会生成一个可执行文件。`rand` crate 则是一个 *库 crate*，库 crate 可以包含任意能被其他程序使用的代码，但不能独立执行。

Cargo 在管理外部 crate 方面的能力正是其真正大放异彩的地方。在我们使用 `rand` 编写代码之前，需要修改 *Cargo.toml* 文件，把 `rand` 加为一个依赖。现在打开这个文件，并将下面这一行添加到 `[dependencies]` section 标题之下。在当前版本下，请务必按这里的方式指定 `rand`，否则本教程中的示例代码可能无法运行。

<span class="filename">文件名：Cargo.toml</span>

```toml
{{#include ../listings/ch02-guessing-game-tutorial/listing-02-02/Cargo.toml:8:}}
```

在 _Cargo.toml_ 文件中，一个标题以及其后的内容都属于同一个 section，直到出现下一个标题才会开始新的 section。`[dependencies]` section 用来告诉 Cargo：这个项目依赖哪些外部 crate，以及它们的版本要求。在本例中，我们使用语义化版本 `0.8.5` 来指定 `rand` crate。Cargo 理解 [语义化版本（Semantic Versioning）][semver]<!-- ignore -->，也常简称为 _SemVer_，它是一种编写版本号的标准。`0.8.5` 实际上是 `^0.8.5` 的简写，表示任何至少为 `0.8.5` 但小于 `0.9.0` 的版本。

Cargo 认为这些版本与 `0.8.5` 的公开 API 兼容，因此这样的版本约束可以确保我们获得仍能编译本章代码的最新补丁（patch）版本。任何大于等于 `0.9.0` 的版本，都不能保证仍然使用与后续示例相同的 API。

现在，不修改任何代码，构建项目，如示例 2-2 所示。

<figure class="listing">

```console
$ cargo build
  Updating crates.io index
   Locking 15 packages to latest Rust 1.85.0 compatible versions
    Adding rand v0.8.5 (available: v0.9.0)
 Compiling proc-macro2 v1.0.93
 Compiling unicode-ident v1.0.17
 Compiling libc v0.2.170
 Compiling cfg-if v1.0.0
 Compiling byteorder v1.5.0
 Compiling getrandom v0.2.15
 Compiling rand_core v0.6.4
 Compiling quote v1.0.38
 Compiling syn v2.0.98
 Compiling zerocopy-derive v0.7.35
 Compiling zerocopy v0.7.35
 Compiling ppv-lite86 v0.2.20
 Compiling rand_chacha v0.3.1
 Compiling rand v0.8.5
 Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
  Finished `dev` profile [unoptimized + debuginfo] target(s) in 2.48s
```

<figcaption>示例 2-2：将 rand crate 添加为依赖之后运行 `cargo build` 的输出</figcaption>

</figure>

可能会出现不同的版本号（多亏了语义化版本，它们与代码是兼容的！），并且显示的行数可能会有所不同（取决于操作系统），行的顺序也可能会不同。

当我们加入一个外部依赖时，Cargo 会从 _registry_ 获取该依赖所需内容的最新版本信息；这个 _registry_ 是来自 [Crates.io][cratesio] 数据的一份副本。Crates.io 是 Rust 生态系统中人们发布开源 Rust 项目、供他人使用的平台。

在更新完 _registry_ 之后，Cargo 会检查 `[dependencies]` section，并下载其中列出但尚未下载的 crate。本例中，虽然我们只声明了 `rand` 这一个依赖，Cargo 还是额外获取了 `rand` 正常工作所依赖的其他 crate。下载完成后，Rust 会先编译这些依赖，再在这些依赖可用的情况下编译项目本身。

如果不做任何修改，立刻再次运行 `cargo build`，除了 `Finished` 那一行之外，你不会看到任何输出。Cargo 知道它已经下载并编译了这些依赖，而且 _Cargo.toml_ 文件也没有发生变化。Cargo 还知道你的代码也没有改动，所以它也不会重新编译代码。由于没有事情可做，它就会直接退出。

如果打开 _src/main.rs_ 文件，做一些无关紧要的修改，保存并再次构建，你将只会看到两行输出：

```console
$ cargo build
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.13s
```

这表明 Cargo 只因为你对 _src/main.rs_ 做了微小修改而更新了构建。依赖并没有变化，所以 Cargo 知道它可以复用之前已经下载并编译好的那些代码。

#### _Cargo.lock_ 文件确保可重现构建

Cargo 有一个机制，可以确保无论是你还是其他人在任何时候重新构建代码，都会得到相同的构建产物：Cargo 只会使用已经确定下来的依赖版本，除非你明确要求它更新。例如，假设下周 `rand` crate 发布了 `0.8.6` 版本，其中修复了一个重要 bug，但同时也引入了一个会破坏你代码的回归问题。为了解决这类问题，Cargo 会在你第一次运行 `cargo build` 时创建 *Cargo.lock* 文件，我们现在就能在 *guessing_game* 目录中看到它。

当你第一次构建项目时，Cargo 会计算出所有符合要求的依赖版本，并把它们写入 *Cargo.lock* 文件。之后再次构建项目时，Cargo 会发现 *Cargo.lock* 已经存在，于是直接使用其中记录的版本，而不是重新计算一遍。这就让你自动拥有了可重现构建（reproducible build）。换句话说，项目会一直停留在 `0.8.5`，直到你显式升级它，这都要归功于 *Cargo.lock* 文件。由于 *Cargo.lock* 对可重现构建非常重要，所以它通常会和项目中的其余代码一起提交到版本控制系统中。

#### 更新 crate 到一个新版本

当你 **确实** 想更新某个 crate 时，Cargo 提供了 `update` 命令，它会忽略 *Cargo.lock* 文件，并重新计算所有符合 *Cargo.toml* 中声明要求的最新版本。然后，Cargo 会把这些版本写回 *Cargo.lock* 文件。不过，默认情况下，Cargo 只会查找大于 `0.8.5` 且小于 `0.9.0` 的版本。如果 `rand` crate 发布了两个新版本：`0.8.6` 和 `0.999.0`，那么运行 `cargo update` 时你会看到如下输出：

```console
$ cargo update
    Updating crates.io index
     Locking 1 package to latest Rust 1.85.0 compatible version
    Updating rand v0.8.5 -> v0.8.6 (available: v0.999.0)
```

Cargo 会忽略 `0.999.0` 这个版本。这时，你也会注意到 *Cargo.lock* 文件发生了变化：你现在使用的 `rand` crate 版本变成了 `0.8.6`。如果你想使用 `rand` 的 `0.999.0` 版本，或者 `0.999.x` 系列中的任何版本，就必须像下面这样更新 *Cargo.toml* 文件：

```toml
[dependencies]
rand = "0.999.0"
```

下一次运行 `cargo build` 时，Cargo 会更新可用 crate 的 registry，并根据你指定的新版本重新评估 `rand` 的版本要求。

第十四章会介绍 [Cargo][doccargo]<!-- ignore --> 及其[生态系统][doccratesio]<!-- ignore --> 的更多内容，不过目前知道这些就足够了。Cargo 让复用库变得非常容易，因此 Rustaceans 能够编写出由多个包组合而成、更小巧的项目。

### 生成一个随机数

让我们开始使用 `rand` 来生成一个要猜测的数字。下一步是更新 *src/main.rs*，如示例 2-3 所示。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-03/src/main.rs:all}}
```

<figcaption>示例 2-3：添加生成随机数的代码</figcaption>

</figure>

首先，我们新增了一行 `use rand::Rng;`。`Rng` 是一个 trait，它定义了随机数生成器应实现的方法，想使用这些方法的话，此 trait 必须在作用域中。第十章会详细介绍 trait。

接下来，我们又在中间加了两行。第一行调用 `rand::thread_rng` 函数，得到我们将要使用的那个特定随机数生成器：它与当前执行线程局部相关，并由操作系统提供种子（seed）。然后，我们在这个随机数生成器上调用 `gen_range` 方法。这个方法由通过 `use rand::Rng` 语句引入作用域的 `Rng` trait 定义。`gen_range` 方法接收一个范围表达式（range expression）作为参数，并在该范围内生成一个随机数。这里我们使用的范围表达式形式是 `start..=end`，它在上下边界上都是闭区间，所以我们需要写 `1..=100`，来请求一个 1 到 100 之间的数。

> 注意：你不可能凭空知道应该 `use` 哪个 trait，或者应该从 crate 中调用哪些方法和函数，因此每个 crate 都带有使用说明文档。Cargo 的另一个很棒的功能是，运行 `cargo doc --open` 命令会在本地构建所有依赖提供的文档，并在浏览器中打开。例如，假设你对 `rand` crate 的其他功能感兴趣，你可以运行 `cargo doc --open`，然后点击左侧边栏中的 `rand`。

新增加的第二行代码打印出了秘密数字。这在开发程序时很有用，因为可以测试它，不过在最终版本中会删掉它。如果游戏一开始就打印出结果就没什么可玩的了！

尝试运行程序几次：

```console
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.02s
     Running `target/debug/guessing_game`
Guess the number!
The secret number is: 7
Please input your guess.
4
You guessed: 4

$ cargo run
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.02s
     Running `target/debug/guessing_game`
Guess the number!
The secret number is: 83
Please input your guess.
5
You guessed: 5
```

你应该能得到不同的随机数，同时它们应该都是在 1 和 100 之间的。干得漂亮！

## 比较猜测的数字和秘密数字

现在有了用户输入和一个随机数，我们可以比较它们。这个步骤如示例 2-4 所示。注意这段代码还不能通过编译，我们稍后会解释。

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-04/src/main.rs:here}}
```

<figcaption>示例 2-4：处理比较两个数字可能的返回值</figcaption>

</figure>

首先，我们增加了另一条 `use` 声明，把标准库中的 `std::cmp::Ordering` 类型引入作用域。`Ordering` 也是一个枚举，它的成员分别是 `Less`、`Greater` 和 `Equal`。这正是比较两个值时可能出现的三种结果。

接着，我们在底部添加了五行新代码，用到了 `Ordering` 类型。`cmp` 方法用于比较两个值，并且可以在任何可比较的值上调用。它接收一个对比对象的引用：这里就是把 `guess` 和 `secret_number` 作比较。然后，它会返回一个我们刚刚通过 `use` 引入作用域的 `Ordering` 枚举成员。我们使用 [`match`][match]<!-- ignore --> 表达式，根据对 `guess` 和 `secret_number` 调用 `cmp` 后返回的是哪个 `Ordering` 成员，来决定下一步该做什么。

一个 `match` 表达式由 **分支（arms）** 构成。一个分支包含一个 **模式**（*pattern*）和表达式开头的值与分支模式相匹配时应该执行的代码。Rust 获取提供给 `match` 的值并挨个检查每个分支的模式。`match` 结构和模式是 Rust 中强大的功能，它体现了代码可能遇到的多种情形，并确保对所有情况作出处理。这些功能将分别在第六章和第十九章详细介绍。

让我们看看使用 `match` 表达式的例子。假设用户猜了 50，这时随机生成的秘密数字是 38。

当代码比较 50 和 38 时，因为 50 大于 38，`cmp` 方法会返回 `Ordering::Greater`。`match` 表达式拿到的就是这个 `Ordering::Greater` 值。它会先检查第一个分支的模式 `Ordering::Less`，发现并不匹配，于是忽略这个分支中的代码并继续看下一个分支。下一个分支的模式是 `Ordering::Greater`，它**确实**匹配！于是该分支关联的代码会被执行，并在屏幕上打印 `Too big!`。由于 `match` 表达式会在第一次成功匹配后结束，所以在这种情况下它不会再去看最后一个分支。

然而，示例 2-4 的代码目前并不能编译，可以尝试一下：

```console
{{#include ../listings/ch02-guessing-game-tutorial/listing-02-04/output.txt}}
```

错误的核心表明这里有 **不匹配的类型**（_mismatched types_）。Rust 有一个静态强类型系统，同时也有类型推断。当我们写出 `let guess = String::new()` 时，Rust 推断出 `guess` 应该是 `String` 类型，并不需要我们写出类型。另一方面，`secret_number`，是数字类型。几个数字类型拥有 1 到 100 之间的值：32 位数字 `i32`；32 位无符号数字 `u32`；64 位数字 `i64` 等等。Rust 默认使用 `i32`，所以它是 `secret_number` 的类型，除非增加类型信息，或任何能让 Rust 推断出不同数值类型的信息。这里错误的原因在于 Rust 不会比较字符串类型和数字类型。

所以我们必须把从输入中读取到的 `String` 转换为一个数字类型，才好与秘密数字进行比较。这可以通过在 `main` 函数体中增加如下代码来实现：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/no-listing-03-convert-string-to-number/src/main.rs:here}}
```

这行新代码是：

```rust,ignore
let guess: u32 = guess.trim().parse().expect("Please type a number!");
```

这里创建了一个名为 `guess` 的变量。不过等等，不是已经有一个叫做 `guess` 的变量了吗？确实如此，但 Rust 很贴心地允许我们用一个新值来 **遮蔽**（_shadowing_）之前的 `guess`。这样一来，我们就可以继续复用 `guess` 这个变量名，而不必被迫创建两个不同的变量，比如 `guess_str` 和 `guess`。[第三章][shadowing]会更详细地介绍 shadowing；现在你只需要知道，这个特性经常被用来把一个值从一种类型转换为另一种类型。

我们把这个新变量绑定到 `guess.trim().parse()` 这个表达式上。表达式里的 `guess` 指向的是原先那个保存用户输入字符串的 `guess` 变量。`String` 实例上的 `trim` 方法会去掉字符串开头和结尾的空白字符；在把字符串转换为 `u32` 之前，我们必须先这么做，因为 `u32` 只能包含数值数据。用户必须按下 <kbd>enter</kbd> 才能让 `read_line` 返回并提交他们的猜测，这会在字符串中附加一个换行符（newline）。例如，如果用户输入 <kbd>5</kbd> 并按下 <kbd>enter</kbd>，`guess` 实际上会变成 `5\n`。（在 Windows 上，按下 <kbd>enter</kbd> 会得到回车加换行，也就是 `\r\n`。）`trim` 方法会去除 `\n` 或 `\r\n`，最后只留下 `5`。

[字符串的 `parse` 方法][parse]<!-- ignore --> 将字符串转换成其他类型。这里用它来把字符串转换为数值。我们需要告诉 Rust 具体的数字类型，这里通过 `let guess: u32` 指定。`guess` 后面的冒号（`:`）告诉 Rust 我们指定了变量的类型。Rust 有一些内建的数字类型；`u32` 是一个无符号的 32 位整型。对于不大的正整数来说，它是不错的默认类型，[第三章][integers]还会讲到其他数字类型。

另外，程序中的 `u32` 注解以及与 `secret_number` 的比较，意味着 Rust 会推断出 `secret_number` 也是 `u32` 类型。现在可以使用相同类型比较两个值了！

`parse` 方法只会在字符逻辑上确实可以转换为数字时才成功，因此很容易失败。例如，如果字符串里包含 `A👍%`，那就根本不可能把它转换成数字。正因如此，`parse` 方法会返回一个 `Result` 类型，就像前面在 [“使用 `Result` 类型来处理潜在的错误”](#handling-potential-failure-with-the-result-type) 中讨论过的 `read_line` 方法一样。这里我们再次使用 `expect` 方法来处理它。如果 `parse` 无法从字符串中生成数字，并返回 `Result` 的 `Err` 成员，`expect` 就会让游戏崩溃，并打印我们提供的消息。如果 `parse` 成功把字符串转换为数字，它就会返回 `Result` 的 `Ok` 成员，而 `expect` 会把 `Ok` 里保存的数字返回给我们。

现在让我们运行程序！

```console
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.26s
     Running `target/debug/guessing_game`
Guess the number!
The secret number is: 58
Please input your guess.
  76
You guessed: 76
Too big!
```

很好！即使在猜测前面加了空格，程序仍然能判断出用户猜的是 76。你可以多运行几次程序，用不同类型的输入来验证不同的行为：猜中正确数字、猜一个过大的数字，以及猜一个过小的数字。

现在游戏已经大体上能玩了，不过用户只能猜一次。增加一个循环来改变它吧！

## 使用循环来允许多次猜测

`loop` 关键字创建了一个无限循环。我们会增加循环来给用户更多机会猜数字：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/no-listing-04-looping/src/main.rs:here}}
```

如你所见，我们把从提示用户输入猜测开始往后的所有内容都移进了循环中。请确保循环中的代码都额外缩进四个空格，然后再次运行程序。程序现在会不断要求用户输入新的猜测，但这也引入了一个新问题。用户似乎没法退出了！

用户当然总可以用键盘快捷键 <kbd>ctrl</kbd>-<kbd>C</kbd> 中断程序。不过还有另一种办法能逃离这个贪得无厌的怪物，正如我们在 [“比较猜测的数字和秘密数字”](#比较猜测的数字和秘密数字) 一节讨论 `parse` 时提到的那样：如果用户输入的不是数字，程序就会崩溃。我们可以利用这一点来让用户退出，如下所示：

```console
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.23s
     Running `target/debug/guessing_game`
Guess the number!
The secret number is: 59
Please input your guess.
45
You guessed: 45
Too small!
Please input your guess.
60
You guessed: 60
Too big!
Please input your guess.
59
You guessed: 59
You win!
Please input your guess.
quit

thread 'main' panicked at src/main.rs:28:47:
Please type a number!: ParseIntError { kind: InvalidDigit }
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

输入 `quit` 的确会退出游戏，但你也会注意到，输入任何其他非数字内容也一样会退出。这种体验至少可以说并不理想；我们希望游戏在猜中正确数字时也能停止。

### 猜测正确后退出

让我们增加一个 `break` 语句，在用户猜对时退出游戏：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/no-listing-05-quitting/src/main.rs:here}}
```

在 `You win!` 之后加上一行 `break`，程序就会在用户正确猜出秘密数字时退出循环。退出循环也就意味着退出程序，因为这个循环就是 `main` 的最后一部分。

### 处理无效输入

为了进一步改进游戏体验，我们不希望程序在用户输入非数字时崩溃；相反，我们希望它忽略这些输入，让用户继续猜。我们可以通过修改将 `guess` 从 `String` 转换为 `u32` 的那行代码来做到这一点，如示例 2-5 所示：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-05/src/main.rs:here}}
```

<figcaption>示例 2-5：忽略非数字的猜测并重新请求数字而不是让程序崩溃</figcaption>

</figure>

我们将 `expect` 调用换成 `match` 语句，以从遇到错误就崩溃转换为处理错误。须知 `parse` 返回的是一个 `Result` 类型，而 `Result` 是一个拥有 `Ok` 和 `Err` 成员的枚举。这里使用的 `match` 表达式，和我们之前处理 `cmp` 方法返回的 `Ordering` 时用的是同一种方式。

如果 `parse` 能够成功地将字符串转换为一个数字，它会返回一个包含结果数字的 `Ok`。这个 `Ok` 值与 `match` 第一个分支的模式相匹配，该分支对应的动作返回 `Ok` 值中的数字 `num`，最后如愿变成新创建的 `guess` 变量。

如果 `parse` **不能**把字符串转换为数字，它就会返回一个包含更多错误信息的 `Err`。这个 `Err` 值无法匹配第一个 `match` 分支中的 `Ok(num)` 模式，但会匹配第二个分支里的 `Err(_)` 模式。下划线 `_` 是一个通配值；在这个例子里，它表示我们要匹配所有 `Err` 值，而不关心其中具体包含什么信息。因此，程序会执行第二个分支中的代码 `continue`，告诉程序进入 `loop` 的下一次迭代，并请求另一个猜测。于是，程序就有效地忽略了 `parse` 可能遇到的所有错误！

现在程序中的一切都应该如预期般工作了。让我们试试吧：

```console
$ cargo run
   Compiling guessing_game v0.1.0 (file:///projects/guessing_game)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.13s
     Running `target/debug/guessing_game`
Guess the number!
The secret number is: 61
Please input your guess.
10
You guessed: 10
Too small!
Please input your guess.
99
You guessed: 99
Too big!
Please input your guess.
foo
Please input your guess.
61
You guessed: 61
You win!
```

太棒了！再做最后一个小改动，猜数字游戏就完成了：别忘了程序现在仍然会打印出秘密数字。测试时这很方便，但正式发布时会破坏游戏体验。把输出秘密数字的 `println!` 删掉吧。示例 2-6 展示了最终代码：

<figure class="listing">

<span class="file-name">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch02-guessing-game-tutorial/listing-02-06/src/main.rs}}
```

<figcaption>示例 2-6：猜数字游戏的完整代码</figcaption>

</figure>

到这里，你已经成功构建出了猜数字游戏。恭喜！

## 总结

这个项目通过动手实践的方式，向你介绍了许多 Rust 新概念：`let`、`match`、函数、使用外部 crate，等等。在接下来的几章中，你会更深入地学习这些概念。第三章介绍大多数编程语言共有的概念，例如变量、数据类型和函数，并展示如何在 Rust 中使用它们。第四章将探索所有权（ownership），这是 Rust 区别于其他语言的一项特性。第五章讨论结构体与方法语法，第六章则解释枚举是如何工作的。

[prelude]: https://doc.rust-lang.org/std/prelude/index.html
[variables-and-mutability]: ch03-01-variables-and-mutability.html#变量和可变性
[comments]: ch03-04-comments.html
[string]: https://doc.rust-lang.org/std/string/struct.String.html
[iostdin]: https://doc.rust-lang.org/std/io/struct.Stdin.html
[read_line]: https://doc.rust-lang.org/std/io/struct.Stdin.html#method.read_line
[result]: https://doc.rust-lang.org/std/result/enum.Result.html
[enums]: ch06-00-enums.html
[expect]: https://doc.rust-lang.org/std/result/enum.Result.html#method.expect
[recover]: ch09-02-recoverable-errors-with-result.html
[randcrate]: https://crates.io/crates/rand
[semver]: http://semver.org
[cratesio]: https://crates.io/
[doccargo]: http://doc.crates.io
[doccratesio]: http://doc.crates.io/crates-io.html
[match]: ch06-02-match.html
[shadowing]: ch03-01-variables-and-mutability.html#遮蔽
[parse]: https://doc.rust-lang.org/std/primitive.str.html#method.parse
[integers]: ch03-02-data-types.html#整型
