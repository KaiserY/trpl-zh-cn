## 附录 D：实用开发工具

[appendix-04-useful-development-tools.md](https://github.com/rust-lang/book/blob/7b2b4804c0bd9442805441d21a945e4dd37092b2/src/appendix-04-useful-development-tools.md)

在本附录中，我们将讨论 Rust 项目提供的一些有助于开发 Rust 代码的工具。我们将介绍自动格式化、快速应用警告修复、linter 以及与 IDE 的集成。

### 通过 `rustfmt` 自动格式化

`rustfmt` 工具根据社区代码风格格式化代码。很多项目使用 `rustfmt` 来避免编写 Rust 代码风格的争论：所有人都用这个工具格式化代码！

Rust 安装默认已包含 `rustfmt`，因此你的系统上应该已经有 `rustfmt` 和 `cargo-fmt` 这两个程序了。它们类似于 `rustc` 和 `cargo` 的关系：`rustfmt` 提供更细粒度的控制，而 `cargo-fmt` 则理解使用 Cargo 的项目约定。要格式化任意 Cargo 项目，请运行以下命令：

```console
$ cargo fmt
```

运行此命令会格式化当前 crate 中所有的 Rust 代码。这应该只会改变代码风格，而不是代码语义。有关 `rustfmt` 的更多信息，请参阅 [该文档][rustfmt]。

[rustfmt]: https://github.com/rust-lang/rustfmt

### 通过 `rustfix` 修复代码

`rustfix` 工具已随 Rust 安装一并提供，可以自动修复那些具有明确修复方式的编译器警告，这通常正是你所需要的。你可能已经见过类似的编译器警告。例如，考虑如下代码：

<span class="filename">文件名：src/main.rs</span>

```rust
fn main() {
    let mut x = 42;
    println!("{x}");
}
```

这里定义变量 `x` 为可变，但我们实际上从未修改它。Rust 会对此发出警告：

```console
$ cargo build
   Compiling myprogram v0.1.0 (file:///projects/myprogram)
warning: variable does not need to be mutable
 --> src/main.rs:2:9
  |
2 |     let mut x = 0;
  |         ----^
  |         |
  |         help: remove this `mut`
  |
  = note: `#[warn(unused_mut)]` on by default
```

警告中建议移除 `mut` 关键字。我们可以通过运行 `cargo fix` 命令使用 `rustfix` 工具来自动采用该建议：

```console
$ cargo fix
    Checking myprogram v0.1.0 (file:///projects/myprogram)
      Fixing src/main.rs (1 fix)
    Finished dev [unoptimized + debuginfo] target(s) in 0.59s
```

如果再次查看 _src/main.rs_，会发现 `cargo fix` 修改了代码：

<span class="filename">文件名：src/main.rs</span>

```rust
fn main() {
    let x = 42;
    println!("{x}");
}
```

变量 `x` 现在是不可变的了，警告也不再出现。

你也可以用 `cargo fix` 在不同 Rust edition 之间迁移代码。edition 在[附录 E][editions]中介绍。

### 使用 Clippy 获取更多 lint

Clippy 工具是一组 lints 的集合，用于分析你的代码，帮助你捕捉常见错误并改进 Rust 代码。Clippy 已包含在 Rust 的标准安装中。

要对任何 Cargo 项目运行 Clippy 的 lint，请输入以下命令：

```console
$ cargo clippy
```

例如，假设你写了一个程序，像下面这样使用某个数学常量的近似值，例如 pi：

<span class="filename">文件名：src/main.rs</span>

```rust
fn main() {
    let x = 3.1415;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

在此项目上运行 `cargo clippy` 会导致这个错误：

```text
error: approximate value of `f{32, 64}::consts::PI` found
 --> src/main.rs:2:13
  |
2 |     let x = 3.1415;
  |             ^^^^^^
  |
  = note: `#[deny(clippy::approx_constant)]` on by default
  = help: consider using the constant directly
  = help: for further information visit https://rust-lang.github.io/rust-clippy/master/index.html#approx_constant
```

该错误提示你 Rust 已经定义了一个更精确的 `PI` 常量，如果使用该常量，你的程序会更为正确。你可以将代码改为使用 `PI` 常量。如下代码就不会引发 Clippy 的任何错误或警告：

<span class="filename">文件名：src/main.rs</span>

```rust
fn main() {
    let x = std::f64::consts::PI;
    let r = 8.0;
    println!("the area of the circle is {}", x * r * r);
}
```

有关 Clippy 的更多信息，请参阅 [其文档][clippy]。

[clippy]: https://github.com/rust-lang/rust-clippy

### 使用 `rust-analyzer` 的 IDE 集成

为了帮助 IDE 集成，Rust 社区建议使用 [`rust-analyzer`][rust-analyzer]。这个工具是一组以编译器为中心的实用程序，它实现了 [Language Server Protocol][lsp]，这是 IDE 与编程语言之间通信的一项规范。不同的客户端都可以使用 `rust-analyzer`，例如 [Visual Studio Code 的 Rust analyzer 插件][vscode]。

[lsp]: http://langserver.org/
[vscode]: https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer

访问 `rust-analyzer` 项目的[主页][rust-analyzer]获取安装说明，然后为你所使用的 IDE 安装相应的 language server 支持。这样一来，你的 IDE 就会获得自动补全、跳转到定义以及内联错误等能力。

[rust-analyzer]: https://rust-analyzer.github.io
[editions]: appendix-05-editions.html
