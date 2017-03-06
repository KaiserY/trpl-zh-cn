## 测试库的功能

> [ch12-04-testing-the-librarys-functionality.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-04-testing-the-librarys-functionality.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

现在为项目的核心功能编写测试将更加容易，因为我们将逻辑提取到了 *src/lib.rs* 中并将参数解析和错误处理都留在了 *src/main.rs* 里。现在我们可以直接使用多种参数调用代码并检查返回值而不用从命令行运行二进制文件了。

我们将要编写的是一个叫做`grep`的函数，它获取要搜索的项以及文本并产生一个搜索结果列表。让我们从`run`中去掉那行`println!`（也去掉 *src/main.rs* 中的，因为再也不需要他们了），并使用之前收集的选项来调用新的`grep`函数。眼下我们只增加一个空的实现，和指定`grep`期望行为的测试。当然，这个测试对于空的实现来说是会失败的，不过可以确保代码是可以编译的并得到期望的错误信息。列表 12-14 展示了这些修改：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
# use std::error::Error;
# use std::fs::File;
# use std::io::prelude::*;
#
# pub struct Config {
#     pub search: String,
#     pub filename: String,
# }
#
// ...snip...

fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
     vec![]
}

pub fn run(config: Config) -> Result<(), Box<Error>>{
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    grep(&config.search, &contents);

    Ok(())
}

#[cfg(test)]
mod test {
    use grep;

    #[test]
    fn one_result() {
        let search = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(
            vec!["safe, fast, productive."],
            grep(search, contents)
        );
    }
}
```

<figcaption>

Listing 12-14: Creating a function where our logic will go and a failing test
for that function

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

注意需要在`grep`的签名中显式声明声明周期`'a`并用于`contents`参数和返回值。记住，生命周期参数用于指定函数参数于返回值的生命周期的关系。在这个例子中，我们表明返回的 vector 将包含引用参数`contents`的字符串 slice，而不是引用参数`search`的字符串 slice。换一种说法就是我们告诉 Rust 函数`grep`返回的数据将和传递给它的参数`contents`的数据存活的同样久。这是非常重要的！考虑为了使引用有效则 slice 引用的数据也需要保持有效，如果编译器认为我们是在创建`search`而不是`contents`的 slice，那么安全检查将是不正确的。如果尝试不用生命周期编译的话，我们将得到如下错误：

```
error[E0106]: missing lifetime specifier
  --> src\lib.rs:37:46
   |
37 | fn grep(search: &str, contents: &str) -> Vec<&str> {
   |                                              ^ expected lifetime parameter
   |
   = help: this function's return type contains a borrowed value, but the
	   signature does not say whether it is borrowed from `search` or
           `contents`
```

Rust 不可能知道我们需要的是哪一个参数，所以需要告诉它。因为参数`contents`包含了所有的文本而且我们希望返回匹配的那部分文本，而我们知道`contents`是应该要使用生命周期语法来与返回值相关联的参数。

在函数签名中将参数与返回值相关联是其他语言不会让你做的工作，所以不用担心这感觉很奇怪！掌握如何指定生命周期会随着时间的推移越来越容易，熟能生巧。你可能想要重新阅读上一部分或返回与第十章中生命周期语法部分的例子做对比。

现在试试运行测试：

```
$ cargo test
...warnings...
    Finished debug [unoptimized + debuginfo] target(s) in 0.43 secs
     Running target/debug/deps/greprs-abcabcabc

running 1 test
test test::one_result ... FAILED

failures:

---- test::one_result stdout ----
	thread 'test::one_result' panicked at 'assertion failed: `(left == right)`
(left: `["safe, fast, productive."]`, right: `[]`)', src/lib.rs:16
note: Run with `RUST_BACKTRACE=1` for a backtrace.


failures:
    test::one_result

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured

error: test failed
```

好的，测试失败了，这正是我们所期望的。修改代码来让测试通过吧！之所以会失败是因为我们总是返回一个空的 vector。如下是如何实现`grep`的步骤：

1. 遍历每一行文本。
2. 查看这一行是否包含要搜索的字符串。
    * 如果有，将这一行加入返回列表中
    * 如果没有，什么也不做
3. 返回匹配到的列表

让我们一步一步的来，从遍历每行开始。字符串类型有一个有用的方法来处理这种情况，它刚好叫做`lines`：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}
```

<!-- Will add wingdings in libreoffice /Carol -->

我们使用了一个`for`循环和`lines`方法来依次获得每一行。接下来，让我们看看这些行是否包含要搜索的字符串。幸运的是，字符串类型为此也有一个有用的方法`contains`！`contains`的用法看起来像这样：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(search) {
            // do something with line
        }
    }
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

最终，我们需要一个方法来存储包含要搜索字符串的行。为此可以在`for`循环之前创建一个可变的 vector 并调用`push`方法来存放一个`line`。在`for`循环之后，返回这个 vector。列表 12-15 中为完整的实现：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
fn grep<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(search) {
            results.push(line);
        }
    }

    results
}
```

<figcaption>

Listing 12-15: Fully functioning implementation of the `grep` function

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

尝试运行一下：


```
$ cargo test
running 1 test
test test::one_result ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

     Running target/debug/greprs-2f55ee8cd1721808

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests greprs

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

非常好！它可以工作了。现在测试通过了，我们可以考虑一下重构`grep`的实现并时刻保持其功能不变。这些代码并不坏，不过并没有利用迭代器的一些实用功能。第十三章将回到这个例子并探索迭代器和如何改进代码。

现在`grep`函数是可以工作的，我们还需在在`run`函数中做最后一件事：还没有打印出结果呢！增加一个`for`循环来打印出`grep`函数返回的每一行：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
pub fn run(config: Config) -> Result<(), Box<Error>> {
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    for line in grep(&config.search, &contents) {
        println!("{}", line);
    }

    Ok(())
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

现在程序应该能正常运行了！试试吧：

```
$ cargo run the poem.txt
   Compiling greprs v0.1.0 (file:///projects/greprs)
    Finished debug [unoptimized + debuginfo] target(s) in 0.38 secs
     Running `target\debug\greprs.exe the poem.txt`
Then there's a pair of us - don't tell!
To tell your name the livelong day

$ cargo run a poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe a poem.txt`
I'm nobody! Who are you?
Then there's a pair of us - don't tell!
They'd banish us, you know.
How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

好极了！我们创建了一个属于自己的经典工具，并学习了很多如何组织程序的知识。我们还学习了一些文件输入输出、生命周期、测试和命令行解析的内容。