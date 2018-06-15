## 读取文件

> [ch12-02-reading-a-file.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-02-reading-a-file.md)
> <br>
> commit 97e60b3cb623d4a5b85419212b085ade8a11cbe1

接下来我们将读取由命令行文件名参数指定的文件。首先，需要一个用来测试的示例文件——用来确保 `minigrep` 正常工作的最好的文件是拥有多行少量文本且有一些重复单词的文件。示例 12-3 是一首艾米莉·狄金森（Emily Dickinson）的诗，它正适合这个工作！在项目根目录创建一个文件 `poem.txt`，并输入诗 "I'm nobody! Who are you?"：

<span class="filename">文件名: poem.txt</span>

```text
I’m nobody! Who are you?
Are you nobody, too?
Then there’s a pair of us — don’t tell!
They’d banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

<span class="caption">示例 12-3：艾米莉·狄金森的诗 “I’m nobody! Who are you?”，一个好的测试用例</span>

创建完这个文件之后，修改 *src/main.rs* 并增加如示例 12-4 所示的打开文件的代码：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic
use std::env;
use std::fs::File;
use std::io::prelude::*;

fn main() {
#     let args: Vec<String> = env::args().collect();
#
#     let query = &args[1];
#     let filename = &args[2];
#
#     println!("Searching for {}", query);
    // --snip--
    println!("In file {}", filename);

    let mut f = File::open(filename).expect("file not found");

    let mut contents = String::new();
    f.read_to_string(&mut contents)
        .expect("something went wrong reading the file");

    println!("With text:\n{}", contents);
}
```

<span class="caption">示例 12-4：读取第二个参数所指定的文件内容</span>

首先，我们增加了更多的 `use` 语句来引入标准库中的相关部分：需要 `std::fs::File` 来处理文件，而 `std::io::prelude::*` 则包含许多对于 I/O 包括文件 I/O 有帮助的 trait。类似于 Rust 有一个通用的 prelude 来自动引入特定内容，`std::io` 也有其自己的 prelude 来引入处理 I/O 时所需的通用内容。不同于默认的 prelude，必须显式 `use` 位于 `std::io` 中的 prelude。

在 `main` 中，我们增加了三点内容：第一，通过传递变量 `filename` 的值调用 `File::open` 函数来获取文件的可变句柄。创建了叫做 `contents` 的变量并将其设置为一个可变的，空的 `String`。它将会存放之后读取的文件的内容。第三，对文件句柄调用 `read_to_string` 并传递 `contents` 的可变引用作为参数。

在这些代码之后，我们再次增加了临时的 `println!` 打印出读取文件后 `contents` 的值，这样就可以检查目前为止的程序能否工作。

尝试运行这些代码，随意指定一个字符串作为第一个命令行参数（因为还未实现搜索功能的部分）而将 *poem.txt* 文件将作为第二个参数：

```text
$ cargo run the poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/minigrep the poem.txt`
Searching for the
In file poem.txt
With text:
I’m nobody! Who are you?
Are you nobody, too?
Then there’s a pair of us — don’t tell!
They’d banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

好的！代码读取并打印出了文件的内容。虽然它还有一些瑕疵：`main` 函数有着多个职能，通常函数只负责一个功能的话会更简洁并易于维护。另一个问题是没有尽可能的处理错误。虽然我们的程序还很小，这些瑕疵并不是什么大问题，不过随着程序功能的丰富，将会越来越难以用简单的方法修复他们。在开发程序时，及早开始重构是一个最佳实践，因为重构少量代码时要容易的多，所以让我们现在就开始吧。
