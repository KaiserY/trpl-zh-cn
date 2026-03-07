## Hello, World!

[ch01-02-hello-world.md](https://github.com/rust-lang/book/blob/d46785983db2d2f94ca3d571db2cfbad0f5ad3e6/src/ch01-02-hello-world.md)

既然安装好了 Rust，是时候来编写第一个 Rust 程序了。当学习一门新语言的时候，使用该语言在屏幕上打印 `Hello, world!` 是一项传统，我们将沿用这一传统！

> 注意：本书假设你熟悉基本的命令行操作。Rust 对于你的编辑器、工具，以及代码位于何处并没有特定的要求，如果你更倾向于使用集成开发环境（IDE），而不是命令行，请尽管使用你喜欢的 IDE。目前很多 IDE 都在一定程度上支持 Rust；查看 IDE 文档以了解更多细节。Rust 团队一直致力于借助 `rust-analyzer` 提供强大的 IDE 支持。详见[附录 D][devtools]<!-- ignore -->。

### 创建项目目录

首先创建一个存放 Rust 代码的目录。Rust 并不关心代码存放在哪里，不过对于本书中的练习和项目，我们建议你在 home 目录中创建一个 *projects* 目录，并将所有项目都放在那里。

打开终端并输入如下命令创建 *projects* 目录，并在 *projects* 目录中为 “Hello, world!” 项目创建一个目录。

对于 Linux、macOS 和 Windows PowerShell，输入：

```console
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

### Rust 程序基础

接下来，新建一个源文件，命名为 *main.rs*。Rust 文件总是以 *.rs* 扩展名结尾。如果文件名包含多个单词，那么按照命名习惯，应当使用下划线来分隔单词。例如应命名为 *hello_world.rs*，而不是 *helloworld.rs*。

现在打开刚创建的 *main.rs* 文件，输入示例 1-1 中的代码。

<figure class="listing">

<span class="file-name">文件名：main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

<figcaption>示例 1-1：一个打印 `Hello, world!` 的程序</figcaption>

</figure>


保存文件，并回到当前目录为 *~/projects/hello_world* 的终端窗口。在 Linux 或 macOS 上，输入如下命令，编译并运行文件：

```console
$ rustc main.rs
$ ./main
Hello, world!
```

在 Windows 上，输入命令 `.\main`，而不是 `./main`：

```powershell
> rustc main.rs
> .\main
Hello, world!
```

不管使用何种操作系统，终端应该打印字符串 `Hello, world!`。如果没有看到这些输出，回到安装部分的 [“故障排除”][troubleshooting] 小节查找有帮助的方法。

如果 `Hello, world!` 确实打印出来了，恭喜你！你已经正式写出了一个 Rust 程序。现在你已经是一名 Rust 程序员了，欢迎加入！

### Rust 程序的结构

现在，让我们回过头来仔细看看这个 “Hello, world!” 程序。这是第一块拼图：

```rust
fn main() {

}
```

这几行定义了一个名叫 `main` 的函数。`main` 函数很特殊：在每个可执行的 Rust 程序中，它都是最先运行的代码。这里第一行声明了一个名为 `main` 的函数，它没有参数也没有返回值。如果有参数，它们会写在小括号 `()` 中。

函数体被包裹在 `{}` 中。Rust 要求所有函数体都要用花括号包裹起来。一般来说，将左花括号与函数声明置于同一行并以空格分隔，是良好的代码风格。

> 注：如果你希望在 Rust 项目中保持一种标准风格，可以使用名为 `rustfmt` 的自动格式化工具将代码格式化为特定的风格（更多内容详见[附录 D][devtools] 中的 `rustfmt`<!-- ignore -->）。Rust 团队已经在标准的 Rust 发行版中包含了这个工具，就像 `rustc` 一样。所以它应该已经安装在你的电脑中了！

在 `main` 函数体中有如下代码：

```rust
println!("Hello, world!");
```

这行代码完成这个简单程序的所有工作：在屏幕上打印文本。这里有三个重要的细节需要注意。

首先，`println!` 调用了一个 Rust 宏（macro）。如果调用的是函数，就应该写成 `println`（不带 `!`）。Rust 宏是一种用来编写可生成代码的代码，从而扩展 Rust 语法的方式；我们将在[第二十章][ch20-macros]详细讨论宏。现在你只需要知道，看到 `!` 就意味着调用的是宏而不是普通函数，并且宏并不总是遵循与函数相同的规则。

第二，`"Hello, world!"` 是一个字符串。我们把这个字符串作为一个参数传递给 `println!`，字符串将被打印到屏幕上。

第三，该行以分号结尾（`;`），这代表一个表达式的结束和下一个表达式可以开始。大部分 Rust 代码行以分号结尾。

### 编译与运行

你刚刚运行了一个新创建的程序，那么让我们检查此过程中的每一个步骤。

在运行 Rust 程序之前，必须先使用 Rust 编译器编译它，即输入 `rustc` 命令并传入源文件名称，如下：

```console
$ rustc main.rs
```

如果你有 C 或 C++ 背景，就会发现这与 `gcc` 和 `clang` 类似。编译成功后，Rust 会输出一个二进制的可执行文件。

在 Linux、macOS，以及 Windows 的 PowerShell 上，你可以在 shell 中输入 `ls` 命令来查看这个可执行文件。

```console
$ ls
main  main.rs
```

在 Linux 和 macOS，你会看到两个文件。在 Windows PowerShell 中，你会看到同使用 CMD 相同的三个文件。在 Windows 的 CMD 上，则输入如下命令：

```cmd
> dir /B %= the /B option says to only show the file names =%
main.exe
main.pdb
main.rs
```

这展示了带有 *.rs* 扩展名的源代码文件、可执行文件（Windows 上是 *main.exe*，其他平台上则是 *main*），以及在 Windows 上一个带有 *.pdb* 扩展名、包含调试信息的文件。接下来，你可以运行 *main* 或 *main.exe*，如下所示：

```console
$ ./main # Windows 是 .\main.exe
```

如果这里的 *main.rs* 是上文所述的 “Hello, world!” 程序，那么在终端上就会打印出 `Hello, world!`。

如果你更熟悉 Ruby、Python 或 JavaScript 这样的动态语言，可能不太习惯把编译和运行分成两个独立步骤。Rust 是一种 **预先编译**（*ahead-of-time compiled*）语言，这意味着你可以先将程序编译好，再把可执行文件交给其他人；即使他们没有安装 Rust，也可以直接运行。如果你给别人的是一个 *.rb*、*.py* 或 *.js* 文件，他们就需要分别安装 Ruby、Python 或 JavaScript 的实现（运行时环境）。不过在这些语言中，编译和运行程序通常只需要一条命令。语言设计中的一切都是权衡取舍。

仅仅使用 `rustc` 编译简单程序是没问题的，不过随着项目的增长，你可能需要管理你项目的方方面面，并让代码易于分享。接下来，我们要介绍一个叫做 Cargo 的工具，它会帮助你编写真实世界中的 Rust 程序。

[troubleshooting]: ch01-01-installation.html#故障排除troubleshooting
[devtools]: appendix-04-useful-development-tools.html
[ch20-macros]: ch20-05-macros.html
