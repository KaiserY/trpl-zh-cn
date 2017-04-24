## 输出到`stderr`而不是`stdout`

> [ch12-06-writing-to-stderr-instead-of-stdout.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-06-writing-to-stderr-instead-of-stdout.md)
> <br>
> commit d09cfb51a239c0ebfc056a64df48fe5f1f96b207

目前为止，我们将所有的输出都`println!`到了终端。大部分终端都提供了两种输出：“标准输出”对应大部分信息，而“标准错误”则用于错误信息。这种区别是命令行程序所期望拥有的行为：例如它允许用户选择将程序正常输出定向到一个文件中并仍将错误信息打印到屏幕上。但是`println!`只能够打印到标准输出，所以我们必需使用其他方法来打印到标准错误。

我们可以验证，目前所编写的`greprs`，所有内容都被打印到了标准输出，包括应该被写入标准错误的错误信息。可以通过故意造成错误来做到这一点，一个发生这种情况的方法是不使用任何参数运行程序。我们准备将标准输出重定向到一个文件中，不过不是标准错误。命令行程序期望以这种方式工作，因为如果输出是错误信息，它应该显示在屏幕上而不是被重定向到文件中。可以看出我们的程序目前并没有满足这个期望，通过使用`>`并指定一个文件名，*output.txt*，这是期望将标注输出重定向的文件：

```
$ cargo run > output.txt
```

<!-- why do we get an error here? Was that intentional? Does that mean it can't
print stdout to a file? -->
<!-- Yes, we're intentionally causing an error here to show that errors are
currently going to the wrong place. It's showing that `println!` only prints
to standard out, even when we're printing error messages that should go
to standard error. /Carol-->

`>`语法告诉 shell 将标准输出的内容写入到 *output.txt* 文件中而不是打印到屏幕上。我们并没有看到期望的错误信息打印到屏幕上，所以这意味着它一定被写入了文件中。让我们看看 *output.txt* 包含什么：

```
Application error: No search string or filename found
```

<!-- I don't understand why we send this output to a file to then just say we
want it to the screen, won't it do that by default? And what has this got to do
with our use of println? I'm finding the motives here hard to follow -->
<!-- The point of showing this is to demonstrate that our program is NOT doing
the correct thing by default, we need to change the places we're calling
`println!` with error messages to print to standard error instead. When to use
stdout vs. stderr, and why you might want to redirect stdout but not stderr,
is something our readers will be familiar with. /Carol -->

是的，这就是错误信息，这意味着它被打印到了标准输出。这并不是命令行程序所期望拥有的。像这样的错误信息被打印到标准错误，并当以这种方式重定向标注输出时只将运行成功时的数据打印到文件中。让我们像列表 12-23 所示改变错误信息如何被打印的。因为本章早些时候的进行的重构，所有打印错误信息的代码都在一个位置，在`main`中：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern crate greprs;

use std::env;
use std::process;
use std::io::prelude::*;

use greprs::Config;

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut stderr = std::io::stderr();

    let config = Config::new(&args).unwrap_or_else(|err| {
        writeln!(
            &mut stderr,
            "Problem parsing arguments: {}",
            err
        ).expect("Could not write to stderr");
        process::exit(1);
    });

    if let Err(e) = greprs::run(config) {
        writeln!(
            &mut stderr,
            "Application error: {}",
            e
        ).expect("Could not write to stderr");

        process::exit(1);
    }
}
```

<span class="caption">Listing 12-23: Writing error messages to `stderr` instead
of `stdout` using `writeln!`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

Rust 并没有类似`println!`这样的方便写入标准错误的函数。相反，我们使用`writeln!`宏，它有点像`println!`，不过它获取一个额外的参数。第一个参数是希望写入内容的位置。可以通过`std::io::stderr`函数获取一个标准错误的句柄。我们将一个`stderr`的可变引用传递给`writeln!`；它需要是可变的因为这样才能写入信息！第二个和第三个参数就像`println!`的第一个和第二参数：一个格式化字符串和任何需要插入的变量。

再次用相同方式运行程序，不带任何参数并用`>`重定向`stdout`：

```
$ cargo run > output.txt
Application error: No search string or filename found
```

现在我们看到了屏幕上的错误信息，不过`output.txt`里什么也没有，这也就是命令行程序所期望的行为。

如果使用不会造成错误的参数再次运行程序，不过仍然将标准输出重定向到一个文件：

```
$ cargo run to poem.txt > output.txt
```

我们并不会在终端看到任何输出，同时`output.txt`将会包含其结果：

<span class="filename">Filename: output.txt</span>

```
Are you nobody, too?
How dreary to be somebody!
```

这一部分展示了现在我们使用的成功时产生的标准输出和错误时产生的标准错误是恰当的。

## 总结

在这一章中，我们回顾了目前为止的一些主要章节并涉及了如何在 Rust 中进行常规的 I/O 操作。通过使用命令行参数、文件、环境变量和`writeln!`宏与`stderr`，现在你已经准备好编写命令行程序了。结合前几章的知识，你的代码将会是组织良好的，并能有效的将数据存储到合适的数据结构中、更好的处理错误，并且还是经过良好测试的。

接下来，让我们探索如何利用一些 Rust 中受函数式编程语言影响的功能：闭包和迭代器。