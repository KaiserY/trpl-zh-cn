## 安装

[ch01-01-installation.md](https://github.com/rust-lang/book/blob/369386fefd1138cbdf50ae628bae1ffc4ffce669/src/ch01-01-installation.md)

第一步是安装 Rust。我们会通过 `rustup` 下载 Rust，这是一个管理 Rust 版本和相关工具的命令行工具。下载时需要联网。

> 注意：如果你出于某些理由倾向于不使用 `rustup`，请到 [Rust 的其他安装方法页面][otherinstall] 查看其它安装选项。

接下来的步骤会安装最新稳定版 Rust 编译器。Rust 的稳定性保证意味着，本书中所有能够编译的示例，在更新的 Rust 版本中也应继续能够编译。不同版本之间的输出可能略有差异，因为 Rust 经常会改进错误信息和警告。也就是说，按照这些步骤安装的任何较新的稳定版 Rust，都应该能正常配合本书内容使用。

> ### 命令行标记
>
> 本章和全书中，我们会展示一些在终端中使用的命令。所有需要输入到终端的行都以 `$` 开头。你不需要输入 `$` 字符；这里显示的 `$` 字符表示命令行提示符，仅用于提示每行命令的起点。不以 `$` 起始的行通常展示前一个命令的输出。另外，PowerShell 专用的示例会采用 `>` 而不是 `$`。

### 在 Linux 或 macOS 上安装 `rustup`

如果你使用 Linux 或 macOS，打开终端并输入如下命令：

```console
$ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

这条命令会下载一个脚本并启动 `rustup` 工具的安装，它会安装最新稳定版 Rust。过程中可能会提示你输入密码。如果安装成功，将会出现如下内容：

```text
Rust is installed now. Great!
```

另外，你还需要一个 *链接器（linker）*，它是 Rust 用来将编译输出连接成单个文件的程序。你很可能已经安装了它。如果遇到链接器错误，你应该安装一个 C 编译器，其中通常会包含链接器。C 编译器本身也很有用，因为一些常见的 Rust 包依赖 C 代码，因此需要 C 编译器。

在 macOS 上，你可以通过运行以下命令获得 C 语言编译器：

```console
$ xcode-select --install
```

Linux 用户通常应根据自己发行版（distribution）的文档安装 GCC 或 Clang。比如，如果你使用 Ubuntu，可以安装 `build-essential` 包。

### 在 Windows 上安装 `rustup`

在 Windows 上，前往 [https://www.rust-lang.org/tools/install][install] 并按照说明安装 Rust。在安装过程中的某一步，你会被提示安装 Visual Studio。它提供了链接器以及编译程序所需的本地库。如果你在这一步需要更多帮助，请访问 [https://rust-lang.github.io/rustup/installation/windows-msvc.html][msvc]。

本书的余下部分会使用能同时运行于 *cmd.exe* 和 PowerShell 的命令。如果存在特定差异，我们会解释使用哪一个。

### 故障排除（Troubleshooting）

要检查 Rust 是否安装正确，打开 shell 并输入：

```console
$ rustc --version
```

你应该会看到已发布的最新稳定版的版本号、commit hash 和 commit 日期，格式如下：

```text
rustc x.y.z (abcabcabc yyyy-mm-dd)
```

如果看到了这些信息，就说明 Rust 已经安装成功了！如果没有看到，请按下面的方法检查 Rust 是否在你的 `%PATH%` 系统变量中。

在 Windows CMD 中，请使用命令：

```console
> echo %PATH%
```

在 PowerShell 中，请使用命令：

```powershell
> echo $env:Path
```

在 Linux 和 macOS 中，请使用命令：

```console
$ echo $PATH
```

如果这些都没问题但 Rust 仍然无法使用，还有很多地方可以求助。你可以在[社区页面][community]查看如何联系其他 Rustaceans（Rust 用户对自己的一个戏称）。

## 更新与卸载

通过 `rustup` 安装 Rust 之后，更新到新发布的版本很简单。只需要在 shell 中运行下面的更新脚本：

```console
$ rustup update
```

若要卸载 Rust 和 `rustup`，请在 shell 中运行下面的卸载脚本：

```console
$ rustup self uninstall
```

### 本地文档

安装 Rust 时也会附带一份文档的本地副本，供你离线阅读。运行 `rustup doc` 即可在浏览器中打开本地文档。

任何时候，如果标准库提供了某个类型或函数，而你不确定它是做什么的或该如何使用，请查阅应用程序接口（application programming interface，API）文档！


### 文本编辑器和集成开发环境（Integrated Development Environments, IDE）

本书不假设你使用什么工具来编写 Rust 代码。几乎任何文本编辑器都能胜任！不过，许多文本编辑器和集成开发环境（IDE）都内置了对 Rust 的支持。你总是可以在 Rust 官网的[工具页面][tools]找到一个相对较新的常见编辑器和 IDE 列表。

### 离线使用本书

在一些示例中，我们会使用标准库之外的 Rust 包。要运行这些示例，你需要保持网络连接，或者提前下载好这些依赖。要预先下载依赖，可以运行以下命令。（稍后我们会详细解释 `cargo` 是什么，以及这些命令分别有什么作用。）

```console
$ cargo new get-dependencies
$ cd get-dependencies
$ cargo add rand@0.8.5 trpl@0.2.0
```

这会把这些包下载并缓存起来，因此之后你就不需要再次下载它们了。运行完这些命令后，你无需保留 `get-dependencies` 文件夹。只要你执行过这些命令，在本书后续所有的 `cargo` 命令中，都可以使用 `--offline` 参数来使用这些已缓存的版本，而不必尝试联网。

[otherinstall]: https://forge.rust-lang.org/infra/other-installation-methods.html
[install]: https://www.rust-lang.org/tools/install
[msvc]: https://rust-lang.github.io/rustup/installation/windows-msvc.html
[community]: https://www.rust-lang.org/community
[tools]: https://www.rust-lang.org/tools
