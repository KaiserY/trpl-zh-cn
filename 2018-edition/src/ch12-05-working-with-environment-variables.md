## 处理环境变量

> [ch12-05-working-with-environment-variables.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-05-working-with-environment-variables.md)
> <br>
> commit 1fe78a83f37ecc69b840fdc8dcfc727f88a3a3d4

我们将增加一个额外的功能来改进 `minigrep`：一个通过环境变量启用的大小写不敏感搜索的选项。可以将其设计为一个命令行参数并要求用户每次需要时都加上它，不过相反我们将使用环境变量。这允许用户设置环境变量一次之后在整个终端会话中所有的搜索都将是大小写不敏感的。

### 编写一个大小写不敏感 `search` 函数的失败测试

我们希望增加一个新函数 `search_case_insensitive`，并将会在设置了环境变量时调用它。这里将继续遵循 TDD 过程，其第一步是再次编写一个失败测试。我们将为新的大小写不敏感搜索函数新增一个测试函数，并将老的测试函数从 `one_result` 改名为 `case_sensitive` 来更清楚的表明这两个测试的区别，如示例 12-20 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(
            vec!["safe, fast, productive."],
            search(query, contents)
        );
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

<span class="caption">示例 12-20：为准备添加的大小写不敏感函数新增失败测试</span>

注意我们也改变了老测试中 `contents` 的值。还新增了一个含有文本 "Duct tape" 的行，它有一个大写的 D，这在大小写敏感搜索时不应该匹配 "duct"。我们修改这个测试以确保不会意外破坏已经实现的大小写敏感搜索功能；这个测试现在应该能通过并在处理大小写不敏感搜索时应该能一直通过。

大小写 **不敏感** 搜索的新测试使用 "rUsT" 作为其查询字符串。在我们将要增加的 `search_case_insensitive` 函数中，“rUsT” 查询应该包含 “Rust:” 包含一个大写的 R 还有 “Trust me.” 这两行，即便他们与查询的大小写都不同。这个测试现在会编译失败因为还没有定义 `search_case_insensitive` 函数。请随意增加一个总是返回空 vector 的骨架实现，正如示例 12-16 中 `search` 函数为了使测试编译并失败时所做的那样。

### 实现 `search_case_insensitive` 函数

`search_case_insensitive` 函数，如示例 12-21 所示，将与 `search` 函数基本相同。唯一的区别是它会将 `query` 变量和每一 `line` 都变为小写，这样不管输入参数是大写还是小写，在检查该行是否包含查询字符串时都会是小写。

<span class="filename">文件名: src/lib.rs</span>

```rust
fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}
```

<span class="caption">示例 12-21：定义 `search_case_insensitive` 函数，它在比较查询和每一行之前将他们都转换为小写</span>

首先我们将 `query` 字符串转换为小写，并将其覆盖到同名的变量中。对查询字符串调用 `to_lowercase` 是必需的，这样不管用户的查询是 “rust”、“RUST”、“Rust” 或者 “rUsT”，我们都将其当作 “rust” 处理并对大小写不敏感。

注意 `query` 现在是一个 `String` 而不是字符串 slice，因为调用 `to_lowercase` 是在创建新数据，而不是引用现有数据。如果查询字符串是 “rUsT”，这个字符串 slice 并不包含可供我们使用的小写的 “u” 或 “t”，所以必需分配一个包含 “rust” 的新 `String`。现在当我们将 `query` 作为一个参数传递给 `contains` 方法时，需要增加一个 & 因为 `contains` 的签名被定义为获取一个字符串 slice。

接下来在检查每个 `line` 是否包含 `search` 之前增加了一个 `to_lowercase` 调用将他们都变为小写。现在我们将 `line` 和 `query` 都转换成了小写，这样就可以不管查询的大小写进行匹配了。

让我们看看这个实现能否通过测试：

```text
running 2 tests
test test::case_insensitive ... ok
test test::case_sensitive ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

好的！现在，让我们在 `run` 函数中实际调用新 `search_case_insensitive` 函数。首先，我们将在 `Config` 结构体中增加一个配置项来切换大小写敏感和大小写不敏感搜索：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct Config {
    pub query: String,
    pub filename: String,
    pub case_sensitive: bool,
}
```

这里增加了 `case_sensitive` 字符来存放一个布尔值。接着我们需要 `run` 函数检查 `case_sensitive` 字段的值并使用它来决定是否调用 `search` 函数或 `search_case_insensitive` 函数，如示例 12-22 所示。注意这还不能编译：

<span class="filename">文件名: src/lib.rs</span>

```rust
# use std::error::Error;
# use std::fs::File;
# use std::io::prelude::*;
#
# fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
#      vec![]
# }
#
# fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
#      vec![]
# }
#
# struct Config {
#     query: String,
#     filename: String,
#     case_sensitive: bool,
# }
#
pub fn run(config: Config) -> Result<(), Box<Error>> {
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    let results = if config.case_sensitive {
        search(&config.query, &contents)
    } else {
        search_case_insensitive(&config.query, &contents)
    };

    for line in results {
        println!("{}", line);
    }

    Ok(())
}
```

<span class="caption">示例 12-22：根据 `config.case_sensitive` 的值调用 `search` 或 `search_case_insensitive`</span>

最后需要实际检查环境变量。处理环境变量的函数位于标准库的 `env` 模块中，所以我们需要在 *src/lib.rs* 的开头增加一个 `use std::env;` 行将这个模块引入作用域中。接着在 `Config::new` 中使用 `env` 模块的 `var` 方法来检查一个叫做 `CASE_INSENSITIVE` 的环境变量，如示例 12-23 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::env;
# struct Config {
#     query: String,
#     filename: String,
#     case_sensitive: bool,
# }

// --snip--

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

<span class="caption">示例 12-23：检查叫做 `CASE_INSENSITIVE` 的环境变量</span>

这里创建了一个新变量 `case_sensitive`。为了设置它的值，需要调用 `env::var` 函数并传递我们需要寻找的环境变量名称，`CASE_INSENSITIVE`。`env::var` 返回一个 `Result`，它在环境变量被设置时返回包含其值的 `Ok` 成员，并在环境变量未被设置时返回 `Err` 成员。

我们使用 `Result` 的 `is_err` 方法来检查其是否是一个 error（也就是环境变量未被设置的情况），这也就意味着我们 **需要** 进行一个大小写敏感搜索。如果`CASE_INSENSITIVE` 环境变量被设置为任何值，`is_err` 会返回 false 并将进行大小写不敏感搜索。我们并不关心环境变量所设置的 **值**，只关心它是否被设置了，所以检查 `is_err` 而不是 `unwrap`、`expect` 或任何我们已经见过的 `Result` 的方法。

我们将变量 `case_sensitive` 的值传递给 `Config` 实例，这样 `run` 函数可以读取其值并决定是否调用 `search` 或者示例 12-22 中实现的 `search_case_insensitive`。

让我们试一试吧！首先不设置环境变量并使用查询 “to” 运行程序，这应该会匹配任何全小写的单词 “to” 的行：

```text
$ cargo run to poem.txt
   Compiling minigrep v0.1.0 (file:///projects/minigrep)
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/minigrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

看起来程序仍然能够工作！现在将 `CASE_INSENSITIVE` 设置为 1 并仍使用相同的查询 “to”，这回应该得到包含可能有大写字母的 “to” 的行：

```text
$ CASE_INSENSITIVE=1 cargo run to poem.txt
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/minigrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!
```

如果你使用 PowerShell，则需要用两句命令而不是一句来设置环境变量并运行程序：

```text
$ $env.CASE_INSENSITIVE=1
$ cargo run to poem.txt
```

好极了，我们也得到了包含 “To” 的行！现在 `minigrep` 程序可以通过环境变量控制进行大小写不敏感搜索了。现在你知道了如何管理由命令行参数或环境变量设置的选项了！

一些程序允许对相同配置同时使用参数 **和** 环境变量。在这种情况下，程序来决定参数和环境变量的优先级。作为一个留给你的测试，尝试通过一个命令行参数或一个环境变量来控制大小写不敏感搜索。并在运行程序时遇到矛盾值时决定命令行参数和环境变量的优先级。

`std::env` 模块还包含了更多处理环境变量的实用功能；请查看官方文档来了解其可用的功能。