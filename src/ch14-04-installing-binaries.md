## 使用 `cargo install` 安装二进制文件

[ch14-04-installing-binaries.md](https://github.com/rust-lang/book/blob/43b9ad334aaf7353e5708dba49f84f941b50ec4b/src/ch14-04-installing-binaries.md)

`cargo install` 命令允许你在本地安装和使用二进制 crate。它并不是为了替代系统包管理器，而是为 Rust 开发者提供一种方便的方式，用来安装他人在 [crates.io](https://crates.io/)<!-- ignore --> 上分享的工具。注意，只有带有二进制目标的包才能被安装。**二进制目标**是指当 crate 包含 *src/main.rs* 文件，或将其他文件指定为二进制目标时所生成的可运行程序；这与库目标不同，库目标本身不能单独运行，但适合被其他程序引入。通常，crate 的 *README* 文件会说明它是库、带有二进制目标，还是两者兼有。

所有通过 `cargo install` 安装的二进制文件，都会放在安装根目录下的 *bin* 文件夹中。如果你使用 *rustup.rs* 安装 Rust，并且没有做任何自定义配置，那么这个目录就是 *$HOME/.cargo/bin*。请确保这个目录已经加入你的 `$PATH`，这样你才能运行通过 `cargo install` 安装的程序。

例如，在第十二章中我们提到过，有一个名为 `ripgrep` 的 `grep` 工具 Rust 实现，可用于搜索文件。要安装 `ripgrep`，可以运行以下命令：

```console
$ cargo install ripgrep
    Updating crates.io index
  Downloaded ripgrep v14.1.1
  Downloaded 1 crate (213.6 KB) in 0.40s
  Installing ripgrep v14.1.1
--snip--
   Compiling grep v0.3.2
    Finished `release` profile [optimized + debuginfo] target(s) in 6.73s
  Installing ~/.cargo/bin/rg
   Installed package `ripgrep v14.1.1` (executable `rg`)
```

输出的倒数第二行展示了已安装二进制文件的位置和名称；对于 `ripgrep` 来说，这个可执行文件名是 `rg`。只要安装目录已经像前面说的那样加入了 `$PATH`，你就可以运行 `rg --help`，开始使用这个更快、也更“Rust 风格”的文件搜索工具了！
