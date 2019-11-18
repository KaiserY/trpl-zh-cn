## Hello, World!

> [ch01-02-hello-world.md](https://github.com/rust-lang/book/blob/master/src/ch01-02-hello-world.md)
> <br>
> commit f63a103270ec8416899675a9cdb1c5cf6d77a498

既然安装好了 Rust，我们来编写第一个 Rust 程序。当学习一门新语言的时候，使用该语言在屏幕上打印 `Hello, world!` 是一项传统，我们将沿用这一传统！

> 注意：本书假设你熟悉基本的命令行操作。Rust 对于你的编辑器、工具，以及代码位于何处并没有特定的要求，如果你更倾向于使用集成开发环境（IDE），而不是命令行，请尽管使用你喜欢的 IDE。目前很多 IDE 已经不同程度的支持 Rust；查看 IDE 文档了解更多细节。最近，Rust 团队已经致力于提供强大的 IDE 支持，而且进展飞速！

### 创建项目目录

首先创建一个存放 Rust 代码的目录。Rust 并不关心代码的存放位置，不过对于本书的练习和项目来说，我们建议你在 home 目录中创建 *projects* 目录，并将你的所有项目存放在这里。

打开终端并输入如下命令创建 *projects* 目录，并在 *projects* 目录中为 “Hello, world!” 项目创建一个目录。

对于 Linux、macOS 和 Windows PowerShell，输入：

```text
$ mkdir ~/projects
$ cd ~/projects
$ mkdir hello_world
$ cd hello_world
```

对于 Windows CMD，输入：

```cmd
> mkdir "%USERPROFILE%\projects"
> cd /d "%USERPROFILE%\projects"
> mkdir hello_world
> cd hello_world
```

### 编写并运行 Rust 程序

接下来，新建一个源文件，命名为 *main.rs*。Rust 源文件总是以 *.rs* 扩展名结尾。如果文件名包含多个单词，使用下划线分隔它们。例如命名为 *hello_world.rs*，而不是 *helloworld.rs*。

现在打开刚创建的 *main.rs* 文件，输入示例 1-1 中的代码。

<span class="filename">文件名: main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

<span class="caption">示例 1-1: 一个打印 `Hello, world!` 的程序</span>

保存文件，并回到终端窗口。在 Linux 或 macOS 上，输入如下命令，编译并运行文件：

```text
$ rustc main.rs
$ ./main
Hello, world!
```

在 Windows 上，输入命令 `.\main.exe`，而不是 `./main`：

```powershell
> rustc main.rs
> .\main.exe
Hello, world!
```

不管使用何种操作系统，终端应该打印字符串 `Hello, world!`。如果没有看到这些输出，回到安装部分的 [“故障排除”][troubleshooting] 小节查找有帮助的方法。

如果 `Hello, world!` 出现了，恭喜你！你已经正式编写了一个 Rust 程序。现在你成为一名 Rust 程序员，欢迎！

### 分析这个 Rust 程序

现在，让我们回过头来仔细看看 “Hello, world!” 程序中到底发生了什么。这是第一块拼图：

```rust
fn main() {

}
```

这几行定义了一个 Rust 函数。`main` 函数是一个特殊的函数：在可执行的 Rust 程序中，它总是最先运行的代码。第一行代码声明了一个叫做 `main` 的函数，它没有参数也没有返回值。如果有参数的话，它们的名称应该出现在小括号中，`()`。

还须注意，函数体被包裹在花括号中，`{}`。Rust 要求所有函数体都要用花括号包裹起来。一般来说，将左花括号与函数声明置于同一行并以空格分隔，是良好的代码风格。

在编写本书的时候，一个叫做 `rustfmt` 的自动格式化工具正在开发中。如果你希望在 Rust 项目中保持一种标准风格，`rustfmt` 会将代码格式化为特定的风格。Rust 团队计划最终将该工具包含在标准 Rust 发行版中，就像 `rustc`。所以根据你阅读本书的时间，它可能已经安装到你的电脑中了！检查在线文档以了解更多细节。

在 `main()` 函数中是如下代码：

```rust
    println!("Hello, world!");
```

这行代码完成这个简单程序的所有工作：在屏幕上打印文本。这里有四个重要的细节需要注意。首先 Rust 的缩进风格使用 4 个空格，而不是 1 个制表符（tab）。

第二，`println!` 调用了一个 Rust 宏（macro）。如果是调用函数，则应输入 `println`（没有`!`）。我们将在第十九章详细讨论宏。现在你只需记住，当看到符号 `!` 的时候，就意味着调用的是宏而不是普通函数。

第三，`"Hello, world!"` 是一个字符串。我们把这个字符串作为一个参数传递给 `println!`，字符串将被打印到屏幕上。

第四，该行以分号结尾（`;`），这代表一个表达式的结束和下一个表达式的开始。大部分 Rust 代码行以分号结尾。

### 编译和运行是彼此独立的步骤

你刚刚运行了一个新创建的程序，那么让我们检查此过程中的每一个步骤。

在运行 Rust 程序之前，必须先使用 Rust 编译器编译它，即输入 `rustc` 命令并传入源文件名称，如下：

```text
$ rustc main.rs
```

如果你有 C 或 C++ 背景，就会发现这与 `gcc` 和 `clang` 类似。编译成功后，Rust 会输出一个二进制的可执行文件。

在 Linux、macOS 或 Windows 的 PowerShell 上，在 shell 中输入 `ls` 命令可以看见这个可执行文件。在 Linux 和 macOS，你会看到两个文件。在 Windows PowerShell 中，你会看到同使用 CMD 相同的三个文件。

```text
$ ls
main  main.rs
```

在 Windows 的 CMD 上，则输入如下内容：

```cmd
> dir /B %= the /B option says to only show the file names =%
main.exe
main.pdb
main.rs
```

这展示了扩展名为 *.rs* 的源文件、可执行文件（在 Windows 下是 *main.exe*，其它平台是 *main*），以及当使用 CMD 时会有一个包含调试信息、扩展名为 *.pdb* 的文件。从这里开始运行 *main* 或 *main.exe* 文件，如下：

```text
$ ./main # Windows 是 .\main.exe
```

如果 *main.rs* 是上文所述的 “Hello, world!” 程序，它将会在终端上打印 `Hello, world!`。

如果你更熟悉动态语言，如 Ruby、Python 或 JavaScript，则可能不习惯将编译和运行分为两个单独的步骤。Rust 是一种 **预编译静态类型**（*ahead-of-time compiled*）语言，这意味着你可以编译程序，并将可执行文件送给其他人，他们甚至不需要安装 Rust 就可以运行。如果你给他人一个 *.rb*、*.py* 或 *.js* 文件，他们需要先分别安装 Ruby，Python，JavaScript 实现（运行时环境，VM）。不过在这些语言中，只需要一句命令就可以编译和运行程序。这一切都是语言设计上的权衡取舍。

仅仅使用 `rustc` 编译简单程序是没问题的，不过随着项目的增长，你可能需要管理你项目的方方面面，并让代码易于分享。接下来，我们要介绍一个叫做 Cargo 的工具，它会帮助你编写真实世界中的 Rust 程序。

[troubleshooting]: ch01-01-installation.html#troubleshooting