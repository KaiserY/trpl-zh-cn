## 接受命令行参数

> [ch12-01-accepting-command-line-arguments.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-01-accepting-command-line-arguments.md)
> <br>
> commit b8e4fcbf289b82c12121b282747ce05180afb1fb

第一个任务是让`greprs`能够接受两个命令行参数：文件名和要搜索的字符串。也就是说希望能够使用`cargo run`，要搜索的字符串和被搜索的文件的路径来运行程序，像这样：

```
$ cargo run searchstring example-filename.txt
```

现在`cargo new`生成的程序忽略任何传递给它的参数。crates.io 上有一些现存的可以帮助我们接受命令行参数的库，不过因为我们正在学习，让我们实现一个。

<!--Below -- I'm not clear what we need the args function for, yet, can you set
it out more concretely? Otherwise, will it make more sense in context of the
code later? Is this function needed to allow our function to accept arguments,
is that was "args" is for? -->
<!-- We mentioned in the intro to this chapter that grep takes as arguments a
filename and a string. I've added an example of how we want to run our
resulting tool and what we want the behavior to be, please let me know if this
doesn't clear it up. /Carol-->

### 读取参数值

为了能够获取传递给程序的命令行参数的值，我们需要调用一个 Rust 标准库提供的函数：`std::env::args`。这个函数返回一个传递给程序的命令行参数的**迭代器**（*iterator*）。我们还未讨论到迭代器，第十三章会全面的介绍他们。但是对于我们现在的目的来说只需要明白两点：

1. 迭代器生成一系列的值。
2. 在迭代器上调用`collect`方法可以将其生成的元素转换为一个 vector。

让我们尝试一下：使用列表 12-1 中的代码来读取任何传递给`greprs`的命令行参数并将其收集到一个 vector 中。

<!-- Give what a try, here, what are we making? Can you lay that out? I've
tried above but I'm not sure it's complete -->
<!-- We're not creating anything, we're just reading. I'm not sure if I've made
this clearer. /Carol -->

<span class="filename">Filename: src/main.rs</span>

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
```

Listing 12-1: Collect the command line arguments into a vector and print them
out

<!-- Will add wingdings in libreoffice /Carol -->

首先使用`use`语句来将`std::env`模块引入作用域以便可以使用它的`args`函数。注意`std::env::args`函数嵌套进了两层模块中。如第七章讲到的，当所需函数嵌套了多于一层模块时，通常将父模块引入作用域，而不是其自身。这便于我们利用`std::env`中的其他函数。这比增加了`use std::env::args;`后仅仅使用`args`调用函数要更明确一些；这样看起来好像一个定义于当前模块的函数。

<!-- We realized that we need to add the following caveat to fully specify
the behavior of `std::env::args` /Carol -->

<!-- PROD: START BOX -->

> 注意：`std::env::args`在其任何参数包含无效 Unicode 字符时会 panic。如果你需要接受包含无效 Unicode 字符的参数，使用`std::env::args_os`代替。这个函数返回`OsString`值而不是`String`值。出于简单考虑这里使用`std::env::args`，因为`OsString`值每个平台都不一样而且比`String`值处理起来更复杂。

<!-- PROD: END BOX -->

<!--what is it we're making into a vector here, the arguments we pass?-->
<!-- The iterator of the arguments. /Carol -->

在`main`函数的第一行，我们调用了`env::args`，并立即使用`collect`来创建了一个包含迭代器所有值的 vector。`collect`可以被用来创建很多类型的集合，所以这里显式注明的`args`类型来指定我们需要一个字符串 vector。虽然在 Rust 中我们很少会需要注明类型，`collect`就是一个经常需要注明类型的函数，因为 Rust 不能推断出你想要什么类型的集合。

最后，我们使用调试格式`:?`打印出 vector。让我们尝试不用参数运行代码，接着用两个参数：

```
$ cargo run
["target/debug/greprs"]

$ cargo run needle haystack
...snip...
["target/debug/greprs", "needle", "haystack"]
```

<!--Below --- This initially confused me, do you mean that the argument at
index 0 is taken up by the name of the binary, so we start arguments at 1 when
setting them? It seems like it's something like that, reading on, and I've
edited as such, can you check? -->
<!-- Mentioning the indexes here seemed repetitive with the text after Listing
12-2. We're not "setting" arguments here, we're saving the value in variables.
I've hopefully cleared this up without needing to introduce repetition.
/Carol-->

你可能注意到了 vector 的第一个值是"target/debug/greprs"，它是二进制我呢见的名称。其原因超出了本章介绍的范围，不过需要记住的是我们保存了所需的两个参数。

### 将参数值保存进变量

打印出参数 vector 中的值仅仅展示了可以访问程序中指定为命令行参数的值。但是这并不是我们想要做的，我们希望将这两个参数的值保存进变量这样就可以在程序使用这些值。让我们如列表 12-2 这样做：

<!-- By 'find the ones we care about' did you mean set particular arguments so
the user knows what to enter? I'm a little confused about what we are doing,
I've tried to clarify above -->
<!-- We're incrementally adding features and adding some code that helps the
reader be able to see and experience what the code is doing rather than just
taking our word for it. I've hopefully clarified below. /Carol -->

<span class="filename">Filename: src/main.rs</span>

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

Listing 12-2: Create variables to hold the query argument and filename argument

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

正如我们在打印出 vector 时所看到的，程序的名称占据了 vector 的第一个值`args[0]`，所以我们从索引`1`开始。第一个参数`greprs`是需要搜索的字符串，所以将其将第一个参数的引用存放在变量`query`中。第二个参数将是文件名，所以将第二个参数的引用放入变量`filename`中。

我们将临时打印出出这些变量的值，再一次证明代码如我们期望的那样工作。让我们使用参数`test`和`sample.txt`再次运行这个程序：

```
$ cargo run test sample.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/greprs test sample.txt`
Searching for test
In file sample.txt
```

好的，它可以工作！我们将所需的参数值保存进了对应的变量中。之后会增加一些错误处理来应对类似用户没有提供参数的情况，不过现在我们将忽略他们并开始增加读取文件功能。
