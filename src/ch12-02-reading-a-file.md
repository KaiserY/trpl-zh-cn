## 读取文件

[ch12-02-reading-a-file.md](https://github.com/rust-lang/book/blob/d7c0e477a22bcb37fdb290c6046058565d6738c2/src/ch12-02-reading-a-file.md)

现在我们要增加读取由 `file_path` 命令行参数指定的文件的功能。首先，需要一个用来测试的示例文件：我们会用一个拥有多行少量文本且有一些重复单词的文件。示例 12-3 是一首艾米莉·狄金森（Emily Dickinson）的诗，它正适合这个工作！在项目根目录创建一个文件 *poem.txt*，并输入诗 "I'm nobody! Who are you?"：

<span class="filename">文件名：poem.txt</span>

```text
{{#include ../listings/ch12-an-io-project/listing-12-03/poem.txt}}
```

<span class="caption">示例 12-3：艾米莉·狄金森的诗 “I’m nobody! Who are you?”，一个好的测试用例</span>

有了文本之后，编辑 *src/main.rs* 并添加读取文件的代码，如示例 12-4 所示：

<span class="filename">文件名：src/main.rs</span>

```rust,should_panic,noplayground
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-04/src/main.rs:here}}
```

<span class="caption">示例 12-4：读取第二个参数所指定的文件内容</span>

首先，我们增加了一个 `use` 语句来引入标准库中的相关部分：我们需要 `std::fs` 来处理文件。

在 `main` 中新增了一行语句：`fs::read_to_string` 接受 `file_path`，打开文件，接着返回包含其内容的 `std::io::Result<String>`。

在这些代码之后，我们再次增加了临时的 `println!` 打印出读取文件之后 `contents` 的值，这样就可以检查目前为止的程序能否工作。

尝试运行这些代码，随意指定一个字符串作为第一个命令行参数（因为还未实现搜索功能的部分）而将 *poem.txt* 文件将作为第二个参数：

```console
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-04/output.txt}}
```

太好了！这段代码读取并打印出了文件内容。不过这段代码还有几个缺点。目前 `main` 函数承担了多个职责，而一般来说，如果每个函数只负责一个概念，代码会更清晰，也更容易维护。另一个问题是，我们对错误的处理也还不够完善。虽然程序目前还很小，这些缺点还不算大问题，但随着程序变大，要干净地修复它们就会更困难。在开发程序时，尽早开始重构是一种良好实践，因为重构较少的代码总是更容易一些。接下来我们就这么做。
