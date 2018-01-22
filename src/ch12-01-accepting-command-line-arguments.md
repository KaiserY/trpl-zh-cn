## 接受命令行参数

> [ch12-01-accepting-command-line-arguments.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-01-accepting-command-line-arguments.md)
> <br>
> commit 97e60b3cb623d4a5b85419212b085ade8a11cbe1

一如之前使用 `cargo new` 新建一个项目。我们称之为 `minigrep` 以便与可能已经安装在系统上的`grep`工具相区别：

```text
$ cargo new --bin minigrep
     Created binary (application) `minigrep` project
$ cd minigrep
```

第一个任务是让 `minigrep` 能够接受两个命令行参数：文件名和要搜索的字符串。也就是说我们希望能够使用 `cargo run`、要搜索的字符串和被搜索的文件的路径来运行程序，像这样：

```text
$ cargo run searchstring example-filename.txt
```

现在 `cargo new` 生成的程序忽略任何传递给它的参数。[Crates.io](https://crates.io/) 上有一些现成的库可以帮助我们接受命令行参数，不过因为正在学习，让我们自己来实现一个。

### 读取参数值

为了确保 `minigrep` 能够获取传递给它的命令行参数的值，我们需要一个 Rust 标准库提供的函数，也就是 `std::env::args`。这个函数返回一个传递给程序的命令行参数的 **迭代器**（*iterator*）。我们还未讨论到迭代器（第十三章会全面的介绍他们），但是现在只需理解迭代器的两个细节：迭代器生成一系列的值，可以在迭代器上调用 `collect` 方法将其转换为一个集合，比如包含所有迭代器产生元素的 vector。

使用示例 12-1 中的代码来读取任何传递给 `minigrep` 的命令行参数并将其收集到一个 vector 中。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
```


<span class="caption">示例 12-1：将命令行参数收集到一个 vector 中并打印出来</span>

首先使用 `use` 语句来将 `std::env` 模块引入作用域以便可以使用它的 `args` 函数。注意 `std::env::args` 函数被嵌套进了两层模块中。正如第七章讲到的，当所需函数嵌套了多于一层模块时，通常将父模块引入作用域，而不是其自身。这便于我们利用 `std::env` 中的其他函数。这比增加了 `use std::env::args;` 后仅仅使用 `args` 调用函数要更明确一些，因为 `args` 容易被错认成一个定义于当前模块的函数。

> ### `args` 函数和无效的 Unicode
>
> 注意 `std::env::args` 在其任何参数包含无效 Unicode 字符时会 panic。如果你需要接受包含无效 Unicode 字符的参数，使用 `std::env::args_os` 代替。这个函数返回 `OsString` 值而不是 `String` 值。这里出于简单考虑使用了 `std::env::args`，因为 `OsString` 值每个平台都不一样而且比 `String` 值处理起来更为复杂。

在 `main` 函数的第一行，我们调用了 `env::args`，并立即使用 `collect` 来创建了一个包含迭代器所有值的 vector。`collect` 可以被用来创建很多类型的集合，所以这里显式注明 `args` 的类型来指定我们需要一个字符串 vector。虽然在 Rust 中我们很少会需要注明类型，`collect` 就是一个经常需要注明类型的函数，因为 Rust 不能推断出你想要什么类型的集合。

最后，我们使用调试格式 `:?` 打印出 vector。让我们尝试不用参数运行代码，接着用两个参数：

```text
$ cargo run
--snip--
["target/debug/minigrep"]

$ cargo run needle haystack
--snip--
["target/debug/minigrep", "needle", "haystack"]
```

注意 vector 的第一个值是 `"target/debug/minigrep"`，它是我们二进制文件的名称。这与 C 中的参数列表的行为相符合，并使得程序可以在执行过程中使用它的名字。能够访问程序名称在需要在信息中打印时，或者需要根据执行程序所使用的命令行别名来改变程序行为时显得很方便，不过考虑到本章的目的，我们将忽略它并只保存所需的两个参数。

### 将参数值保存进变量

打印出参数 vector 中的值展示了程序可以访问指定为命令行参数的值。现在需要将这两个参数的值保存进变量这样就可以在程序的余下部分使用这些值了。让我们如示例 12-2 这样做：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let filename = &args[2];

    println!("Searching for {}", query);
    println!("In file {}", filename);
}
```

<span class="caption">示例 12-2：创建变量来存放查询参数和文件名参数</span>

正如之前打印出 vector 时所所看到的，程序的名称占据了 vector 的第一个值 `args[0]`，所以我们从索引 `1` 开始。`minigrep` 获取的第一个参数是需要搜索的字符串，所以将其将第一个参数的引用存放在变量 `query` 中。第二个参数将是文件名，所以将第二个参数的引用放入变量 `filename` 中。

我们将临时打印出这些变量的值来证明代码如我们期望的那样工作。使用参数 `test` 和 `sample.txt` 再次运行这个程序：

```text
$ cargo run test sample.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/minigrep test sample.txt`
Searching for test
In file sample.txt
```

好的，它可以工作！我们将所需的参数值保存进了对应的变量中。之后会增加一些错误处理来应对类似用户没有提供参数的情况，不过现在我们将忽略他们并开始增加读取文件功能。
