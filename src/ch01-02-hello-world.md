## Hello, World!

> [ch01-02-hello-world.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-02-hello-world.md)
> <br>
> commit d1448cef370442b51e69298fb734fe29a3d14577

现在安装好了 Rust，让我们来编写第一个 Rust 程序。当学习一门新语言的时候，使用该语言在屏幕上打印 “Hello, world!” 是一项传统，这里我们将遵循这个传统！

> 注意：本书假设你熟悉基本的命令行操作。Rust 对于你的编辑器、工具，以及代码位于何处并没有特定的要求，如果相比命令行你更倾向于使用集成开发环境（IDE），请随意使用合意的 IDE。目前很多 IDE 拥有不同程度的 Rust 支持；查看 IDE 文档了解更多细节。目前 Rust 团队已经致力于提供强大的 IDE 支持，而且进展飞速！

### 创建项目目录

首先以创建一个存放 Rust 代码的目录开始。Rust 并不关心代码的位置，不过对于本书的练习和项目来说，我们建议你在 home 目录中创建一个 *projects* 目录，并将你的所有项目置于此处。

打开终端并输入如下命令创建一个 *projects* 目录并在 *projects* 目录中为 “Hello, world!” 创建一个目录。

对于 Linux 和 macOS，输入：

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

对于 Windows PowerShell，输入：

```powershell
> mkdir $env:USERPROFILE\projects
> cd $env:USERPROFILE\projects
> mkdir hello_world
> cd hello_world
```

### 编写并运行 Rust 程序

接下来，新建一个叫做 *main.rs* 的源文件。Rust 源代码总是以 *.rs* 后缀结尾。如果文件名包含多个单词，使用下划线分隔它们。例如 *my_program.rs*，而不是 *myprogram.rs*。

现在打开刚创建的 *main.rs* 文件，输入如示例 1-1 所示的代码。

<span class="filename">文件名: main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

<span class="caption">示例 1-1: 一个打印 “Hello, world!” 的程序</span>

保存文件，并回到终端窗口。在 Linux 或 macOS 上，输入如下命令编译并运行文件：

```text
$ rustc main.rs
$ ./main
Hello, world!
```

在 Windows 上，输入命令 `.\main.exe` 而不是 `./main`。

```powershell
> rustc main.rs
> .\main.exe
Hello, world!
```

不管使用何种系统，字符串 `Hello, world!` 应该打印到终端。如果没有看到这些输出，回到 “故障排除” 部分查找寻求帮助的方式。

如果 `Hello, world!` 出现了，恭喜你！你已经正式编写了一个 Rust 程序。现在你成为了一名 Rust 程序员！欢迎！

### 分析 Rust 程序

现在，让我们回过头来仔细看看 “Hello, world!” 程序中到底发生了什么。这是拼图的第一片：

```rust
fn main() {

}
```

这几行定义了一个 Rust **函数**。`main` 函数是特殊的：它是每个可执行的 Rust 程序所首先执行的代码。第一行代码声明了一个叫做 `main` 的函数，它没有参数也没有返回值。如果有参数的话，它们的名称应该出现在括号中，位于 `(` 和 `)` 之间。

还须注意函数体被包裹在花括号中，`{` 和 `}` 之间。Rust 要求所有函数体都要用花括号包裹起来（译者注：有些语言，当函数体只有一行时可以省略花括号，但在 Rust 中是不行的）。一般来说，将左花括号与函数声明置于同一行并以空格分隔，是良好的代码风格。

在编写本书的时候，一个叫做 `rustfmt` 的自动格式化工具正在开发中。如果你希望在 Rust 项目中保持一种标准风格，`rustfmt` 会将代码格式化为特定的风格。Rust 团队计划最终将其包含在标准 Rust 发行版中，就像 `rustc`。所以根据你阅读本书的时间，它可能已经安装到你的电脑中了！检查在线文档以了解更多细节。

在 `main()` 函数中是如下代码：

```rust
    println!("Hello, world!");
```

这行代码完成这个简单程序的所有工作：在屏幕上打印文本。这里有四个重要的细节需要注意。首先 Rust 使用 4 个空格的缩进风格，而不是 1 个制表符（tab）。

第二，`println!` 调用了一个 Rust **宏**（*macro*）。如果是调用函数，则应输入 `println`（没有`!`）。我们将在附录 D 中更加详细的讨论宏。现在你只需记住，当看到符号 `!` 的时候，就意味着调用的是宏而不是普通函数。

第三，`"Hello, world!"` 是一个 **字符串**。我们把这个字符串作为一个参数传递给 `println!`，字符串将被打印到屏幕上。

第四，该行以分号结尾（`;`），这代表一个表达式的结束和下一个表达式的开始。大部分 Rust 代码行以 `;` 结尾。

### 编译和运行是彼此独立的步骤

你刚刚运行了一个新创建的程序，那么让我们检查过程中的每一个步骤。

在运行 Rust 程序之前，必须先通过 `rustc` 命令并传递源文件名称来使用 Rust 编译器来编译它，如下：

```text
$ rustc main.rs
```

如果你有 C 或 C++ 背景，就会发现这与 `gcc` 和 `clang` 类似。编译成功后，Rust 应该会输出一个二进制可执行文件。

在 Linux、macOS 或 Windows的 PowerShell 上在 shell 中可以通过 `ls` 命令看到如下内容：

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

这展示了 *.rs* 后缀的源文件、可执行文件（在 Windows下是 *main.exe*，其它平台是 *main*），以及当使用 CMD 时会有一个包含调试信息的 *.pdb* 后缀的文件。从这里开始运行 *main* 或 *main.exe* 文件，如下：

```text
$ ./main # or .\main.exe on Windows
```

如果 *main.rs* 是上文所述的 “Hello, world!” 程序，它将会在终端上打印 `Hello, world!`。

来自 Ruby、Python 或 JavaScript 这样的动态类型语言背景的同学，可能不太习惯将编译和执行分为两个单独的步骤。Rust 是一种 **预编译静态类型**（*ahead-of-time compiled*）语言，这意味着你可以编译程序并将其交与他人，它们不需要安装 Rust 即可运行。如果你给他人一个 `.rb`、`.py` 或 `.js` 文件，他们需要先分别安装 Ruby，Python，JavaScript 实现（运行时环境，VM）。不过在这些语言中，只需要一句命令就可以编译和执行程序。这一切都是语言设计上的权衡取舍。

仅仅使用 `rustc` 编译简单程序是没问题的，不过随着项目的增长，你可能需要控制你项目的方方面面，并且更容易地将代码分享给其它人或项目。接下来，我们要介绍一个叫做 Cargo 的工具，它会帮助你编写真实世界中的 Rust 程序。
