## 接受命令行参数

> [ch12-01-accepting-command-line-arguments.md](https://github.com/rust-lang/book/blob/master/src/ch12-01-accepting-command-line-arguments.md)
> <br>
> commit 2d32840aae46d247250310219e8c7169c7349017

第一个任务是让`greprs`接受两个命令行参数。crates.io 上有一些现存的库可以帮助我们，不过因为我们正在学习，我们将自己实现一个。

我们需要调用一个 Rust 标准库提供的函数：`std::env::args`。这个函数返回一个传递给程序的命令行参数的**迭代器**（*iterator*）。我们还未讨论到迭代器，第十三章会全面的介绍他们。但是对于我们的目的来说，使用他们并不需要知道多少技术细节。我们只需要明白两点：

1. 迭代器生成一系列的值。
2. 在迭代器上调用`collect`方法可以将其生成的元素转换为一个 vector。

让我们试试列表 12-1 中的代码：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
```

<figcaption>

Listing 12-1: Collect the command line arguments into a vector and print them out

</figcaption>
</figure>

<!-- Will add wingdings in libreoffice /Carol -->

首先使用`use`语句来将`std::env`模块引入作用域。当函数嵌套了多于一层模块时，比如说`std::env::args`，通常使用`use`将父模块引入作用域，而不是引入其本身。`env::args`比单独的`args`要明确一些。当然，如果使用了多余一个`std::env`中的函数，我们也只需要一个`use`语句。

在`main`函数的第一行，我们调用了`env::args`，并立即使用`collect`来创建了一个 vector。这里我们也显式的注明了`args`的类型：`collect`可以被用来创建很多类型的集合。Rust 并不能推断出我们需要什么类型，所以类型注解是必须的。在 Rust 中我们很少会需要注明类型，不过`collect`是就一个通常需要这么做的函数。

最后，我们使用调试格式`:?`打印出 vector。让我们尝试不用参数运行代码，接着用两个参数：

```
$ cargo run
["target/debug/greprs"]

$ cargo run needle haystack
...snip...
["target/debug/greprs", "needle", "haystack"]
```

你会注意一个有趣的事情：二进制文件的名字是第一个参数。其原因超出了本章介绍的范围