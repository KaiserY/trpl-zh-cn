## 安装

> [ch01-01-installation.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-01-installation.md)
> <br>
> commit b6dcc87f2b811c88fc741c86cf6ed3976333acba

使用 Rust 的第一步是安装。你需要网络连接来执行本章的命令，因为将要从网上下载 Rust。

这里将会展示很多使用终端的命令，这些命令均以 `$` 开头。不需要真的输入`$`，在这里它们代表每行命令的起始。网上有很多教程和例子遵循这种惯例：`$` 代表以常规用户身份运行命令，`#` 代表需要用管理员身份运行命令。没有以 `$`（或 `#`）起始的行通常是之前命令的输出。

### 在 Linux 或 Mac 上安装

如果你使用 Linux 或 Mac，你需要做的全部就是打开一个终端并输入：

```text
$ curl https://sh.rustup.rs -sSf | sh
```

这会下载一个脚本并开始安装。可能会提示你输入密码，如果一切顺利，将会出现如下内容：

```text
Rust is installed now. Great!
```

当然，如果你不信任采用 `curl URL | sh` 来安装软件，请随意下载、检查和运行这个脚本。

此安装脚本自动将 Rust 加入系统 PATH 环境变量中，再次登陆时生效。如果你希望立刻（不重新登陆）就开始使用 Rust，在 shell 中运行如下命令：

```text
$ source $HOME/.cargo/env
```

或者，在 `~/.bash_profile` 文件中增加如下行：

```text
$ export PATH="$HOME/.cargo/bin:$PATH"
```

### 在 Windows 上安装

如果你使用 Windows，前往 [https://rustup.rs](https://rustup.rs/)<!-- ignore -->，按说明下载 rustup-init.exe，运行并照其指示操作。

本书中其余 Windows 相关的命令，假设你使用 `cmd` 作为 shell。如果你使用其它 shell，也许可以执行与 Linux 和 Mac 用户相同的命令。如果不行，请查看该 shell 的文档。

### 自定义安装

无论出于何种理由，如果不愿意使用 rustup.rs，请查看 [Rust 安装页面](https://www.rust-lang.org/install.html) 获取其他选项。


### 更新

一旦安装了 Rust，更新到最新版本是很简单的。在 shell 中执行更新脚本：

```text
$ rustup update
```

### 卸载

卸载 Rust 与安装同样简单。在 shell 中执行卸载脚本:

```text
$ rustup self uninstall
```

### 故障排除（Troubleshooting）

安装完 Rust 后，打开 shell 并执行：

```text
$ rustc --version
```

应该能看到类似这样格式的版本号、提交哈希和提交日期，对应安装时的最新稳定版：

```text
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

如果出现这些内容，Rust 就安装成功了！

恭喜入坑！（此处应该有掌声！）

如果在 Windows 中使用出现问题，检查 Rust（rustc，cargo 等）是否在 `%PATH%` 环境变量所包含的路径中。

如果还是不能解决，有许多地方可以求助。最简单的是 [irc.mozilla.org 上的 #rust IRC 频道][irc]<!-- ignore --> ，可以使用 [Mibbit][mibbit] 来访问它。然后就能和其他 Rustacean（Rust 用户的称号，有自嘲意味）聊天并寻求帮助。其它给力的资源包括[用户论坛][users]和 [Stack Overflow][stackoverflow]。

[irc]: irc://irc.mozilla.org/#rust
[mibbit]: http://chat.mibbit.com/?server=irc.mozilla.org&channel=%23rust
[users]: https://users.rust-lang.org/
[stackoverflow]: http://stackoverflow.com/questions/tagged/rust

### 本地文档

安装程序也自带一份文档的本地拷贝，可以离线阅读。运行 `rustup doc` 在浏览器中查看本地文档。

任何时候，如果你拿不准标准库中的类型或函数如何工作，请查看 API 文档！
