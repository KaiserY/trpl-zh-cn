## Hello, World!

> [ch01-02-hello-world.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-02-hello-world.md)
> <br>
> commit c21a4e7b315d62583470482ab542587a26e1b2e8

现在安装好了 Rust，让我们来编写第一个程序。当学习一门新语言的时候，使用该语言在屏幕上打印 “Hello, world!” 是一项传统，这里我们将遵循这个传统。

> 注意：本书假设你熟悉基本的命令行操作。Rust 对于你的编辑器、工具，以及代码位于何处并没有特定的要求，如果相比命令行你更倾向于 IDE，请随意使用合意的 IDE。

### 创建项目目录

首先，创建一个存放 Rust 代码的目录。Rust 并不关心代码的位置，不过在本书中，我们建议你在 home 目录中创建一个 *projects* 目录，并将你的所有项目置于此处。打开终端并输入如下命令为此项目创建一个目录：

Linux 和 Mac：

```text
$ mkdir ~/projects
$ cd ~/projects
$ mkdir hello_world
$ cd hello_world
```

Windows 的 cmd：

```cmd
> mkdir %USERPROFILE%\projects
> cd %USERPROFILE%\projects
> mkdir hello_world
> cd hello_world
```

Windows 的 PowerShell：

```powershell
> mkdir $env:USERPROFILE\projects
> cd $env:USERPROFILE\projects
> mkdir hello_world
> cd hello_world
```

### 编写并运行 Rust 程序

接下来，新建一个叫做 *main.rs* 的源文件。Rust 源代码总是以 *.rs* 后缀结尾。如果文件名包含多个单词，使用下划线分隔它们。例如 *my_program.rs*，而不是 *myprogram.rs*。

现在打开刚创建的 *main.rs* 文件，输入如下代码：

<span class="filename">文件名: main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

保存文件，并回到终端窗口。在 Linux 或 OSX 上，输入如下命令：

```text
$ rustc main.rs
$ ./main
Hello, world!
```

在 Windows 上，运行 `.\main.exe`，而不是`./main`。不管使用何种系统，都应该在终端看到 `Hello, world!` 字样。如果你做到了，恭喜你！你已经正式编写了一个 Rust 程序。现在你成为了一名 Rust 程序员！欢迎！

### 分析 Rust 程序

现在，让我们回过头来仔细看看 “Hello, world!” 程序中到底发生了什么。这是拼图的第一片：

```rust
fn main() {

}
```

这几行定义了一个 Rust **函数**。`main` 函数是特殊的：它是每个可执行的 Rust 程序所首先执行的。第一行代码表示 “我声明了一个叫做 `main` 的函数，它没有参数也没有返回值。” 如果有参数的话，它们的名称应该出现在括号中，位于 `(` 和 `)` 之间。

还须注意函数体被包裹在花括号中，`{`和`}` 之间。Rust 要求所有函数体都要用花括号包裹起来（译者注：有些语言，当函数体只有一行时可以省略花括号，但在 Rust 中是不行的）。一般来说，将左花括号与函数声明置于同一行并以空格分隔，是良好的代码风格。

在 `main()` 函数中：

```rust
    println!("Hello, world!");
```

这行代码完成这个小程序的所有工作：在屏幕上打印文本。这里有很多细节需要注意。首先 Rust 使用 4 个空格的缩进风格，而不是 1 个制表符（tab）。

第二个重要的部分是 `println!()`。这称为 Rust **宏**，Rust 元编程（metaprogramming）的关键所在。如果是调用函数，则应看起来像这样：`println`（没有`!`）。我们将在附录 D 中更加详细的讨论宏，现在你只需记住，当看到符号 `!` 的时候，就意味着调用的是宏而不是普通函数。

接下来，`"Hello, world!"` 是一个 **字符串**。我们把这个字符串作为一个参数传递给 `println!`，它负责在屏幕上打印这个字符串。轻松加愉快！(⊙o⊙)

该行以分号结尾（`;`）。`;` 代表一个表达式的结束和下一个表达式的开始。大部分 Rust 代码行以 `;` 结尾。

### 编译和运行是彼此独立的步骤

“编写并运行 Rust 程序” 部分中展示了如何运行新创建的程序。现在我们将拆分并检查每一步操作。

在运行 Rust 程序之前必须先进行编译。可以通过 `rustc` 命令并传递源文件名称来使用 Rust 编译器，如下：

```text
$ rustc main.rs
```

如果你有 C 或 C++ 背景，就会发现这与 `gcc` 和 `clang` 类似。编译成功后，Rust 应该会输出一个二进制可执行文件，在 Linux 或 OSX 上在 shell 中可以通过 `ls` 命令看到如下内容：

```text
$ ls
main  main.rs
```

在 Windows 上，输入：

```cmd
> dir /B %= the /B option says to only show the file names =%
main.exe
main.rs
```

这表示我们有两个文件：*.rs* 后缀的源文件，和可执行文件（在 Windows下是 *main.exe*，其它平台是 *main*）。余下需要做的就是运行 *main* 或 *main.exe* 文件，如下：

```text
$ ./main  # or .\main.exe on Windows
```

如果 *main.rs* 是上文所述的 “Hello, world!” 程序，它将会在终端上打印 `Hello, world!`。

来自 Ruby、Python 或 JavaScript 这样的动态类型语言背景的同学，可能不太习惯将编译和执行分为两个单独的步骤。Rust 是一种 **预编译静态类型**（*ahead-of-time compiled*）语言，这意味着你可以编译程序并将其交与他人，它们不需要安装 Rust 即可运行。相反如果你给他们一个 `.rb`、`.py` 或 `.js` 文件，他们需要先分别安装 Ruby，Python，JavaScript 实现（运行时环境，VM），不过你只需要一句命令就可以编译和执行程序。这一切都是语言设计上的权衡取舍。

使用 `rustc` 编译简单程序是没问题的，不过随着项目的增长，你可能需要控制你项目的方方面面，并且更容易地将代码分享给其它人或项目。接下来，我们要介绍一个叫做 Cargo 的工具，它会帮助你编写真实世界中的 Rust 程序。

## Hello, Cargo!

Cargo 是 Rust 的构建系统和包管理工具，同时 Rustacean 们使用 Cargo 来管理他们的 Rust 项目，因为它使得很多任务变得更轻松。例如，Cargo 负责构建代码、下载依赖库并编译它们。我们把代码所需要的库叫做 **依赖**（*dependencies*）。

最简单的 Rust 程序，比如我们刚刚编写的，并没有任何依赖，所以目前我们只会用到 Cargo 构建代码那部分的功能。随着编写的程序更加复杂，你会想要添加依赖，如果你一开始就使用 Cargo 的话，事情会变得简单许多。

由于绝大部分 Rust 项目使用 Cargo，本书接下来的部分将假设你使用它。如果使用之前介绍的官方安装包的话，则自带了 Cargo。如果通过其他方式安装的话，可以在终端输入如下命令检查是否安装了 Cargo：

```text
$ cargo --version
```

如果出现了版本号，一切 OK！如果出现类似 `command not found` 的错误，你应该查看相应安装文档以确定如何单独安装 Cargo。

### 使用 Cargo 创建项目

让我们使用 Cargo 来创建一个新项目，然后看看与上面的 `hello_world` 项目有什么不同。回到 projects 目录（或者任何你放置代码的目录）：

Linux 和 Mac:

```text
$ cd ~/projects
```

Windows:

```cmd
> cd %USERPROFILE%\projects
```

并在任何操作系统下运行：

```text
$ cargo new hello_cargo --bin
$ cd hello_cargo
```

我们向 `cargo new` 传递了 `--bin`，因为我们的目标是生成一个可执行程序，而不是一个库。可执行程序是二进制可执行文件，通常就叫做 **二进制文件**（*binaries*）。项目的名称被定为 `hello_cargo`，同时 Cargo 在一个同名目录中创建它的文件，接着我们可以进入查看。

如果列出 *hello_cargo* 目录中的文件，将会看到 Cargo 生成了一个文件和一个目录：一个 *Cargo.toml* 文件和一个 *src* 目录，*main.rs* 文件位于 *src* 目录中。它也在 *hello_cargo* 目录初始化了一个 git 仓库，以及一个 *.gitignore* 文件；你可以通过 `--vcs` 参数切换到其它版本控制系统（VCS），或者不使用 VCS。

使用文本编辑器（工具请随意）打开 *Cargo.toml* 文件。它应该看起来像这样：

<span class="filename">文件名: Cargo.toml</span>

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
```

这个文件使用 [*TOML*][toml]<!-- ignore --> (Tom's Obvious, Minimal Language) 格式。TOML 类似于 INI，不过有一些额外的改进之处，并且被用作 Cargo 的配置文件的格式。

[toml]: https://github.com/toml-lang/toml

第一行，`[package]`，是一个部分标题，表明下面的语句用来配置一个包。随着我们在这个文件增加更多的信息，还将增加其他部分。

接下来的三行设置了三个 Cargo 所需的配置，项目的名称、版本和作者，它们告诉 Cargo 需要编译这个项目。Cargo 从环境中获取你的名称和 email 信息。如果不正确，请修改并保存此文件。

最后一行，`[dependencies]`，是项目依赖的 *crates* 列表（我们称呼 Rust 代码包为 crate）部分的开始，这样 Cargo 就知道应该下载和编译它们了。这个项目并不需要任何其他的 crate，不过在下一章猜猜看教程会用得上。

现在看看 *src/main.rs*：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

Cargo 为你生成了一个 “Hello World!”，正如我们之前编写的那个！目前为止，之前项目与 Cargo 生成项目的区别有：

- 代码位于 *src* 目录
- 项目根目录包含一个 *Cargo.toml* 配置文件

Cargo 期望源文件位于 *src* 目录，将项目根目录留给 README、license 信息、配置文件和其他跟代码无关的文件。这样，Cargo 帮助你保持项目干净整洁，一切井井有条。

如果没有用 Cargo 创建项目，比如 *hello_world* 目录中的项目，可以通过将代码放入 *src* 目录，并创建一个合适的 *Cargo.toml*，将其转化为一个 Cargo 项目。

### 构建并运行 Cargo 项目

现在让我们看看通过 Cargo 构建和运行 Hello World 程序有什么不同。为此输入下面的命令：

```text
$ cargo build
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 2.85 secs
```

这应该会创建 *target/debug/hello_cargo* 可执行文件（或者在 Windows 上是 *target\debug\hello_cargo.exe*），可以通过这个命令运行：

```text
$ ./target/debug/hello_cargo # or .\target\debug\hello_cargo.exe on Windows
Hello, world!
```

很好！如果一切顺利，`Hello, world!` 应该再次打印在终端上。

首次运行 `cargo build` 的时候，Cargo 会在项目根目录创建一个新文件，*Cargo.lock*，它看起来像这样：

<span class="filename">文件名: Cargo.lock</span>

```toml
[root]
name = "hello_cargo"
version = "0.1.0"
```

Cargo 使用 *Cargo.lock* 来记录程序的依赖。这个项目并没有依赖，所以其内容比较少。事实上，你自己永远也不需要碰这个文件，让 Cargo 处理它就行了。

我们刚刚使用 `cargo build` 构建了项目并使用 `./target/debug/hello_cargo` 运行了程序，也可以使用 `cargo run` 同时编译并运行：

```text
$ cargo run
     Running `target/debug/hello_cargo`
Hello, world!
```

注意这一次并没有出现 Cargo 正在编译 `hello_cargo` 的输出。Cargo 发现文件并没有被改变，就直接运行了二进制文件。如果修改了源文件的话，Cargo 会在运行之前重新构建项目，并会出现像这样的输出：

```text
$ cargo run
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.33 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

所以现在又出现更多的不同：

- 使用 `cargo build` 构建项目（或使用 `cargo run` 一步构建并运行），而不是使用 `rustc`
- 有别于将构建结果放在与源码相同的目录，Cargo 会将其放到 *target/debug* 目录。

Cargo 的另一个优点是，不管你使用什么操作系统其命令都是一样的，所以本书之后将不再为 Linux 和 Mac 以及 Windows 提供相应的命令。

### 发布（release）构建

当项目最终准备好发布了，可以使用 `cargo build --release` 来优化编译项目。这会在 *target/release* 而不是  *target/debug* 下生成可执行文件。这些优化可以让 Rust 代码运行的更快，不过启用这些优化也需要消耗更长的编译时间。这也就是为什么会有两种不同的配置：一种为了开发，你需要经常快速重新构建；另一种为了构建给用户最终程序，它们不会重新构建，并且希望程序运行得越快越好。如果你在测试代码的运行时间，请确保运行 `cargo build --release` 并使用 *target/release* 下的可执行文件进行测试。

### 把 Cargo 当作习惯

对于简单项目， Cargo 并不比 `rustc` 提供了更多的优势，不过随着开发的深入终将证明其价值。对于拥有多个 crate 的复杂项目，让 Cargo 来协调构建将更简单。有了 Cargo，只需运行`cargo build`，然后一切将有序运行。即便这个项目很简单，它现在也使用了很多你之后的 Rust 生涯将会用得上的实用工具。其实你可以使用下面的命令开始任何你想要从事的项目：

```text
$ git clone someurl.com/someproject
$ cd someproject
$ cargo build
```

> 注意：如果想要了解 Cargo 更多的细节，请阅读官方的 [Cargo guide]，它覆盖了 Cargo 所有的功能。

[Cargo guide]: http://doc.crates.io/guide.html
