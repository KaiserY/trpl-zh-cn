## 将错误信息输出到标准错误而不是标准输出

> [ch12-06-writing-to-stderr-instead-of-stdout.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-06-writing-to-stderr-instead-of-stdout.md)
> <br>
> commit 1fe78a83f37ecc69b840fdc8dcfc727f88a3a3d4

目前为止，我们将所有的输出都 `println!` 到了终端。大部分终端都提供了两种输出：**标准输出**（*standard output*，`stdout`）对应通用信息，**标准错误**（*standard error*，`stderr`）则用于错误信息。这种区别允许用户选择将程序正常输出定向到一个文件中并仍将错误信息打印到屏幕上。

但是 `println!` 函数只能够打印到标准输出，所以我们必需使用其他方法来打印到标准错误。

### 检查错误应该写入何处

首先，让我们观察一下目前 `minigrep` 打印的所有内容都被写入了标准输出，包括应该被写入标准错误的错误信息。可以通过将标准输出流重定向到一个文件同时有意产生一个错误来做到这一点。我们没有重定向标准错误流，所以任何发送到标准错误的内容将会继续显示在屏幕上。

命令行程序被期望将错误信息发送到标准错误流，这样即便选择将标准输出流重定向到文件中时仍然能看到错误信息。目前我们的程序并不符合期望；相反我们将看到它将错误信息输出保存到了文件中。

展示这种行为的方式是通过 `>` 和文件名 *output.txt* 来与运行程序，这个文件是期望重定向标准输出流的位置。并不传递任何参数应该会产生一个错误：

```text
$ cargo run > output.txt
```

`>` 语法告诉 shell 将标准输出的内容写入到 *output.txt* 文件中而不是屏幕上。我们并没有看到期望的错误信息打印到屏幕上，所以这意味着它一定被写入了文件中。如下是 *output.txt* 所包含的：

```text
Problem parsing arguments: not enough arguments
```

是的，错误信息被打印到了标准输出中。像这样的错误信息被打印到标准错误中将有用的多，并在重定向标准输出时只将成功运行的信息写入文件。我们将改变他们。

### 将错误打印到标准错误

让我们如示例 12-24 所示的代码改变错误信息是如何被打印的。得益于本章早些时候的重构，所有打印错误信息的代码都位于 `main` 一个函数中。标准库提供了 `eprintln!` 宏来打印到标准错误流，所以将两个调用 `println!` 打印错误信息的位置替换为 `eprintln!`：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {}", err);
        process::exit(1);
    });

    if let Err(e) = minigrep::run(config) {
        eprintln!("Application error: {}", e);

        process::exit(1);
    }
}
```

<span class="caption">示例 12-24：使用 `eprintln!` 将错误信息写入标准错误而不是标准输出</span>

将 `println!` 改为 `eprintln!` 之后，让我们再次尝试用同样的方式运行程序，不使用任何参数并通过 `>` 重定向标准输出：

```text
$ cargo run > output.txt
Problem parsing arguments: not enough arguments
```

现在我们看到了屏幕上的错误信息，同时 `output.txt` 里什么也没有，这正是命令行程序所期望的行为。

如果使用不会造成错误的参数再次运行程序，不过仍然将标准输出重定向到一个文件，像这样：

```text
$ cargo run to poem.txt > output.txt
```

我们并不会在终端看到任何输出，同时 `output.txt` 将会包含其结果：

<span class="filename">文件名: output.txt</span>

```text
Are you nobody, too?
How dreary to be somebody!
```

这一部分展示了现在我们适当的使用了成功时产生的标准输出和错误时产生的标准错误。

## 总结

在这一章中，我们回顾了目前为止的一些主要章节并涉及了如何在 Rust 环境中进行常规的 I/O 操作。通过使用命令行参数、文件、环境变量和打印错误的 `eprintln!` 宏，现在你已经准备好编写命令行程序了。通过结合前几章的知识，你的代码将会是组织良好的，并能有效的将数据存储到合适的数据结构中、更好的处理错误，并且还是经过良好测试的。

接下来，让我们探索一些 Rust 中受函数式编程语言影响的功能：闭包和迭代器。