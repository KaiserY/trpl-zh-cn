## 安装

> [ch01-01-installation.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch01-01-installation.md)
> <br>
> commit d1448cef370442b51e69298fb734fe29a3d14577

第一步是安装 Rust。我们通过 `rustup` 下载 Rust，这是一个管理 Rust 版本和相关工具的命令行工具。你需要网络连接来进行下载。

接下来的步骤会下载最新的稳定（stable）版 Rust 编译器。本书所有的示例和输出采用稳定版 Rust 1.21.0。Rust 的稳定性保证确保本书所有的例子在更新版本的 Rust 中能够继续编译。不同版本的输出可能有轻微的不同，因为 Rust 经常改进错误信息和警告。换句话说，任何通过这些步骤所安装的更新稳定版 Rust 预期能够使用本书的内容。

> ### 命令行标记
>
> 本章和全书中我们展示了一些使用终端的命令。所有需要输入到终端的行都以 `$` 开头。无需输入`$`；它代表每行命令的起始。很多教程遵循 `$` 代表以常规用户身份运行命令，`#` 代表以管理员身份运行命令的惯例。不以 `$`（或 `#`）起始的行通常展示之前命令的输出。另外，PowerShell 特定的示例会采用 `>` 而不是 `$`。

### 在 Linux 或 macOS 上安装 Rustup

如果你使用 Linux 或 macOS，打开终端并输入如下命令：

```text
$ curl https://sh.rustup.rs -sSf | sh
```

这个命令下载一个脚本并开始 `rustup` 工具的安装，这会安装最新稳定版 Rust。过程中可能会提示你输入密码。如果安装成功，将会出现如下内容：

```text
Rust is installed now. Great!
```

当然，如果你不信任采用 `curl URL | sh` 来安装软件，请随意下载、检查和运行这个脚本。

此安装脚本自动将 Rust 加入系统 PATH 环境变量中，在下一次登陆时生效。如果你希望立刻就开始使用 Rust 而不重启终端，在 shell 中运行如下命令手动将 Rust 加入系统 PATH 变量：

```text
$ source $HOME/.cargo/env
```

或者，可以在 *~/.bash_profile* 文件中增加如下行：

```text
$ export PATH="$HOME/.cargo/bin:$PATH"
```

另外，你需要一个某种类型的连接器（linker）。可能他们已经安装了，不过当尝试编译 Rust 程序并得到表明连接器无法执行的错误时，你需要自行安装一个。可以安装一个 C 编译器，因为它通常带有正确的连接器。查看对应平台的文档了解如何安装 C 编译器。一些常见的 Rust 包会依赖 C 代码并因此也会需要 C 编译器，所以目前无论如何安装它都是值得的。

### 在 Windows 上安装 Rustup

在 Windows 上，前往 [https://www.rust-lang.org/en-US/install.html][install] 并按照其指示安装 Rust。在安装过程的某个步骤，你会收到一个信息说明为什么你也需要 Visual Studio 2013 或之后版本的 C++ build tools。获取这些 build tools 最简单的方式是安装 [Build Tools for Visual Studio 2017][visualstudio]。这些工具位于其他工具和框架部分。

[install]: https://www.rust-lang.org/en-US/install.html
[visualstudio]: https://www.visualstudio.com/downloads/

本书的余下部分使用能同时用于 *cmd.exe* 和 PowerShell 的命令。如果出现特定不同情况时，我们会说明如何使用。

### 不使用 Rustup 自定义安装

如果出于某些理由你倾向于不使用 `rustup`，请查看 [Rust 安装页面](https://www.rust-lang.org/install.html) 获取其他选项。


### 更新和卸载

通过 `rustup` 安装了 Rust 之后，，更新到最新版本是很简单的。在 shell 中运行如下更新脚本：

```text
$ rustup update
```

为了卸载 Rust 和 `rustup`，在 shell 中运行如下卸载脚本:

```text
$ rustup self uninstall
```

### 故障排除（Troubleshooting）

对于检查是否正确安装了 Rust，打开 shell 并运行如下行：

```text
$ rustc --version
```

应该能看到类似这样格式的版本号、提交哈希和提交日期，对应已发布的最新稳定版：

```text
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

如果出现这些内容，Rust 就安装成功了！如果并没有看到这些信息并且使用 Windows，请检查 Rust 是否位于 `%PATH%` 系统变量中。如果一切正确但 Rust 仍不能使用，有许多地方可以求助。

恭喜入坑！（此处应该有掌声！）

如果在 Windows 中使用出现问题，检查 Rust（rustc，cargo 等）是否在 `%PATH%` 环境变量所包含的路径中。最简单的是 [irc.mozilla.org 上的 #rust IRC 频道][irc]<!-- ignore --> ，可以使用 [Mibbit][mibbit] 来访问它。在这里你可以与其他能够帮助你的 Rustacean（Rust 用户的称号，有自嘲意味）聊天。其它给力的资源包括[用户论坛][users]和 [Stack Overflow][stackoverflow]。

如果还是不能解决，有许多地方可以求助。最简单的是 [irc.mozilla.org 上的 #rust IRC 频道][irc]<!-- ignore --> ，可以使用 [Mibbit][mibbit] 来访问它。然后就能和其他 Rustacean（Rust 用户的称号，有自嘲意味）聊天并寻求帮助。其它给力的资源包括[用户论坛][users]和 [Stack Overflow][stackoverflow]。

[irc]: irc://irc.mozilla.org/#rust
[mibbit]: http://chat.mibbit.com/?server=irc.mozilla.org&channel=%23rust
[users]: https://users.rust-lang.org/
[stackoverflow]: http://stackoverflow.com/questions/tagged/rust

### 本地文档

安装程序也自带一份文档的本地拷贝，可以离线阅读。运行 `rustup doc` 在浏览器中查看本地文档。

任何时候，如果你拿不准标准库中的类型或函数如何工作，请查看应用程序接口（application programming interface， API）文档！
