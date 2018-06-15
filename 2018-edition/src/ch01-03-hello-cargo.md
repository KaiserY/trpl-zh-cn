## Hello, Cargo!

> [ch01-03-hello-cargo.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-03-hello-cargo.md)
> <br>
> commit d1448cef370442b51e69298fb734fe29a3d14577

Cargo 是 Rust 的构建系统和包管理器。大部分 Rustacean 们使用 Cargo 来管理他们的 Rust 项目，因为它可以为你处理很多任务，比如构建代码、下载依赖库并编译这些库。（我们把代码所需要的库叫做 **依赖**（*dependencies*）。

最简单的 Rust 程序，比如我们刚刚编写的，并没有任何依赖。所以如果使用 Cargo 来构建 “Hello, world!” 项目，将只会用到 Cargo 构建代码那部分的功能。随着编写的程序更加复杂，你会添加依赖，如果你一开始就使用 Cargo 的话，添加依赖将会变得简单许多。

由于绝大部分 Rust 项目使用 Cargo，本书接下来的部分将假设你也使用 Cargo。如果使用 “安装” 部分介绍的官方安装包的话，则自带了 Cargo。如果通过其他方式安装的话，可以在终端输入如下命令检查是否安装了 Cargo：

```text
$ cargo --version
```

如果出现了版本号，一切 OK！如果出现类似 `command not found` 的错误，你应该查看相应安装文档以确定如何单独安装 Cargo。

### 使用 Cargo 创建项目

让我们使用 Cargo 来创建一个新项目，然后看看与上面的 `hello_world` 项目有什么不同。回到 projects 目录（或者任何你放置代码的目录）。接着并在任何操作系统下运行：

```text
$ cargo new hello_cargo --bin
$ cd hello_cargo
```

第一行命令新建了名为 *hello_cargo* 的二进制可执行程序。传递给 `cargo new` 的 `--bin` 参数生成一个可执行程序（通常就叫做 **二进制文件**，*binary*），而不是一个库。项目的名称被定为 `hello_cargo`，同时 Cargo 在一个同名目录中创建项目文件。

进入 *hello_cargo* 目录并列出文件。将会看到 Cargo 生成了两个文件和一个目录：一个 *Cargo.toml* 文件和一个 *src* 目录，*main.rs* 文件位于 *src* 目录中。它也在 *hello_cargo* 目录初始化了一个 git 仓库，以及一个 *.gitignore* 文件。

> 注意：Git 是一个常见版本控制系统（version control system， VCS）。可以通过 `--vcs` 参数使 `cargo new` 切换到其它版本控制系统（VCS），或者不使用 VCS。运行 `cargo new --help` 参看可用的选项。

如果列出 *hello_cargo* 目录中的文件，将会看到 Cargo 生成了一个文件和一个目录：一个 *Cargo.toml* 文件和一个 *src* 目录，*main.rs* 文件位于 *src* 目录中。它也在 *hello_cargo* 目录初始化了一个 git 仓库，以及一个 *.gitignore* 文件；你可以通过 `--vcs` 参数切换到其它版本控制系统（VCS），或者不使用 VCS。

请随意使用任何文本编辑器打开 *Cargo.toml* 文件。它应该看起来如示例 1-2 所示：

<span class="filename">文件名: Cargo.toml</span>

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]

[dependencies]
```

<span class="caption">示例 1-2: *Cargo.toml* 生成的 *Cargo.toml* 的内容</span>

这个文件使用 [*TOML*][toml]<!-- ignore --> (Tom's Obvious, Minimal Language) 格式，这是 Cargo 的配置文件的格式。

[toml]: https://github.com/toml-lang/toml

第一行，`[package]`，是一个部分标题，表明下面的语句用来配置一个包。随着我们在这个文件增加更多的信息，还将增加其他部分。

接下来的三行设置了 Cargo 编译程序所需的配置：项目的名称、版本和作者，它们告诉 Cargo 需要编译这个项目。Cargo 从环境中获取你的名称和 email 信息，所以如果这些信息不正确，请修改并保存此文件。

最后一行，`[dependencies]`，是项目依赖列表（我们称呼 Rust 代码包为 crate）部分的开始。在 Rust 中，代码包被称为 *crates*。这个项目并不需要任何其他的 crate，不过在第二章的第一个项目会用到依赖，那时会用得上这个部分。

现在打开 *src/main.rs* 看看：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

Cargo 为你生成了一个 “Hello World!” 程序，正如我们之前示例 1-1 中编写的那个！目前为止，之前项目与 Cargo 生成项目的区别是 Cargo 将代码放在 *src* 目录，同时项目根目录包含一个 *Cargo.toml* 配置文件

Cargo 期望源文件位于 *src* 目录。项目根目录只留给 README、license 信息、配置文件和其他跟代码无关的文件。使用 Cargo 帮助你保持项目干净整洁，一切井井有条。

如果没有用 Cargo 开始项目，比如 *hello_world* 目录中的项目，可以将其转化为一个 Cargo 项目。将代码放入 *src* 目录，并创建一个合适的 *Cargo.toml* 文件。

### 构建并运行 Cargo 项目

现在让我们看看通过 Cargo 构建和运行 “Hello, world!” 程序有什么不同。在 *hello_cargo*，输入下面的命令来构建项目：

```text
$ cargo build
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 2.85 secs
```

这这个命令会创建 *target/debug/hello_cargo*（或者在 Windows 上是 *target\debug\hello_cargo.exe*）可执行文件，而不是在目前目录。可以通过这个命令运行可执行文件：

```text
$ ./target/debug/hello_cargo # or .\target\debug\hello_cargo.exe on Windows
Hello, world!
```

如果一切顺利，`Hello, world!` 应该打印在终端上。首次运行 `cargo build` 时也会使 Cargo 在项目根目录创建一个新文件：*Cargo.lock*。这个文件记录项目依赖的实际版本。这个项目并没有依赖，所以其内容比较少。你自己永远也不需要碰这个文件，让 Cargo 处理它就行了。

我们刚刚使用 `cargo build` 构建了项目并使用 `./target/debug/hello_cargo` 运行了程序，也可以使用 `cargo run` 在一个命令中同时编译并运行生成的可执行文件：

```text
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

注意这一次并没有出现表明 Cargo 正在编译 `hello_cargo` 的输出。Cargo 发现文件并没有被改变，就直接运行了二进制文件。如果修改了源文件的话，Cargo 会在运行之前重新构建项目，并会出现像这样的输出：

```text
$ cargo run
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.33 secs
     Running `target/debug/hello_cargo`
Hello, world!
```
Cargo 还提供了一个叫 `cargo check` 的命令。该命令快速检查代码确保其可以编译但并不产生可执行文件：

```text
$ cargo check
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs
```

为什么你会不需要可执行文件呢？通常 `cargo check` 要比 `cargo build`快得多，因为它省略了生成可执行文件的步骤。如果编写代码时持续的进行检查，`cargo check` 会加速开发！为此很多 Rustaceans 编写代码时运行 `cargo check` 定期运行 `cargo check` 确保它们可以编译。当准备好使用可执行文件时运行 `cargo build`。

作为目前所学的关于 Cargo 内容的回顾：

* 可以使用 `cargo build` 或 `cargo check` 构建项目。
* 可以使用 `cargo run` 一步构建并运行项目。
* 有别于将构建结果放在与源码相同的目录，Cargo 会将其放到 *target/debug* 目录。

Cargo 的一个额外的优点是不管你使用什么操作系统其命令都是一样的。所以从此以后本书将不再为 Linux 和 macOS 以及 Windows 提供相应的命令。

### 发布（release）构建

当项目最终准备好发布了，可以使用 `cargo build --release` 来优化编译项目。这会在 *target/release* 而不是  *target/debug* 下生成可执行文件。这些优化可以让 Rust 代码运行的更快，不过启用这些优化也需要消耗更长的编译时间。这也就是为什么会有两种不同的配置：一种为了开发，你需要经常快速重新构建；另一种为了构建给用户最终程序，它们不会经常重新构建，并且希望程序运行得越快越好。如果你在测试代码的运行时间，请确保运行 `cargo build --release` 并使用 *target/release* 下的可执行文件进行测试。

### 把 Cargo 当作习惯

对于简单项目， Cargo 并不比 `rustc` 提供了更多的优势，不过随着开发的深入终将证明其价值。对于拥有多个 crate 的复杂项目，让 Cargo 来协调构建将简单的多。

即便 `hello_cargo` 项目十分简单，它现在也使用了很多你之后的 Rust 生涯将会用得上的实用工具。其实对于任何你想要从事的项目，可以使用如下命令通过 Git 检出代码，移动到该项目目录并构建：

```text
$ git clone someurl.com/someproject
$ cd someproject
$ cargo build
```

关于更多 Cargo 的信息，请查阅 [其文档][its documentation]。

[its documentation]: https://doc.rust-lang.org/cargo/

## 总结

你已经准备好迎来 Rust 之旅的伟大开始！在本章中，你学习了如何：

* 使用 `rustup` 安装最新稳定版的 Rust
* 更新到新版的 Rust
* 打开本地安装的文档
* 直接通过 `rustc` 编写并运行 “Hello, world!” 程序
* 使用 Cargo 风格创建并运行新项目

现在是一个通过构建更大的项目来熟悉读写 Rust 代码的好时机。所以在下一章，我们会构建一个猜猜看游戏程序。如果你更愿意开始学习 Rust 中常见的编程概念如何工作，请阅读第三章，接着再回到第二章。
