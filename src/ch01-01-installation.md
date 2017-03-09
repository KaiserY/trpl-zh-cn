## 安装

> [ch01-01-installation.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-01-installation.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

使用 Rust 的第一步是安装。你需要联网来执行本章的命令，因为我们要从网上下载 Rust。

我们将会展示很多使用终端的命令，并且这些代码都以`$`开头。并不需要真正输入`$`，它们在这里代表每行指令的开头。在网上会看到很多使用这个惯例的教程和例子：`$`代表以常规用户运行命令，`#`代表需要用管理员运行的命令。没有以`$`（或`#`）的行通常是之前命令的输出。

### 在 Linux 或 Mac 上安装

如果你使用 Linux 或 Mac，所有需要做的就是打开一个终端并输入：

```sh
$ curl https://sh.rustup.rs -sSf | sh
```

这会下载一个脚本并开始安装。你可能被提示要输入密码。如果一切顺利，将会出现如下内容：

```sh
Rust is installed now. Great!
```

当然，如果你不赞成`curl | sh`这种模式，可以随意下载、检查和运行这个脚本。

### 在 Windows 上安装

在 Windows 上，前往[https://rustup.rs](https://rustup.rs/)<!-- ignore -->并按照说明下载`rustup-init.exe`。运行并遵循它提供的其余指示。

本书其余 Windows 相关的命令假设你使用`cmd`作为你的 shell。如果你使用不同的 shell，可能能够执行 Linux 和 Mac 用户相同的命令。如果都不行，查看所使用的 shell 的文档。

### 自定义安装

如果有理由倾向于不使用 rustup.rs，请查看[Rust 安装页面](https://www.rust-lang.org/install.html)获取其他选择。

### 卸载

卸载 Rust 同安装一样简单。在 shell 中运行卸载脚本

```sh
$ rustup self uninstall
```

### 故障排除

安装完 Rust 后，打开 shell，输入：

```sh
$ rustc --version
```

应该能看到类似这样的版本号、提交 hash 和提交日期，对应你安装时的最新稳定版本：

```sh
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

如果出现这些内容，Rust 就安装成功了！

恭喜入坑！（此处应该有掌声！）

如果有问题并且你在使用 Windows，检查 Rust（rustc，cargo 等）是否位于`%PATH%`系统变量中。

如果还是不能运行，有许多可以获取帮助的地方。最简单的是 irc.mozilla.org 上的 IRC 频道 [#rust-beginners][irc-beginners] 和供一般讨论之用的 [#rust][irc]，我们可以使用 [Mibbit][mibbit] 访问。然后我们就可以和其他能提供帮助的 Rustacean（我们这些人自嘲的绰号）聊天了。其它给力的资源包括[用户论坛][users]和[Stack Overflow][stackoverflow]。

[irc-beginners]: irc://irc.mozilla.org/#rust-beginners
[irc]: irc://irc.mozilla.org/#rust
[mibbit]: http://chat.mibbit.com/?server=irc.mozilla.org&channel=%23rust-beginners,%23rust
[users]: https://users.rust-lang.org/
[stackoverflow]: http://stackoverflow.com/questions/tagged/rust

### 本地文档

安装程序也包含一份本地文档的拷贝，你可以离线阅读它们。输入`rustup doc`将在浏览器中打开本地文档。

任何你太确认标准库提供的类型或函数是干什么的时候，使用文档 API 查找！