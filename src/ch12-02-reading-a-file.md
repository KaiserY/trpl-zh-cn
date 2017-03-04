## 读取文件

> [ch12-02-reading-a-file.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-02-reading-a-file.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

现在有了一些包含我们需要的信息的变量了，让我们试着使用他们。下一步目标是打开需要搜索的文件。为此，我需要一个文件。在项目的根目录创建一个文件`poem.txt`，并写入一些艾米莉·狄金森（Emily Dickinson）的诗：

<span class="filename">Filename: poem.txt</span>

```
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us — don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

<!-- Public domain Emily Dickinson poem. This will work best with something
short, but that has multiple lines and some repetition. We could search through
code; that gets a bit meta and possibly confusing... Changes to this are most
welcome. /Carol -->

创建完这个文件后，让我们编辑 *src/main.rs* 并增加如列表 12-3 所示用来打开文件的代码：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
use std::env;
use std::fs::File;
use std::io::prelude::*;

fn main() {
    let args: Vec<String> = env::args().collect();

    let search = &args[1];
    let filename = &args[2];

    println!("Searching for {}", search);
    println!("In file {}", filename);

    let mut f = File::open(filename).expect("file not found");

    let mut contents = String::new();
    f.read_to_string(&mut contents).expect("something went wrong reading the file");

    println!("With text:\n{}", contents);
}
```

<figcaption>

Listing 12-3: Read the contents of the file specified by the second argument

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这里增加了一些新内容。首先，需要更多的`use`语句来引入标准库中的相关部分：我们需要`std::fs::File`来处理文件，而`std::io::prelude::*`则包含许多对于 I/O 包括文件 I/O 有帮助的 trait。类似于 Rust 有一个通用的 prelude 来自动引入特定内容，`std::io`也有其自己的 prelude 来引入处理 I/O 时需要的内容。不同于默认的 prelude，必须显式`use`位于`std::io`中的 prelude。

在`main`中，我们增加了三点内容：第一，我们获取了文件的句柄并使用`File::open`函数与第二个参数中指定的文件名来打开这个文件。第二，我们在变量`contents`中创建了一个空的可变的`String`，接着对文件句柄调用`read_to_string`并以`contents`字符串作为参数，`contents`是`read_to_string`将会放置它读取到的数据地方。最后，我们打印出了整个文件的内容，这是一个确认目前为止的程序能够工作的方法。

尝试运行这些代码，随意指定第一个参数（因为还未实现搜索功能的部分）而将 *poem.txt* 文件将作为第二个参数：

```
$ cargo run the poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe the poem.txt`
Searching for the
In file poem.txt
With text:
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us — don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

好的！我们的代码可以工作了！然而，它还有一些瑕疵。因为程序还很小，这些瑕疵并不是什么大问题，不过随着程序功能的丰富，将会越来越难以用简单的方法修复他们。现在就让我们开始重构而不是等待之后处理。重构在只有少量代码时会显得容易得多。