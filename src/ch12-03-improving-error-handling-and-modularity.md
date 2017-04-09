## 读取文件

> [ch12-03-improving-error-handling-and-modularity.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-03-improving-error-handling-and-modularity.md)
> <br>
> commit b8e4fcbf289b82c12121b282747ce05180afb1fb

为了改善我们的程序这里有四个问题需要修复，而且他们都与程序的组织方式和如何处理潜在错误有关。

第一，`main`现在进行了两个任务：它解析了参数并打开了文件。对于一个这样的小函数，这并不是一个大问题。然而如果`main`中的功能持续增加，`main`函数处理的单独的任务也会增加。当函数承担了更多责任，它就更难以推导，更难以测试，并且更难以在不破坏其他部分的情况下做出修改。最好能分离出功能这样每个函数就负责一个任务。

这同时也关系到第二个问题：`search`和`filename`是程序中的配置变量，而像`f`和`contents`则用来执行程序逻辑。随着`main`函数的增长，就需要引入更多的变量到作用域中，而当作用域中有更多的变量时，将更难以追踪每个变量的目的。最好能将将配置变量组织进一个结构这样就能使他们的目的更明确了。

第三个问题是如果打开文件失败我们使用`expect`来打印出错误信息，不过这个错误信息只是说`file not found`。除了缺少文件之外还有很多打开文件可能失败的方式：例如，文件可能存在，不过可能没有打开它的权限。如果我们现在就出于这种情况，打印出的`file not found`错误信息就给了用户一个不符合事实的建议！

第四，我们不停的使用`expect`来处理不同的错误，如果用户没有指定足够的参数来运行程序，他们会从 Rust 得到 "index out of bounds" 错误而这并不能明确的解释问题。如果所有的错误处理都位于一处这样将来的维护者在需要修改错误处理逻辑时就只需要咨询一处代码。将所有的错误处理都放在一处也有助于确保我们打印的错误信息对终端用户来说是有意义的。

让我们通过重构项目来解决这些问题。

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

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let args: Vec<String> = env::args().collect();

    let (search, filename) = parse_config(&args);

    println!("Searching for {}", search);
    println!("In file {}", filename);

    // ...snip...
}

fn parse_config(args: &[String]) -> (&str, &str) {
    let search = &args[1];
    let filename = &args[2];

    (search, filename)
}
```

<span class="caption">Listing 12-4: Extract a `parse_config` function from
`main`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这看起来好像有点复杂，不过我们将一点一点的开展重构。在做出这些改变之后，再次运行程序并验证参数解析是否仍然正常。经常验证你的进展是一个好习惯，这样在遇到问题时就能更好地理解什么修改造成了错误。

### 组合配置值

现在我们有了一个函数了，让我们接着完善它。我们代码还能设计的更好一些：函数返回了一个元组，不过接着立刻就解构成了单独的部分。这些代码本身没有问题，不过有一个地方表明仍有改善的余地：我们调用了`parse_config`方法。函数名中的`config`部分也表明了返回的两个值应该是组合在一起的，因为他们都是某个配置值的一部分。

> 注意：一些同学将当使用符合类型更为合适的时候使用基本类型当作一种称为**基本类型偏执**（*primitive obsession*）的反模式。

让我们引入一个结构体来存放所有的配置。列表 12-5 中展示了新增的`Config`结构体定义、重构后的`parse_config`和`main`函数中的相关更新：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = parse_config(&args);

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    let mut f = File::open(config.filename).expect("file not found");

    // ...snip...
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

<span class="caption">Listing 12-5: Refactoring `parse_config` to return an
instance of a `Config` struct</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

`parse_config`的签名现在表明它返回一个`Config`值。在`parse_config`的函数体中，我们之前返回了`args`中`String`值引用的字符串 slice，不过`Config`定义为拥有两个有所有权的`String`值。因为`parse_config`的参数是一个`String`值的 slice，`Config`实例不能获取`String`值的所有权：这违反了 Rust 的借用规则，因为`main`函数中的`args`变量拥有这些`String`值并只允许`parse_config`函数借用他们。

还有许多不同的方式可以处理`String`的数据；现在我们使用简单但低效率的方式，在字符串 slice 上调用`clone`方法。`clone`调用会生成一个字符串数据的完整拷贝，而且`Config`实例可以拥有它，不过这会消耗更多时间和内存来储存拷贝字符串数据的引用，不过拷贝数据让我们使我们的代码显得更加直白。

<!-- PROD: START BOX -->

> #### 使用`clone`权衡取舍
>
> 由于其运行时消耗，许多 Rustacean 之间有一个趋势是倾向于不使用`clone`来解决所有权问题。在关于迭代器的第十三章中，我们将会学习如何更有效率的处理这种情况。现在，为了编写我们的程序拷贝一些字符串是没有问题。我们只进行了一次拷贝，而且文件名和要搜索的字符串都比较短。随着你对 Rust 更加熟练，将更轻松的省略这个权衡的步骤，不过现在调用`clone`是完全可以接受的。

<!-- PROD: END BOX -->

`main`函数更新为将`parse_config`返回的`Config`实例放入变量`config`中，并将分别使用`search`和`filename`变量的代码更新为使用`Config`结构体的字段。

### 创建一个`Config`构造函数

现在让我们考虑一下`parse_config`的目的：这是一个创建`Config`示例的函数。我们已经见过了一个创建实例函数的规范：像`String::new`这样的`new`函数。列表 12-6 中展示了将`parse_config`转换为一个`Config`结构体关联函数`new`的代码：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    // ...snip...
}

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

<span class="caption">Listing 12-6: Changing `parse_config` into
`Config::new`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

我们将`parse_config`的名字改为`new`并将其移动到`impl`块中。我们也更新了`main`中的调用代码。再次尝试编译并确保程序可以运行。

### 从构造函数返回`Result`

这是我们对这个方法最后的重构：还记得当 vector 含有少于三个项时访问索引 1 和 2 会 panic 并给出一个糟糕的错误信息的代码吗？让我们来修改它！列表 12-7 展示了如何在访问这些位置之前检查 slice 是否足够长，并使用一个更好的 panic 信息：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
// ...snip...
fn new(args: &[String]) -> Config {
    if args.len() < 3 {
        panic!("not enough arguments");
    }

    let search = args[1].clone();
    // ...snip...
}
```

<span class="caption">Listing 12-7: Adding a check for the number of
arguments</span>

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

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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

<span class="caption">Listing 12-8: Return a `Result` from `Config::new`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

现在`new`函数返回一个`Result`，在成功时带有一个`Config`实例而在出现错误时带有一个`&'static str`。回忆一下第十章“静态声明周期”中讲到`&'static str`是一个字符串字面值，他也是现在我们的错误信息。

`new`函数体中有两处修改：当没有足够参数时不再调用`panic!`，而是返回`Err`值。同时我们将`Config`返回值包装进`Ok`成员中。这些修改使得函数符合其新的类型签名。

### `Config::new`调用和错误处理

现在我们需要对`main`做一些修改，如列表 12-9 所示：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
// ...snip...
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {}", err);
        process::exit(1);
    });

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    // ...snip...
```

<span class="caption">Listing 12-9: Exiting with an error code if creating a
new `Config` fails</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

新增了一个`use`行来从标准库中导入`process`。在`main`函数中我们将处理`new`函数返回的`Result`值，并在其返回`Config::new`时以一种更加清楚的方式结束进程。

这里使用了一个之前没有讲到的标准库中定义的`Result<T, E>`的方法：`unwrap_or_else`。当`Result`是`Ok`时其行为类似于`unwrap`：它返回`Ok`内部封装的值。与`unwrap`不同的是，当`Result`是`Err`时，它调用一个**闭包**（*closure*），也就是一个我们定义的作为参数传递给`unwrap_or_else`的匿名函数。第十三章会更详细的介绍闭包；这里需要理解的重要部分是`unwrap_or_else`会将`Err`的内部值传递给闭包中位于两道竖线间的参数`err`。使用`unwrap_or_else`允许我们进行一些自定义的非`panic!`的错误处理。

上述的错误处理其实只有两行：我们打印出了错误，接着调用了`std::process::exit`。这个函数立刻停止程序的执行并将传递给它的数组作为返回码。依照惯例，零代表成功而任何其他数字表示失败。就结果来说这依然类似于列表 12-7 中的基于`panic!`的错误处理，但是不再会有额外的输出了，让我们试一试：

```
$ cargo run
   Compiling greprs v0.1.0 (file:///projects/greprs)
    Finished debug [unoptimized + debuginfo] target(s) in 0.48 secs
     Running `target\debug\greprs.exe`
Problem parsing arguments: not enough arguments
```

非常好！现在输出就友好多了。

### `run`函数中的错误处理

现在重构完了参数解析部分，让我们再改进一下程序的逻辑。列表 12-10 中展示了在`main`函数中调用提取出函数`run`之后的代码。`run`函数包含之前位于`main`中的部分代码：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    // ...snip...

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    run(config);
}

fn run(config: Config) {
    let mut f = File::open(config.filename).expect("file not found");

    let mut contents = String::new();
    f.read_to_string(&mut contents).expect("something went wrong reading the file");

    println!("With text:\n{}", contents);
}

// ...snip...
```

<span class="caption">Listing 12-10: Extracting a `run` functionality for the
rest of the program logic</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

`run`函数的内容是之前位于`main`中的几行，而且`run`函数获取一个`Config`作为参数。现在有了一个单独的函数了，我们就可以像列表 12-8 中的`Config::new`那样进行类似的改进了。列表 12-11 展示了另一个`use`语句将`std::error::Error`结构引入了作用域，还有使`run`函数返回`Result`的修改：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
use std::error::Error;

// ...snip...

fn run(config: Config) -> Result<(), Box<Error>> {
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    println!("With text:\n{}", contents);

    Ok(())
}
```

<span class="caption">Listing 12-11: Changing the `run` function to return
`Result`</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

这里有三个大的修改。第一个是现在`run`函数的返回值是`Result<(), Box<Error>>`类型的。之前，函数返回 unit 类型`()`，现在它仍然是`Ok`时的返回值。对于错误类型，我们将使用`Box<Error>`。这是一个**trait 对象**（*trait object*），第XX章会讲到。现在可以这样理解它：`Box<Error>`意味着函数返回了某个实现了`Error` trait 的类型，不过并没有指定具体的返回值类型。这样就比较灵活，因为在不同的错误场景可能有不同类型的错误返回值。`Box`是一个堆数据的智能指针，第十五章将会详细介绍`Box`。

第二个改变是我们去掉了`expect`调用并替换为第9章讲到的`?`。不同于遇到错误就`panic!`，这会从函数中返回错误值并让调用者来处理它。

第三个修改是现在成功时这个函数会返回一个`Ok`值。因为`run`函数签名中声明成功类型返回值是`()`，所以需要将 unit 类型值包装进`Ok`值中。`Ok(())`一开始看起来有点奇怪，不过这样使用`()`是表明我们调用`run`只是为了它的副作用的惯用方式；它并没有返回什么有意义的值。

上述代码能够编译，不过会有一个警告：

```
warning: unused result which must be used, #[warn(unused_must_use)] on by default
  --> src\main.rs:39:5
   |
39 |     run(config);
   |     ^^^^^^^^^^^^
```

Rust 尝试告诉我们忽略`Result`，它有可能是一个错误值。让我们现在来处理它。我们将采用类似于列表 12-9 中处理`Config::new`错误的技巧，不过还有少许不同：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    // ...snip...

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    if let Err(e) = run(config) {
        println!("Application error: {}", e);

        process::exit(1);
    }
}

fn run(config: Config) -> Result<(), Box<Error>> {
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    println!("With text:\n{}", contents);

    Ok(())
}
```

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

不同于`unwrap_or_else`，我们使用`if let`来检查`run`是否返回`Err`，如果是则调用`process::exit(1)`。为什么呢？这个例子和`Config::new`的区别有些微妙。对于`Config::new`我们关心两件事：

1. 检测出任何可能发生的错误
2. 如果没有出现错误创建一个`Config`

而在这个情况下，因为`run`在成功的时候返回一个`()`，唯一需要担心的就是第一件事：检测错误。如果我们使用了`unwrap_or_else`，则会得到`()`的返回值。它并没有什么用处。

虽然两种情况下`if let`和`unwrap_or_else`的内容都是一样的：打印出错误并退出。

### 将代码拆分到库 crate

现在项目看起来好多了！还有一件我们尚未开始的工作：拆分 *src/main.rs* 并将一些代码放入 *src/lib.rs* 中。让我们现在就开始吧：将 *src/main.rs* 中的`run`函数移动到新建的 *src/lib.rs* 中。还需要移动相关的`use`语句和`Config`的定义，以及其`new`方法。现在 *src/lib.rs* 应该如列表 12-12 所示：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;

pub struct Config {
    pub search: String,
    pub filename: String,
}

impl Config {
    pub fn new(args: &[String]) -> Result<Config, &'static str> {
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

pub fn run(config: Config) -> Result<(), Box<Error>>{
    let mut f = File::open(config.filename)?;

    let mut contents = String::new();
    f.read_to_string(&mut contents)?;

    println!("With text:\n{}", contents);

    Ok(())
}
```

<span class="caption">Listing 12-12: Moving `Config` and `run` into
*src/lib.rs*</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->
注意我们还需要使用公有的`pub`：在`Config`和其字段、它的`new`方法和`run`函数上。

现在在 *src/main.rs* 中，我们需要通过`extern crate greprs`来引入现在位于 *src/lib.rs* 的代码。接着需要增加一行`use greprs::Config`来引入`Config`到作用域，并对`run`函数加上 crate 名称前缀，如列表 12-13 所示：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern crate greprs;

use std::env;
use std::process;

use greprs::Config;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {}", err);
        process::exit(1);
    });

    println!("Searching for {}", config.search);
    println!("In file {}", config.filename);

    if let Err(e) = greprs::run(config) {
        println!("Application error: {}", e);

        process::exit(1);
    }
}
```

<span class="caption">Listing 12-13: Bringing the `greprs` crate into the scope
of *src/main.rs*</span>

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

<!-- Will add ghosting and wingdings in libreoffice /Carol -->

通过这些重构，所有代码应该都能运行了。运行几次`cargo run`来确保你没有破坏什么内容。好的！确实有很多的内容，不过已经为将来的成功奠定了基础。我们采用了一种更加优秀的方式来处理错误，并使得代码更模块化了一些。从现在开始几乎所有的工作都将在 *src/lib.rs* 中进行。

让我们利用这新创建的模块的优势来进行一些在旧代码中难以开开展的工作，他们在新代码中却很简单：编写测试！