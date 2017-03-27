## 接受命令行参数

> [ch12-01-accepting-command-line-arguments.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-01-accepting-command-line-arguments.md)
> <br>
> commit c49e5ee8859f8eb8f8867cbeafbdf5b802aa5894

第一个任务是让`greprs`接受两个命令行参数。crates.io 上有一些现存的库可以帮助我们，不过因为我们正在学习，我们将自己实现一个。

我们需要调用一个 Rust 标准库提供的函数：`std::env::args`。这个函数返回一个传递给程序的命令行参数的**迭代器**（*iterator*）。我们还未讨论到迭代器，第十三章会全面的介绍他们。但是对于我们的目的来说，使用他们并不需要知道多少技术细节。我们只需要明白两点：

1. 迭代器生成一系列的值。
2. 在迭代器上调用`collect`方法可以将其生成的元素转换为一个 vector。

让我们试试列表 12-1 中的代码：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
```

<span class="caption">Listing 12-1: Collect the command line arguments into a
vector and print them out</span>

<!-- Will add wingdings in libreoffice /Carol -->

首先使用`use`语句来将`std::env`模块引入作用域。当函数嵌套了多于一层模块时，比如说`std::env::args`，通常使用`use`将父模块引入作用域，而不是引入其本身。`env::args`比单独的`args`要明确一些。当然，如果使用了多于一个`std::env`中的函数时，我们也只需要一个`use`语句。

在`main`函数的第一行，我们调用了`env::args`，并立即使用`collect`来创建了一个 vector。这里我们也显式的注明了`args`的类型：`collect`可以被用来创建很多类型的集合。Rust 并不能推断出我们需要什么类型，所以类型注解是必须的。在 Rust 中我们很少会需要注明类型，不过`collect`是就一个通常需要这么做的函数。

最后，我们使用调试格式`:?`打印出 vector。让我们尝试不用参数运行代码，接着用两个参数：

```
$ cargo run
["target/debug/greprs"]

$ cargo run needle haystack
...snip...
["target/debug/greprs", "needle", "haystack"]
```

你会注意一个有趣的事情：二进制文件的名字是第一个参数。其原因超出了本章介绍的范围，不过这是我们必须记住的。

现在我们有了一个访问所有参数的方法，让我们如列表 12-2 中所示将需要的变量存放到变量中：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let search = &args[1];
    let filename = &args[2];

    println!("Searching for {}", search);
    println!("In file {}", filename);
}
```

<span class="caption">Listing 12-2: Create variables to hold the search
argument and filename argument</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

记住，程序名称是是第一个参数，所以并不需要`args[0]`。我们决定从第一个参数将是需要搜索的字符串，所以将第一个参数的引用放入变量`search`中。第二个参数将是文件名，将其放入变量`filename`中。再次尝试运行程序：

```
$ cargo run test sample.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe test sample.txt`
Searching for test
In file sample.txt
```

很棒！不过有一个问题。让我们不带参数运行：

```
$ cargo run
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe`
thread 'main' panicked at 'index out of bounds: the len is 1
but the index is 1', ../src/libcollections\vec.rs:1307
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

因为 vector 中只有一个元素，就是程序名称，不过我们尝试访问第二元素，程序 panic 并提示越界访问。虽然这个错误信息是_准确的_，不过它对程序的用户来说就没有意义了。现在就可以修复这个问题，不过我先继续学习别的内容：在程序结束前我们会改善这个情况。