## 附录 D：实用开发工具

> [appendix-04-useful-development-tools.md](https://github.com/rust-lang/book/blob/master/src/appendix-04-useful-development-tools.md)
> <br />
> commit 70a82519e48b8a61f98cabb8ff443d1b21962fea

本附录，我们将讨论 Rust 项目提供的用于开发 Rust 代码的工具。

### 通过 `rustfmt` 自动格式化

`rustfmt` 工具根据社区代码风格格式化代码。很多项目使用 `rustfmt` 来避免编写 Rust 风格的争论：所有人都用这个工具格式化代码！

安装 `rustfmt`：

```text
$ rustup component add rustfmt
```

这会提供 `rustfmt` 和 `cargo-fmt`，类似于 Rust 同时安装 `rustc` 和 `cargo`。为了格式化整个 Cargo 项目：

```text
$ cargo fmt
```

运行此命令会格式化当前 crate 中所有的 Rust 代码。这应该只会改变代码风格，而不是代码语义。请查看 [该文档][rustfmt] 了解 `rustfmt` 的更多信息。

[rustfmt]: https://github.com/rust-lang-nursery/rustfmt

### 通过 `rustfix` 修复代码

如果你编写过 Rust 代码，那么你可能见过编译器警告。例如，考虑如下代码：

<span class="filename">文件名: src/main.rs</span>

```rust
fn do_something() {}

fn main() {
    for i in 0..100 {
        do_something();
    }
}
```

这里调用了 `do_something` 函数 100 次，不过从未在 `for` 循环体中使用变量 `i`。Rust 会警告说：

```text
$ cargo build
   Compiling myprogram v0.1.0 (file:///projects/myprogram)
warning: unused variable: `i`
 --> src/main.rs:4:9
  |
4 |     for i in 1..100 {
  |         ^ help: consider using `_i` instead
  |
  = note: #[warn(unused_variables)] on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.50s
```

警告中建议使用 `_i` 名称：下划线表明该变量有意不使用。我们可以通过 `cargo fix` 命令使用 `rustfix` 工具来自动采用该建议：

```text
$ cargo fix
    Checking myprogram v0.1.0 (file:///projects/myprogram)
      Fixing src/main.rs (1 fix)
    Finished dev [unoptimized + debuginfo] target(s) in 0.59s
```

如果再次查看 *src/main.rs*，会发现 `cargo fix` 修改了代码：

<span class="filename">文件名: src/main.rs</span>

```rust
fn do_something() {}

fn main() {
    for _i in 0..100 {
        do_something();
    }
}
```

现在 `for` 循环变量变为 `_i`，警告也不再出现。

`cargo fix` 命令可以用于在不同 Rust 版本间迁移代码。版本在附录 E 中介绍。

### 通过 `clippy` 提供更多 lint 功能

`clippy` 工具是一系列 lint 的集合，用于捕捉常见错误和改进 Rust 代码。

安装 `clippy`：

```text
$ rustup component add clippy
```

对任何 Cargo 项目运行 clippy 的 lint：

```text
$ cargo clippy
```

例如，如果程序使用了如 pi 这样数学常数的近似值，如下：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 3.1415;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

在此项目上运行 `cargo clippy` 会导致这个错误：

```text
error: approximate value of `f{32, 64}::consts::PI` found. Consider using it directly
 --> src/main.rs:2:13
  |
2 |     let x = 3.1415;
  |             ^^^^^^
  |
  = note: #[deny(clippy::approx_constant)] on by default
  = help: for further information visit https://rust-lang-nursery.github.io/rust-clippy/master/index.html#approx_constant
```

这告诉我们 Rust 定义了更为精确的常量，而如果使用了这些常量程序将更加准确。如下代码就不会导致 `clippy` 产生任何错误或警告：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = std::f64::consts::PI;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

请查看 [其文档][clippy] 来了解 `clippy` 的更多信息。

[clippy]: https://github.com/rust-lang/rust-clippy

### 使用 Rust Language Server 的 IDE 集成

为了帮助 IDE 集成，Rust 项目分发了 `rls`，其为 Rust Language Server 的缩写。这个工具采用 [Language Server Protocol][lsp]，这是一个 IDE 与编程语言沟通的规格说明。`rls` 可以用于不同的客户端，比如 [Visual Studio: Code 的 Rust 插件][vscode]。

[lsp]: http://langserver.org/
[vscode]: https://marketplace.visualstudio.com/items?itemName=rust-lang.rust

`rls` 工具的质量还未达到发布 1.0 版本的水平，不过目前有一个可用的预览版。请尝试使用并告诉我们它如何！

安装 `rls`：

```text
$ rustup component add rls
```

接着为特定的 IDE 安装 language server 支持，如此便会获得如自动补全、跳转到定义和 inline error 之类的功能。

请查看 [其文档][rls] 来了解 `rls` 的更多信息。

[rls]: https://github.com/rust-lang/rls
