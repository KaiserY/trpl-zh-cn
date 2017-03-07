## 处理环境变量

> [ch12-05-working-with-environment-variables.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-05-working-with-environment-variables.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

让我们再增加一个功能：大小写不敏感搜索。另外，这个设定将不是一个命令行参数：相反它将是一个环境变量。当然可以选择创建一个大小写不敏感的命令行参数，不过用户要求提供一个环境变量这样设置一次之后在整个终端会话中所有的搜索都将是大小写不敏感的了。

### 实现并测试一个大小写不敏感`grep`函数

首先，让我们增加一个新函数，当设置了环境变量时会调用它。增加一个新测试并重命名已经存在的那个：

```rust,ignore
#[cfg(test)]
mod test {
    use {grep, grep_case_insensitive};

    #[test]
    fn case_sensitive() {
        let search = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(
            vec!["safe, fast, productive."],
            grep(search, contents)
        );
    }

    #[test]
    fn case_insensitive() {
        let search = "rust";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            grep_case_insensitive(search, contents)
        );
    }
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

我们将定义一个叫做`grep_case_insensitive`的新函数。它的实现与`grep`函数大体上相似，不过列表 12-16 展示了一些小的区别：

<figure>
<span class="filename">Filename: src/lib.rs</span>

```rust
fn grep_case_insensitive<'a>(search: &str, contents: &'a str) -> Vec<&'a str> {
    let search = search.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&search) {
            results.push(line);
        }
    }

    results
}
```

<figcaption>

Listing 12-16: Implementing a `grep_case_insensitive` function by changing the
search string and the lines of the contents to lowercase before comparing them

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

首先，将`search`字符串转换为小写，并存放于一个同名的覆盖变量中。注意现在`search`是一个`String`而不是字符串 slice，所以在将`search`传递给`contains`时需要加上 &，因为`contains`获取一个字符串 slice。

接着在检查每个`line`是否包含`search`之前增加了一个`to_lowercase`调用。因为将`line`和`search`都转换为小写，我们就可以无视大小写的匹配文件和命令行参数了。看看测试是否通过了：

```
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target\debug\deps\greprs-e58e9b12d35dc861.exe

running 2 tests
test test::case_insensitive ... ok
test test::case_sensitive ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured

     Running target\debug\greprs-8a7faa2662b5030a.exe

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests greprs

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

好的！现在，我们必须真正的使用新的`grep_case_insensitive`函数。首先，在`Config`结构体中增加一个配置项：

<span class="filename">Filename: src/lib.rs</span>

```rust
pub struct Config {
    pub search: String,
    pub filename: String,
    pub case_sensitive: bool,
}
```

<!-- Will add ghosting in libreoffice /Carol -->

接着在`run`函数中检查这个选项，并根据`case_sensitive`函数的值来决定调用哪个函数：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
pub fn run(config: Config) -> Result<(), Box<Error>>{
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    let results = if config.case_sensitive {
        grep(&config.search, &contents)
    } else {
        grep_case_insensitive(&config.search, &contents)
    };

    for line in results {
        println!("{}", line);
    }

    Ok(())
}
```

<!-- Will add ghosting in libreoffice /Carol -->

最后需要真正的检查环境变量。为了将标准库中的`env`模块引入作用域，在 *src/lib.rs* 开头增加一个`use`行：

<span class="filename">Filename: src/lib.rs</span>

```rust
use std::env;
```

并接着在`Config::new`中使用`env`模块的`vars`方法：

<span class="filename">Filename: src/lib.rs</span>

```rust
# use std::env;
#
# struct Config {
#     search: String,
#     filename: String,
#     case_sensitive: bool,
# }
#
impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let search = args[1].clone();
        let filename = args[2].clone();

        let mut case_sensitive = true;

        for (name, _) in env::vars() {
            if name == "CASE_INSENSITIVE" {
                case_sensitive = false;
            }
        }

        Ok(Config {
            search: search,
            filename: filename,
            case_sensitive: case_sensitive,
        })
    }
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这里我们调用了`env::vars`，它与`env::args`的工作方式类似。区别是`env::vars`返回一个环境变量而不是命令行参数的迭代器。不同于使用`collect`来创建一个所有环境变量的 vector，我们使用`for`循环。`env::vars`返回一系列元组：环境变量的名称和其值。我们从来也不关心它的值，只关心它是否被设置了，所以可以使用`_`占位符来取代变量名来让 Rust 知道它不应该警告一个未使用的变量。最后，有一个默认为真的变量`case_sensitive`。如果我们找到了一个`CASE_INSENSITIVE`环境变量，就将`case_sensitive`设置为假。接着将其作为`Config`的一部分返回。

尝试运行几次吧！

```
$ cargo run to poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

```
$ CASE_INSENSITIVE=1 cargo run to poem.txt
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe to poem.txt`
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!
```

好极了！`greprs`现在可以通过环境变量的控制来进行大小写不敏感搜索了。现在你已经知道如何处理命令行参数或环境变量了！

一些程序允许对相同配置同时使用参数_和_环境变量。在这种情况下，程序来决定参数和环境变量的优先级。作为一个留给你的测试，尝试同时通过一个命令行参数来控制大小写不敏感搜索，并在程序遇到矛盾值时决定其优先级。

`std::env`模块还包含了更多处理环境变量的实用功能；请查看官方文档来了解其可用的功能。