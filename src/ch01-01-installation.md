## 安装

> [ch01-01-installation.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-01-installation.md)
> <br>
> commit c1b95a18dbcbb06aadf07c03759f27d88ccf62cf

第一步是安装 Rust。你需要网络连接来执行本章的命令，因为我们要从网上下载 Rust。

我们将会展示很多在终端中输入的命令，这些命令均以 `$` 开头。你不需要真的输入`$`，在这里它代表每行命令的起始。网上有很多教程和例子遵循这种惯例：`$` 代表以常规用户身份运行命令，`#` 代表需要用管理员身份运行命令。没有以 `$`（或 `#`）起始的行通常是之前命令的输出。

### 在 Linux 或 Mac 上安装

如果你使用 Linux 或 Mac，你需要做的全部，就是打开一个终端并输入：

```
$ curl https://sh.rustup.rs -sSf | sh
```

这会下载一个脚本并开始安装。可能会提示你输入密码，如果一切顺利，将会出现如下内容：

```
Rust is installed now. Great!
```

当然，如果你对于 `curl | sh` 心有疑虑，你可以随意下载、检查和运行这个脚本。

### 在 Windows 上安装

如果你使用 Windows，前往 [https://rustup.rs](https://rustup.rs/)<!-- ignore -->，按说明下载 rustup-init.exe，运行并照其指示操作。

本书中其余 Windows 相关的命令，假设你使用 `cmd` 作为 shell。如果你使用其它 shell，也许可以执行与 Linux 和 Mac 用户相同的命令。如果不行，请查看该 shell 的文档。

### 自定义安装

无论出于何种理由，如果不愿意使用 rustup.rs，请查看 [Rust 安装页面](https://www.rust-lang.org/install.html) 获取其他选择。


### 更新

一旦 Rust 安装完，更新到最新版本很简单。在 shell 中执行：

```
$ rustup update
```

### 卸载

卸载 Rust 同样简单。在 shell 中执行:

```
$ rustup self uninstall
```

### 故障排除

安装完 Rust 后，在 shell 中执行：

```
$ rustc --version
```

应该能看到类似这样的版本号、提交哈希和提交日期，对应安装时的最新稳定版：

```
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

出现这些内容，Rust 就安装成功了！

恭喜入坑！（此处应该有掌声！）

如果在 Windows 中使用出现问题，检查 Rust（rustc，cargo 等）是否在 `%PATH%` 环境变量所包含的路径中。

如果还是不能解决，有许多地方可以求助。最简单的是 [irc.mozilla.org 上的 #rust IRC 频道][irc]<!-- ignore --> ，可以使用 [Mibbit][mibbit] 来访问它。然后就能和其他 Rustacean（Rust 用户的称号，有自嘲意味）聊天并寻求帮助。其它给力的资源包括[用户论坛][users]和 [Stack Overflow][stackoverflow]。

[irc]: irc://irc.mozilla.org/#rust
[mibbit]: http://chat.mibbit.com/?server=irc.mozilla.org&channel=%23rust
[users]: https://users.rust-lang.org/
[stackoverflow]: http://stackoverflow.com/questions/tagged/rust

### 本地文档

安装程序自带本地文档，可以离线阅读。输入 `rustup doc` 可以在浏览器中查看。

任何时候，如果你拿不准标准库中类型或函数，请查看 API 文档！