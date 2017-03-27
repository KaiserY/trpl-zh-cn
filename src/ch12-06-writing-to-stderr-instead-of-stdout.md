## 输出到`stderr`而不是`stdout`

> [ch12-06-writing-to-stderr-instead-of-stdout.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-06-writing-to-stderr-instead-of-stdout.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

目前为止，我们将所有的输出都`println!`到了终端。这是可以的，不过大部分终端都提供了两种输出：“标准输出”对应大部分信息，而“标准错误”则用于错误信息。这使得处理类似于“将错误打印到终端而将其他信息输出到文件”的情况变得更容易。

可以通过在命令行使用`>`来将输出重定向到文件中，同时不使用任何参数运行来造成一个错误，就会发现我们的程序只能打印到`stdout`：

```
$ cargo run > output.txt
```

`>`语法告诉 shell 将标准输出的内容写入到 *output.txt* 文件中而不是打印到屏幕上。然而，如果运行命令后打开 *output.txt* 就会发现错误：

```
Problem parsing arguments: not enough arguments
```

我们希望这个信息被打印到屏幕上，而只有成功运行产生的输出写入到文件中。让我们如列表 12-17 中所示改变如何打印错误信息的方法：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern crate greprs;

use std::env;
use std::process;
use std::io::prelude::*;

use greprs::Config;

fn main() {
    let mut stderr = std::io::stderr();
    let args: Vec<String> = env::args().collect();

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

<span class="caption">Listing 12-17: Writing error messages to `stderr` instead
of `stdout`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

Rust 并没有类似`println!`这样的方便写入标准错误的函数。相反，我们使用`writeln!`宏，它有点像`println!`，不过它获取一个额外的参数。第一个参数是希望写入内容的位置。可以通过`std::io::stderr`函数获取一个标准错误的句柄。我们将一个`stderr`的可变引用传递给`writeln!`；它需要是可变的因为这样才能写入信息！第二个和第三个参数就像`println!`的第一个和第二参数：一个格式化字符串和任何需要插入的变量。

让我们再次用相同方式运行程序，不带任何参数并用 `>`重定向`stdout`：

```
$ cargo run > output.txt
Problem parsing arguments: not enough arguments
```

现在我们看到了屏幕上的错误信息，不过 `output.txt` 里什么也没有。如果我们使用正确的参数再次运行：

```
$ cargo run to poem.txt > output.txt
```

终端将没有输出，不过 `output.txt` 将会包含其结果：

<span class="filename">Filename: output.txt</span>

```
Are you nobody, too?
How dreary to be somebody!
```

## 总结

在这一章，我们涉及了如果在 Rust 中进行常规的 I/O 操作。通过使用命令行参数、文件、环境变量和写入`stderr`的功能。现在你已经准备好编写命令行程序了。结合前几章的知识，你的代码将会是组织良好的，并能有效的将数据存储到合适的数据结构中、更好的处理错误，并且还是经过良好测试的。我们也接触了一个真实情况下需要生命周期注解来保证引用一直有效的场景。

接下来，让我们探索如何利用一些 Rust 中受函数式编程语言影响的功能：闭包和迭代器。