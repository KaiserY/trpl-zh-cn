## 使用`cargo install`从 Crates.io 安装文件

> [ch14-04-installing-binaries.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-04-installing-binaries.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

`cargo install`命令用于在本地安装和使用二进制 crate。它并不打算替换系统中的包；它意在作为一个方便 Rust 开发者安装他人在 crates.io 共享的工具的手段。只有有二进制目标文件的包能够安装，而且所有二进制文件都被安装到 Rust 安装根目录的 *bin* 文件夹中。如果你使用 *rustup.rs* 安装的 Rust 且没有自定义任何配置，这将是`$HOME/.cargo/bin`。将这个目录添加到`$PATH`环境变量中就能够运行通过`cargo install`安装的程序了。

例如，第十二章提到的叫做`ripgrep`的用于搜索文件的`grep`的 Rust 实现。如果想要安装`ripgrep`，可以运行如下：

```
$ cargo install ripgrep
Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading ripgrep v0.3.2
 ...snip...
   Compiling ripgrep v0.3.2
    Finished release [optimized + debuginfo] target(s) in 97.91 secs
  Installing ~/.cargo/bin/rg
```

最后一行输出展示了安装的二进制文件的位置和名称，在这里`ripgrep`被命名为`rg`。只要你像上面提到的那样将安装目录假如`$PATH`，就可以运行`rg --help`并开始使用一个更快更 Rust 的工具来搜索文件了！