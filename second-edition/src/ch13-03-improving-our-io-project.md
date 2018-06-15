## 改进 I/O 项目

> [ch13-03-improving-our-io-project.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-03-improving-our-io-project.md)
> <br>
> commit 2bcb126815a381acc3d46b0d6fc382cb4c98fbc5

有了这些关于迭代器的新知识，我们可以使用迭代器来改进第十二章中 I/O 项目的实现来使得代码更简洁明了。让我们看看迭代器如何能够改进 `Config::new` 函数和 `search` 函数的实现。

### 使用迭代器并去掉 `clone`

在示例 12-6 中，我们增加了一些代码获取一个 `String` slice 并创建一个 `Config` 结构体的实例，他们索引 slice 中的值并克隆这些值以便 `Config` 结构体可以拥有这些值。在示例 13-24 中原原本本的重现了第十二章结尾示例 12-23 中 `Config::new` 函数的实现：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let filename = args[2].clone();

        let case_sensitive = env::var("CASE_INSENSITIVE").is_err();

        Ok(Config { query, filename, case_sensitive })
    }
}
```

<span class="caption">示例 13-24：重现第十二章结尾的 `Config::new` 函数</span>

这时可以不必担心低效的 `clone` 调用了，因为将来可以去掉他们。好吧，就是现在！

起初这里需要 `clone` 的原因是参数 `args` 中有一个 `String` 元素的 slice，而 `new` 函数并不拥有 `args`。为了能够返回 `Config` 实例的所有权，我们需要克隆 `Config` 中字段 `query` 和 `filename` 的值，这样 `Config` 实例就能拥有这些值。

通过迭代器的新知识，我们可以将 `new` 函数改为获取一个有所有权的迭代器作为参数而不是借用 slice。我们将使用迭代器功能之前检查 slice 长度和索引特定位置的代码。这会明确 `Config::new` 的工作因为迭代器会负责访问这些值。

一旦 `Config::new` 获取了迭代器的所有权并不再使用借用的索引操作，就可以将迭代器中的 `String` 值移动到 `Config` 中，而不是调用 `clone` 分配新的空间。

#### 直接使用 `env::args` 返回的迭代器

打开 I/O 项目的 *src/main.rs* 文件，它看起来应该像这样：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {}", err);
        process::exit(1);
    });

    // --snip--
}
```

我们会修改第十二章结尾示例 12-24 中的 `main` 函数的开头为示例 13-25 中的代码。直到同时更新 `Config::new` 这些代码还不能编译：

将他们改为如示例 13-25 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let config = Config::new(env::args()).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {}", err);
        process::exit(1);
    });

    // --snip--
}
```

<span class="caption">示例 13-25：将 `env::args` 的返回值传递给 `Config::new`</span>

`env::args` 函数返回一个迭代器！不同于将迭代器的值收集到一个 vector 中接着传递一个 slice 给 `Config::new`，现在我们直接将 `env::args` 返回的迭代器的所有权传递给 `Config::new`。

接下来需要更新 `Config::new` 的定义。在 I/O 项目的 *src/lib.rs* 中，将 `Config::new` 的签名改为如示例 13-26 所示。这仍然不能编译因为我们还需更新函数体：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
impl Config {
    pub fn new(mut args: std::env::Args) -> Result<Config, &'static str> {
        // --snip--
```

<span class="caption">示例 13-26：更新 `Config::new` 的签名来接受一个迭代器</span>

`env::args` 函数的标准库文档展示了其返回的迭代器类型是 `std::env::Args`。需要更新 `Config::new` 函数的签名中 `args` 参数的类型为 `std::env::Args` 而不是 `&[String]`。因为这里需要获取 `args` 的所有权且通过迭代改变 `args`，我们可以在 `args` 参数前指定 `mut` 关键字使其可变。

#### 使用 `Iterator` trait 方法代替索引

接下来修复 `Config::new` 的函数体。标准库文档也提到了 `std::env::Args` 实现了 `Iterator` trait，所以可以在其上调用 `next` 方法！示例 13-27 更新了示例 12-23 中的代码为使用 `next` 方法：

<span class="filename">文件名: src/lib.rs</span>

```rust
# use std::env;
#
# struct Config {
#     query: String,
#     filename: String,
#     case_sensitive: bool,
# }
#
impl Config {
    pub fn new(mut args: std::env::Args) -> Result<Config, &'static str> {
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file name"),
        };

        let case_sensitive = env::var("CASE_INSENSITIVE").is_err();

        Ok(Config { query, filename, case_sensitive })
    }
}
```

<span class="caption">示例 13-27：修改 `Config::new` 的函数体为使用迭代器方法</span>

请记住 `env::args` 返回值的第一个值是程序的名称。我们希望忽略它并获取下一个值，所以首先调用 `next` 并不对返回值做任何操作。之后对希望放入 `Config` 中字段 `query` 调用 `next`。如果 `next` 返回 `Some`，使用 `match` 来提取其值。如果它返回 `None`，则意味着没有提供足够的参数并通过 `Err` 值提早返回。对 `filename` 值进行同样的操作。

### 使用迭代器适配器来使代码更简明

I/O 项目中其他可以利用迭代器优势的地方位于 `search` 函数，在示例 13-28 中重现了第十二章结尾示例 12-19 中此函数的定义：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

<span class="caption">示例 13-28：第十二章结尾 `search` 函数的定义</span>

可以通过使用迭代器适配器方法来编写更短的代码。这也避免了一个可变的中间 `results` vector 的使用。函数式编程风格倾向于最小化可变状态的数量来使代码更简洁。去掉可变状态可能会使得将来进行并行搜索的增强变得更容易，因为我们不必管理 `results` vector 的并发访问。示例 13-29 展示了该变化：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents.lines()
        .filter(|line| line.contains(query))
        .collect()
}
```

<span class="caption">示例 13-29：在 `search` 函数实现中使用迭代器适配器</span>

回忆 `search` 函数的目的是返回所有 `contents` 中包含 `query` 的行。类似于示例 13-19 中的 `filter` 例子，可以使用 `filter` 适配器只保留 `line.contains(query)` 为真的那些行。接着使用 `collect` 将匹配行收集到另一个 vector 中。这样就容易多了！请随意对 `search_case_insensitive` 函数做出同样的使用迭代器方法的修改。

接下来的逻辑问题就是在代码中应该选择哪种风格：示例 13-28 中的原始实现，或者是示例 13-29 中使用迭代器的版本。大部分 Rust 程序员倾向于使用迭代器风格。开始这有点难以理解，不过一旦你对不同迭代器的工作方式有了感觉之后，迭代器可能会更容易理解。相比摆弄不同的循环并创建新 vector，（迭代器）代码则更关注循环的目的。这抽象出了那些老生常谈的代码，这样就更容易看清代码所特有的概念，比如迭代器中每个元素必须面对的过滤条件。

不过这两种实现真的完全等同吗？直觉上的假设是更底层的循环会更快一些。让我们聊聊性能吧。
