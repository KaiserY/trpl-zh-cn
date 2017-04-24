## 测试库的功能

> [ch12-04-testing-the-librarys-functionality.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-04-testing-the-librarys-functionality.md)
> <br>
> commit b8e4fcbf289b82c12121b282747ce05180afb1fb

现在我们将逻辑提取到了 *src/lib.rs* 并将所有的参数解析和错误处理留在了 *src/main.rs* 中，为代码的核心功能编写测试将更加容易。我们可以直接使用多种参数调用函数并检查返回值而无需从命令行运行二进制文件了。

在这一部分，我们将遵循测试驱动开发（Test Driven Development, TTD）的模式。这是一个软件开发技术，它遵循如下步骤：

1. 编写一个会失败的测试，并运行它以确保其因为你期望的原因失败。
2. 编写或修改刚好足够的代码来使得新的测试通过。
3. 重构刚刚增加或修改的代码，并确保测试仍然能通过。
4. 重复上述步骤！

这只是众多编写软件的方法之一，不过 TDD 有助于驱动代码的设计。在编写能使测试通过的代码之前编写测测试有助于在开发过程中保持高测试覆盖率。

我们将测试驱动实现`greprs`实际在文件内容中搜索查询字符串并返回匹配的行列表的部分。我们将在一个叫做`search`的函数中增加这些功能。

### 编写失败测试

首先，去掉 *src/lib.rs* 和 *src/main.rs* 中的`println!`语句，因为不再真的需要他们了。接着我们会像第十一章那样增加一个`test`模块和一个测试函数。测试函数指定了我们希望`search`函数拥有的行为：它会获取一个需要查询的字符串和用来查询的文本。列表 12-15 展示了这个测试：

<span class="filename">Filename: src/lib.rs</span>

```rust
# fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
#      vec![]
# }
#
#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(
            vec!["safe, fast, productive."],
            search(query, contents)
        );
    }
}
```

<span class="caption">Listing 12-15: Creating a failing test for the `search`
function we wish we had</span>

这里选择使用 "duct" 作为这个测试中需要搜索的字符串。用来搜索的文本有三行，其中只有一行包含 "duct"。我们断言`search`函数的返回值只包含期望的那一行。

我们还不能运行这个测试并看到它失败，因为它甚至都还不能编译！我们将增加足够的代码来使其能够编译：一个总是会返回空 vector 的`search`函数定义，如列表 12-16 所示。一旦有了它，这个测试应该能够编译并因为空 vector 并不匹配一个包含一行`"safe, fast, productive."`的 vector 而失败。

<span class="filename">Filename: src/lib.rs</span>

```rust
fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
     vec![]
}
```

<span class="caption">Listing 12-16: Defining just enough of the `search`
function that our test will compile</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

注意需要在`search`的签名中显式定义一个显式生命周期`'a`并用于`contents`参数和返回值。回忆一下第十章中生命周期参数指定哪个参数的生命周期与返回值的生命周期相关联。在这个例子中，我们表明返回的 vector 中应该包含引用参数`contents`（而不是参数`query`） slice 的字符串 slice。

换句话说，我们告诉 Rust 函数`search`返回的数据将与`search`函数中的参数`contents`的数据存在的一样久。这是非常重要的！为了使这个引用有效那么**被**slice 引用的数据也需要保持有效；如果编译器认为我们是在创建`query`而不是`contents`的字符串 slice，那么安全检查将是不正确的。

如果尝试不用生命周期编译的话，我们将得到如下错误：

```
error[E0106]: missing lifetime specifier
 --> src/lib.rs:5:47
  |
5 | fn search(query: &str, contents: &str) -> Vec<&str> {
  |                                               ^ expected lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the
  signature does not say whether it is borrowed from `query` or `contents`
```

Rust 不可能知道我们需要的是哪一个参数，所以需要告诉它。因为参数`contents`包含了所有的文本而且我们希望返回匹配的那部分文本，而我们知道`contents`是应该要使用生命周期语法来与返回值相关联的参数。

其他语言中并不需要你在函数签名中将参数与返回值相关联，所以这么做可能仍然感觉有些陌生，随着时间的推移会越来越容易。你可能想要将这个例子与第十章中生命周期语法部分做对比。

现在试尝试运行测试：

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

好的，测试失败了，这正是我们所期望的。修改代码来让测试通过吧！

### 编写使测试通过的代码

目前测试之所以会失败是因为我们总是返回一个空的 vector。为了修复并实现`search`，我们的程序需要遵循如下步骤：

1. 遍历每一行文本。
2. 查看这一行是否包含要搜索的字符串。
    * 如果有，将这一行加入返回列表中。
    * 如果没有，什么也不做。
3. 返回匹配到的列表

让我们一步一步的来，从遍历每行开始。

#### 使用`lines`方法遍历每一行

Rust 有一个有助于一行一行遍历字符串的方法，出于方便它被命名为`lines`，它如列表 12-17 这样工作：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}
```

<span class="caption">Listing 12-17: Iterating through each line in
`contents`</span>

<!-- Will add wingdings in libreoffice /Carol -->

`lines`方法返回一个迭代器。第十三张会深入了解迭代器，不过我们已经在列表 3-6 中见过使用迭代器的方法，在那里使用了一个`for`循环和迭代器在一个集合的每一项上运行一些代码。

<!-- so what does `lines` do on its own, if we need to use it in a for loop to
work? -->
<!-- It does nothing on its own, it returns an iterator for you to do something
with. Here, the thing we're doing with it is using it with a `for` loop. I'm
not sure exactly what you're asking or how to make the text clearer, but I
added a reference to where we've done this in the book previously. /Carol -->

#### 用查询字符串搜索每一行

接下来将会增加检查当前行是否包含查询字符串的功能。幸运的是，字符串类型为此也有一个有用的方法叫做`contains`！如列表 12-18 所示在`search`函数中加入`contains`方法：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}
```

<span class="caption">Listing 12-18: Adding functionality to see if the line
contains the string in `query`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

#### 存储匹配的行

最后我们需要一个方法来存储包含查询字符串的行。为此可以在`for`循环之前创建一个可变的 vector 并调用`push`方法在 vector 中存放一个`line`。在`for`循环之后，返回这个 vector，如列表 12-19 所示：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

<span class="caption">Listing 12-19: Storing the lines that match so that we
can return them</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

现在`search`函数应该返回只包含`query`的那些行，而测试应该会通过。让我们运行测试：

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

测试通过了，很好，它可以工作了！

现在测试通过了，我们可以考虑一下重构`search`的实现并时刻保持测试通过来保持其功能不变的机会了。这些代码并不坏，不过并没有利用迭代器的一些实用功能。第十三章将回到这个例子并深入探索迭代器并看看如何改进代码。

<!-- If we aren't going into this here, maybe just keep it focused, there's a
lot going on here as is -->
<!-- The reason we mention refactoring here is that it's a key step in the TDD
method that we were implicitly using before. Now that we've added text to the
beginning of this section to explicitly mention that we're doing TDD and what
the steps are, we want to address the "refactor" step. People who have some
experience with Rust might also look at this example and wonder why we're not
doing this in a different way, and be concerned that we're not teaching the
best way possible. This paragraph reassures them that we know what we're doing
and we're getting to the better way in Chapter 13. /Carol -->

#### 在`run`函数中使用`search`函数

现在`search`函数是可以工作并测试通过了的，我们需要实际在`run`函数中调用`search`。需要将`config.query`值和`run`从文件中读取的`contents`传递给`search`函数。接着`run`会打印出`search`返回的每一行：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
pub fn run(config: Config) -> Result<(), Box<Error>> {
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    for line in search(&config.query, &contents) {
        println!("{}", line);
    }

    Ok(())
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这里再一次使用了`for`循环获取了`search`返回的每一行，而对每一行运行的代码将他们打印了出来。

现在整个程序应该可以工作了！让我们试一试，首先使用一个只会在艾米莉·狄金森的诗中返回一行的单词 "frog"：

```
$ cargo run frog poem.txt
   Compiling greprs v0.1.0 (file:///projects/greprs)
    Finished debug [unoptimized + debuginfo] target(s) in 0.38 secs
     Running `target/debug/greprs frog poem.txt`
How public, like a frog
```

好的！接下来，像 "the" 这样会匹配多行的单词会怎么样呢：

```
$ cargo run the poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/greprs the poem.txt`
Then there's a pair of us — don't tell!
To tell your name the livelong day
```

最后，让我们确保搜索一个在诗中哪里都没有的单词时不会得到任何行，比如 "monomorphization"：

```
$ cargo run monomorphization poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/greprs monomorphization poem.txt`
```

非常好！我们创建了一个属于自己的经典工具，并学习了很多如何组织程序的知识。我们还学习了一些文件输入输出、生命周期、测试和命令行解析的内容。

现在如果你希望的话请随意移动到第十三章。为了使这个项目章节更丰满，我们将简要的展示如何处理环境变量和打印到标准错误，这两者在编写命令行程序时都很有用。