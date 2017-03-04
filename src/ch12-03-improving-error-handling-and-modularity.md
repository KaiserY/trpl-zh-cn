## 读取文件

> [ch12-03-improving-error-handling-and-modularity.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-03-improving-error-handling-and-modularity.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

为了完善我们程序有四个问题需要修复，而他们都与潜在的错误和程序结构有关。第一个问题是在哪打开文件：我们使用了`expect`来在打开文件失败时指定一个错误信息，不过这个错误信息只是说“文件不存在”。还有很多打开文件失败的方式，不过我们总是假设是由于缺少文件导致的。例如，文件存在但是没有打开它的权限：这时，我们就打印出了错误不符合事实的错误信息！

第二，我们不停的使用`expect`，这就有点类似我们之前在不传递任何命令行参数时索引会`panic!`时注意到的问题：这虽然时_可以工作_的，不过这有点没有原则性，而且整个程序中都需要他们，将错误处理都置于一处则会显得好很多。

第三个问题是`main`函数现在处理两个工作：解析参数，并打开文件。对于一个小的函数来说，这不是什么大问题。然而随着程序中的`main`函数不断增长，`main`函数中独立的任务也会越来越多。因为一个函数拥有很多职责，它将难以理解、难以测试并难以在不破坏其他部分的情况下做出修改。

这也关系到我们的第四个问题：`search`和`filename`是程序中配置性的变量，而像`f`和`contents`则用来执行程序逻辑。随着`main`函数增长，将引入更多的变量到作用域中，而当作用域中有更多的变量，将更难以追踪哪个变量用于什么目的。如果能够将配置型变量组织进一个结构就能使他们的目的更明确了。

让我们重新组成程序来解决这些问题。

### 二进制项目的关注分离

这类项目组织上的问题在很多相似类型的项目中很常见，所以 Rust 社区开发出一种关注分离的组织模式。这种模式可以用来组织任何用 Rust 构建的二进制项目，所以可以证明应该更早的开始这项重构，以为我们的项目符合这个模式。这个模式看起来像这样：

1. 将程序拆分成 *main.rs* 和 *lib.rs*。
2. 将命令行参数解析逻辑放入 *main.rs*。
3. 将程序逻辑放入 *lib.rs*。
4. `main`函数的工作是：
    * 解析参数
    * 设置所有配置性变量
    * 调用 *lib.rs* 中的`run`函数
    * 如果`run`返回错误则处理这个错误

好的！老实说这个模式好像还很复杂。这就是关注分离的所有内容：*main.rs* 负责实际的程序运行，而 *lib.rs* 处理所有真正的任务逻辑。让我们将程序重构成这种模式。首先，提取出一个目的只在于解析参数的函数。列表 12-4 中展示了一个新的开始，`main`函数调用了一个新函数`parse_config`，它仍然定义于 *src/main.rs* 中：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# use std::env;
# use std::fs::File;
# use std::io::prelude::*;
#
fn main() {
    let args: Vec<String> = env::args().collect();

    let (search, filename) = parse_config(&args);

    println!("Searching for {}", search);
    println!("In file {}", filename);

    // ...snip...
#
#     let mut f = File::open(filename).expect("file not found");
#
#     let mut contents = String::new();
#     f.read_to_string(&mut contents).expect("something went wrong reading the file");
#
#     println!("With text:\n{}", contents);
}

fn parse_config(args: &[String]) -> (&str, &str) {
    let search = &args[1];
    let filename = &args[2];

    (search, filename)
}
```

<figcaption>

Listing 12-4: Extract a `parse_config` function from `main`

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这看起来好像有点复杂，不过我们将一点一点的开展重构。在做出这些改变之后，再次运行程序并验证参数解析是否仍然正常。经常验证你的进展是一个好习惯，这样在遇到问题时就能更好地理解什么修改造成了错误。

### 组合配置值

现在我们有了一个函数了，让我们接着完善它。我们代码还能设计的更好一些：函数返回了一个元组，不过接着立刻就解构成了单独的部分。这些代码本身没有问题，不过有一个地方表明仍有改善的余地：我们调用了`parse_config`方法。函数名中的`config`部分也表明了返回的两个值应该是组合在一起的，因为他们都是某个配置值的一部分。

> 注意：一些同学将当使用符合类型更为合适的时候使用基本类型当作一种称为**基本类型偏执**（*primitive obsession*）的反模式。

让我们引入一个结构体来存放所有的配置。列表 12-5 中展示了新增的`Config`结构体定义、重构后的`parse_config`和`main`函数中的相关更新：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# use std::env;
# use std::fs::File;
# use std::io::prelude::*;
#
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = parse_config(&args);

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    let mut f = File::open(config.filename).expect("file not found");

    // ...snip...
#     let mut contents = String::new();
#     f.read_to_string(&mut contents).expect("something went wrong reading the file");
#
#    println!("With text:\n{}", contents);
}

struct Config {
    search: String,
    filename: String,
}

fn parse_config(args: &[String]) -> Config {
    let search = args[1].clone();
    let filename = args[2].clone();

    Config {
        search: search,
        filename: filename,
    }
}
```

<figcaption>

Listing 12-5: Refactoring `parse_config` to return an instance of a `Config`
struct

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

`parse_config`的签名现在表明它返回一个`Config`值。在`parse_config`的函数体中，我们之前返回了`args`中`String`值引用的字符串 slice，不过`Config`定义为拥有两个有所有权的`String`值。因为`parse_config`的参数是一个`String`值的 slice，`Config`实例不能获取`String`值的所有权：这违反了 Rust 的借用规则，因为`main`函数中的`args`变量拥有这些`String`值并只允许`parse_config`函数借用他们。

还有许多不同的方式可以处理`String`的数据；现在我们使用简单但低效率的方式，在字符串 slice 上调用`clone`方法。`clone`调用会生成一个字符串数据的完整拷贝，而且`Config`实例可以拥有它，不过这会消耗更多时间和内存来储存拷贝字符串数据的引用，不过拷贝数据让我们使我们的代码显得更加直白。

<!-- PROD: START BOX -->

> #### 使用`clone`权衡取舍
>
> 由于其运行时消耗，许多 Rustacean 之间有一个趋势是倾向于不使用`clone`来解决所有权问题。在关于迭代器的第XX章中，我们将会学习如何更有效率的处理这种情况。现在，为了编写我们的程序拷贝一些字符串是没有问题。我们只进行了一次拷贝，而且文件名和要搜索的字符串都比较短。随着你对 Rust 更加熟练，将更轻松的省略这个权衡的步骤，不过现在调用`clone`是完全可以接受的。

<!-- PROD: END BOX -->

`main`函数更新为将`parse_config`返回的`Config`实例放入变量`config`中，并将分别使用`search`和`filename`变量的代码更新为使用`Config`结构体的字段。

### 创建一个`Config`构造函数

现在让我们考虑一下`parse_config`的目的：这是一个创建`Config`示例的函数。我们已经见过了一个创建实例函数的规范：像`String::new`这样的`new`函数。列表 12-6 中展示了将`parse_config`转换为一个`Config`结构体关联函数`new`的代码：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# use std::env;
# use std::fs::File;
# use std::io::prelude::*;
#
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    // ...snip...

#     let mut f = File::open(config.filename).expect("file not found");
#
#     let mut contents = String::new();
#     f.read_to_string(&mut contents).expect("something went wrong reading the file");
#
#    println!("With text:\n{}", contents);

}

# struct Config {
#     search: String,
#     filename: String,
# }
#
// ...snip...

impl Config {
    fn new(args: &[String]) -> Config {
        let search = args[1].clone();
        let filename = args[2].clone();

        Config {
            search: search,
            filename: filename,
        }
    }
}
```

<figcaption>

Listing 12-6: Changing `parse_config` into `Config::new`

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

我们将`parse_config`的名字改为`new`并将其移动到`impl`块中。我们也更新了`main`中的调用代码。再次尝试编译并确保程序可以运行。

### 从构造函数返回`Result`

这是我们对这个方法最后的重构：还记得当 vector 含有少于三个项时访问索引 1 和 2 会 panic 并给出一个糟糕的错误信息的代码吗？让我们来修改它！列表 12-7 展示了如何在访问这些位置之前检查 slice 是否足够长，并使用一个更好的 panic 信息：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# use std::env;
# use std::fs::File;
# use std::io::prelude::*;
#
# fn main() {
#     let args: Vec<String> = env::args().collect();
#
#     let config = Config::new(&args);
#
#     println!("Searching for {}", config.search);
#     println!("In file {}", config.filename);
#
#     let mut f = File::open(config.filename).expect("file not found");
#
#     let mut contents = String::new();
#     f.read_to_string(&mut contents).expect("something went wrong reading the file");
#
#     println!("With text:\n{}", contents);
# }
#
# struct Config {
#     search: String,
#     filename: String,
# }
#
# impl Config {
// ...snip...
fn new(args: &[String]) -> Config {
    if args.len() < 3 {
        panic!("not enough arguments");
    }

    let search = args[1].clone();
    // ...snip...
#     let filename = args[2].clone();
#
#     Config {
#         search: search,
#         filename: filename,
#     }
}
# }
```

<figcaption>

Listing 12-7: Adding a check for the number of arguments

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

通过在`new`中添加这额外的几行代码，再次尝试不带参数运行程序：

```
$ cargo run
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target\debug\greprs.exe`
thread 'main' panicked at 'not enough arguments', src\main.rs:29
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

这样就好多了！至少有个一个符合常理的错误信息。然而，还有一堆额外的信息我们并不希望提供给用户。可以通过改变`new`的签名来完善它。现在它只返回了一个`Config`，所有没有办法表示创建`Config`失败的情况。相反，可以如列表 12-8 所示返回一个`Result`：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
# use std::env;
# use std::fs::File;
# use std::io::prelude::*;
# use std::process;
#
# fn main() {
#     let args: Vec<String> = env::args().collect();
#
#     let config = Config::new(&args).unwrap_or_else(|err| {
#         println!("Problem parsing arguments: {}", err);
#         process::exit(1);
#     });
#
#     println!("Searching for {}", config.search);
#     println!("In file {}", config.filename);
#
#     let mut f = File::open(config.filename).expect("file not found");
#
#     let mut contents = String::new();
#     f.read_to_string(&mut contents).expect("something went wrong reading the file");
#
#     println!("With text:\n{}", contents);
# }
# struct Config {
#     search: String,
#     filename: String,
# }
#
impl Config {
    fn new(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let search = args[1].clone();
        let filename = args[2].clone();

        Ok(Config {
            search: search,
            filename: filename,
        })
    }
}
```

<figcaption>

Listing 12-8: Return a `Result` from `Config::new`

</figcaption>
</figure>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

