## Hello, Cargo!

[ch01-03-hello-cargo.md](https://github.com/rust-lang/book/blob/369386fefd1138cbdf50ae628bae1ffc4ffce669/src/ch01-03-hello-cargo.md)

Cargo 是 Rust 的构建系统和包管理器。大多数 Rustaceans 都使用 Cargo 来管理他们的 Rust 项目，因为 Cargo 会替你处理许多任务，比如构建代码、下载代码依赖的库并编译这些库。（我们把代码所需要的库称为 **依赖**（*dependencies*）。）

最简单的 Rust 程序，比如我们刚刚编写的那个，没有任何依赖。如果使用 Cargo 来构建 “Hello, world!” 项目，那么只会用到 Cargo 中负责构建代码的那部分功能。随着你编写更复杂的 Rust 程序，就会加入依赖项；如果项目一开始就是用 Cargo 创建的，那么添加依赖项会容易得多。

由于绝大多数 Rust 项目都使用 Cargo，本书接下来的部分也假设你会使用 Cargo。如果你使用的是 [“安装”][installation] 部分介绍的官方安装方式，那么 Cargo 会随 Rust 一起安装。如果你通过其他方式安装 Rust，可以在终端输入如下命令检查是否安装了 Cargo：

```console
$ cargo --version
```

如果你看到了版本号，说明 Cargo 已经安装好了！如果看到类似 `command not found` 的错误，你应该查阅相应安装方式的文档，确定如何单独安装 Cargo。

### 使用 Cargo 创建项目

我们使用 Cargo 创建一个新项目，然后看看与上面的 “Hello, world!” 项目有什么不同。回到 *projects* 目录（或者你存放代码的目录）。接着，可在任何操作系统下运行以下命令：

```console
$ cargo new hello_cargo
$ cd hello_cargo
```

第一条命令会新建一个名为 *hello_cargo* 的目录和项目。我们将项目命名为 *hello_cargo*，Cargo 也会在同名目录中创建项目文件。

进入 *hello_cargo* 目录并列出文件。你会看到 Cargo 为我们生成了两个文件和一个目录：一个 *Cargo.toml* 文件、一个 *src* 目录，以及位于 *src* 目录中的 *main.rs* 文件。

它还会在 *hello_cargo* 目录中初始化一个 Git 仓库，并生成一个 *.gitignore* 文件。如果在一个已经存在的 Git 仓库中运行 `cargo new`，这些 Git 相关文件就不会再生成；你可以通过运行 `cargo new --vcs=git` 来覆盖这个行为。

> 注意：Git 是一种常见的版本控制系统（version control system，VCS）。你可以通过 `--vcs` 参数让 `cargo new` 使用其他版本控制系统，或者不使用 VCS。运行 `cargo new --help` 可以查看可用选项。

请自行选用文本编辑器打开 *Cargo.toml* 文件。它应该看起来与示例 1-2 中代码类似：

<figure class="listing">

<span class="file-name">文件名：Cargo.toml</span>

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

<figcaption>示例 1-2：`cargo new` 命令生成的 *Cargo.toml* 的内容</figcaption>

</figure>

这个文件使用 [*TOML*][toml]<!-- ignore -->（*Tom's Obvious, Minimal Language*）格式，这是 Cargo 配置文件所使用的格式。

第一行 `[package]` 是一个 section 标题，表明下面的语句是在配置一个 package。随着我们在这个文件中加入更多信息，还会增加其他 section。

接下来的三行设置了 Cargo 编译程序所需的配置信息：项目名称、项目版本，以及要使用的 Rust edition。[附录 E][appendix-e] 会介绍 `edition` 这个键。

最后一行 `[dependencies]` 是列出项目依赖的 section 的开始。在 Rust 中，代码包被称为 *crates*。这个项目不需要其他 crate，不过在第二章的第一个项目中我们就会需要依赖，到时候会用到这个 section。

现在打开 *src/main.rs* 看看：

<span class="filename">文件名：src/main.rs</span>

```rust
fn main() {
    println!("Hello, world!");
}
```

Cargo 为你生成了一个 “Hello, world!” 程序，正如我们之前写的示例 1-1！到目前为止，我们的项目与 Cargo 生成的项目之间的区别在于：Cargo 将代码放在 *src* 目录中，并在项目根目录放置了一个 *Cargo.toml* 配置文件。

Cargo 期望你的源文件位于 *src* 目录中。项目根目录则只用来放 README、license 信息、配置文件，以及其他与代码无关的内容。使用 Cargo 有助于让项目保持整洁：各类文件各归其位。

如果你一开始没有使用 Cargo 创建项目，比如我们之前创建的 “Hello, world!” 项目，你也可以把它转换成一个使用 Cargo 的项目。只要把项目代码移到 *src* 目录中，并创建一个合适的 *Cargo.toml* 文件即可。一个简单的办法是运行 `cargo init`，它会自动为你创建这个文件。

### 构建并运行 Cargo 项目

现在让我们来看看，使用 Cargo 构建和运行 “Hello, world!” 程序有什么不同！在 *hello_cargo* 目录下，输入下面的命令来构建项目：

```console
$ cargo build
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 2.85 secs
```

这条命令会在 *target/debug/hello_cargo* 生成一个可执行文件（Windows 上是 *target\debug\hello_cargo.exe*），而不是放在当前目录下。因为默认构建方式是调试构建（debug build），Cargo 会把可执行文件放在名为 *debug* 的目录中。你可以用下面的命令运行这个可执行文件：

```console
$ ./target/debug/hello_cargo # 或者在 Windows 下为 .\target\debug\hello_cargo.exe
Hello, world!
```

如果一切顺利，终端上应该会打印出 `Hello, world!`。第一次运行 `cargo build` 时，Cargo 还会在项目根目录创建一个新文件：*Cargo.lock*。这个文件会记录项目依赖的精确版本。由于这个项目没有依赖，所以文件内容比较少。你永远都不需要手动修改这个文件；Cargo 会替你管理它的内容。

我们刚刚使用 `cargo build` 构建了项目，并使用 `./target/debug/hello_cargo` 运行了程序；也可以使用 `cargo run`，在一条命令中完成编译并运行生成的可执行文件：

```console
$ cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

比起必须先运行 `cargo build` 再用可执行文件的完整路径来执行程序，使用 `cargo run` 更方便，所以大多数开发者会选择 `cargo run`。

注意，这一次并没有出现表明 Cargo 正在编译 `hello_cargo` 的输出。Cargo 发现文件没有发生变化，所以它没有重新构建，而是直接运行了二进制文件。如果你修改了源文件，Cargo 就会在运行之前重新构建项目，并会出现像这样的输出：

```console
$ cargo run
   Compiling hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.33 secs
     Running `target/debug/hello_cargo`
Hello, world!
```

Cargo 还提供了一个叫 `cargo check` 的命令。该命令快速检查代码确保其可以编译，但并不产生可执行文件：

```console
$ cargo check
   Checking hello_cargo v0.1.0 (file:///projects/hello_cargo)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs
```

为什么你会不需要可执行文件呢？通常 `cargo check` 比 `cargo build` 快得多，因为它省略了生成可执行文件这一步。如果你在编写代码时持续检查，`cargo check` 可以让你更快知道当前代码是否还能正常编译！因此，很多 Rustaceans 都会在编写程序时定期运行 `cargo check` 来确保代码可以编译；等到准备好使用可执行文件时，再运行 `cargo build`。

我们回顾下已学习的 Cargo 内容：

- 可以使用 `cargo new` 创建项目。
- 可以使用 `cargo build` 构建项目。
- 可以使用 `cargo run` 一步构建并运行项目。
- 可以使用 `cargo check` 在不生成二进制文件的情况下构建项目来检查错误。
- 有别于将构建结果放在与源码相同的目录，Cargo 会将其放到 *target/debug* 目录。

使用 Cargo 的另一个优点是，不论你使用什么操作系统，这些命令都是相同的。所以从现在开始，本书将不再分别为 Linux、macOS 和 Windows 提供单独的命令。

### 发布（release）构建

当项目最终准备好发布时，可以使用 `cargo build --release` 以启用优化方式编译项目。这会在 *target/release* 而不是 *target/debug* 下生成可执行文件。这些优化会让 Rust 代码运行得更快，不过开启优化也会延长编译时间。这就是为什么会有两种不同的 profile：一种用于开发，你会希望它能快速且频繁地重新构建；另一种用于构建最终交付给用户的程序，这种程序不会频繁重新构建，但会希望它运行得尽可能快。如果你在做代码运行时间的基准测试，请务必运行 `cargo build --release`，并使用 *target/release* 下的可执行文件进行测试。

### 把 Cargo 当作习惯

对于简单项目，Cargo 相比直接使用 `rustc` 并不会带来太多额外价值，但随着程序变得更复杂，它的价值就会逐渐显现。一旦程序增长到由多个文件组成，或者需要其他依赖，让 Cargo 来协调构建过程就会容易得多。

尽管 `hello_cargo` 项目很简单，但它已经用上了许多你在后续 Rust 开发中会经常使用的真实工具。实际上，当你在任何已有项目上工作时，都可以使用如下命令，通过 Git 检出代码、进入项目目录并构建它：

```console
$ git clone example.org/someproject
$ cd someproject
$ cargo build
```

关于更多 Cargo 的信息，请查阅 [其文档][cargo]。

## 总结

你已经为继续 Rust 之旅做好准备了！在本章中，你学习了如何：

- 使用 `rustup` 安装最新稳定版 Rust
- 更新到较新的 Rust 版本
- 打开本地安装的文档
- 直接通过 `rustc` 编写并运行 Hello, world! 程序
- 使用 Cargo 创建并运行新项目

现在正是通过构建一个更实在的程序来熟悉 Rust 代码读写的好时机。因此，在第二章中我们会构建一个猜数字游戏程序。如果你更想先学习 Rust 中常见的编程概念，请先阅读第三章，然后再回到第二章。

[installation]: ch01-01-installation.html#安装
[toml]: https://toml.io
[appendix-e]: appendix-05-editions.html
[cargo]: https://doc.rust-lang.org/cargo/
