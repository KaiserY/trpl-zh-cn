## `Result` 与可恢复的错误

> [ch09-02-recoverable-errors-with-result.md](https://github.com/rust-lang/book/blob/master/src/ch09-02-recoverable-errors-with-result.md)
> <br>
> commit aa339f78da31c330ede3f1b52b4bbfb62d7814cb

大部分错误并没有严重到需要程序完全停止执行。有时，一个函数会因为一个容易理解并做出反应的原因失败。例如，如果尝试打开一个文件不过由于文件并不存在而失败，此时我们可能想要创建这个文件而不是终止进程。

回忆一下第二章 [“使用 `Result` 类型来处理潜在的错误”][handle_failure] 部分中的那个 `Result` 枚举，它定义有如下两个成员，`Ok` 和 `Err`：

[handle_failure]: ch02-00-guessing-game-tutorial.html#handling-potential-failure-with-the-result-type

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

`T` 和 `E` 是泛型类型参数；第十章会详细介绍泛型。现在你需要知道的就是 `T` 代表成功时返回的 `Ok` 成员中的数据的类型，而 `E` 代表失败时返回的 `Err` 成员中的错误的类型。因为 `Result` 有这些泛型类型参数，我们可以将 `Result` 类型和标准库中为其定义的函数用于很多不同的场景，这些情况中需要返回的成功值和失败值可能会各不相同。

让我们调用一个返回 `Result` 的函数，因为它可能会失败：如示例 9-3 所示打开一个文件：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");
}
```

<span class="caption">示例 9-3：打开文件</span>

如何知道 `File::open` 返回一个 `Result` 呢？我们可以查看 [标准库 API 文档](https://doc.rust-lang.org/std/index.html)<!-- ignore -->，或者可以直接问编译器！如果给 `f` 某个我们知道 **不是** 函数返回值类型的类型注解，接着尝试编译代码，编译器会告诉我们类型不匹配。然后错误信息会告诉我们 `f` 的类型 **应该** 是什么。让我们试试！我们知道 `File::open` 的返回值不是 `u32` 类型的，所以将 `let f` 语句改为如下：

```rust,ignore,does_not_compile
let f: u32 = File::open("hello.txt");
```

现在尝试编译会给出如下输出：

```text
error[E0308]: mismatched types
 --> src/main.rs:4:18
  |
4 |     let f: u32 = File::open("hello.txt");
  |                  ^^^^^^^^^^^^^^^^^^^^^^^ expected u32, found enum
`std::result::Result`
  |
  = note: expected type `u32`
             found type `std::result::Result<std::fs::File, std::io::Error>`
```

这就告诉我们了 `File::open` 函数的返回值类型是 `Result<T, E>`。这里泛型参数 `T` 放入了成功值的类型 `std::fs::File`，它是一个文件句柄。`E` 被用在失败值上时 `E` 的类型是 `std::io::Error`。

这个返回值类型说明 `File::open` 调用可能会成功并返回一个可以进行读写的文件句柄。这个函数也可能会失败：例如，文件可能并不存在，或者可能没有访问文件的权限。`File::open` 需要一个方式告诉我们是成功还是失败，并同时提供给我们文件句柄或错误信息。而这些信息正是 `Result` 枚举可以提供的。

当 `File::open` 成功的情况下，变量 `f` 的值将会是一个包含文件句柄的 `Ok` 实例。在失败的情况下，`f` 的值会是一个包含更多关于出现了何种错误信息的 `Err` 实例。

我们需要在示例 9-3 的代码中增加根据 `File::open` 返回值进行不同处理的逻辑。示例 9-4 展示了一个使用基本工具处理 `Result` 的例子：第六章学习过的 `match` 表达式。

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic
use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => {
            panic!("Problem opening the file: {:?}", error)
        },
    };
}
```

<span class="caption">示例 9-4：使用 `match` 表达式处理可能会返回的 `Result` 成员</span>

注意与 `Option` 枚举一样，`Result` 枚举和其成员也被导入到了 prelude 中，所以就不需要在 `match` 分支中的 `Ok` 和 `Err` 之前指定 `Result::`。

这里我们告诉 Rust 当结果是 `Ok` 时，返回 `Ok` 成员中的 `file` 值，然后将这个文件句柄赋值给变量 `f`。`match` 之后，我们可以利用这个文件句柄来进行读写。

`match` 的另一个分支处理从 `File::open` 得到 `Err` 值的情况。在这种情况下，我们选择调用 `panic!` 宏。如果当前目录没有一个叫做 *hello.txt* 的文件，当运行这段代码时会看到如下来自 `panic!` 宏的输出：

```text
thread 'main' panicked at 'Problem opening the file: Error { repr:
Os { code: 2, message: "No such file or directory" } }', src/main.rs:9:12
```

一如既往输出告诉了我们到底出了什么错。

### 匹配不同的错误

示例 9-4 中的代码不管 `File::open` 是因为什么原因失败都会 `panic!`。我们真正希望的是对不同的错误原因采取不同的行为：如果 `File::open `因为文件不存在而失败，我们希望创建这个文件并返回新文件的句柄。如果 `File::open` 因为任何其他原因失败，例如没有打开文件的权限，我们仍然希望像示例 9-4 那样 `panic!`。让我们看看示例 9-5，其中 `match` 增加了另一个分支：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("Problem creating the file: {:?}", e),
            },
            other_error => panic!("Problem opening the file: {:?}", other_error),
        },
    };
}
```

<span class="caption">示例 9-5：使用不同的方式处理不同类型的错误</span>

`File::open` 返回的 `Err` 成员中的值类型 `io::Error`，它是一个标准库中提供的结构体。这个结构体有一个返回 `io::ErrorKind` 值的 `kind` 方法可供调用。`io::ErrorKind` 是一个标准库提供的枚举，它的成员对应 `io` 操作可能导致的不同错误类型。我们感兴趣的成员是 `ErrorKind::NotFound`，它代表尝试打开的文件并不存在。所以 `match` 的 `f` 匹配，不过对于 `error.kind()` 还有一个内部 `match`。

我们希望在匹配守卫中检查的条件是 `error.kind()` 的返回值是 `ErrorKind`的 `NotFound` 成员。如果是，则尝试通过 `File::create` 创建文件。然而因为 `File::create` 也可能会失败，还需要增加一个内部 `match` 语句。当文件不能被打开，会打印出一个不同的错误信息。外部 `match` 的最后一个分支保持不变这样对任何除了文件不存在的错误会使程序 panic。

这里有好多 `match`！`match` 确实很强大，不过也非常的基础。第十三章我们会介绍闭包（closure）。`Result<T, E>` 有很多接受闭包的方法，并采用 `match` 表达式实现。一个更老练的 Rustacean 可能会这么写：

```rust,ignore
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Problem creating the file: {:?}", error);
            })
        } else {
            panic!("Problem opening the file: {:?}", error);
        }
    });
}
```

虽然这段代码有着如示例 9-5 一样的行为，但并没有包好任何 `match` 表达式且更容易阅读。在阅读完第十三章后再回到这个例子，并查看标准库文档 `unwrap_or_else` 方法都做了什么操作。在处理错误时，还有很多这类方法可以消除大量嵌套的 `match` 表达式。

### 失败时 panic 的简写：`unwrap` 和 `expect`

`match` 能够胜任它的工作，不过它可能有点冗长并且不总是能很好的表明其意图。`Result<T, E>` 类型定义了很多辅助方法来处理各种情况。其中之一叫做 `unwrap`，它的实现就类似于示例 9-4 中的 `match` 语句。如果 `Result` 值是成员 `Ok`，`unwrap` 会返回 `Ok` 中的值。如果 `Result` 是成员 `Err`，`unwrap` 会为我们调用 `panic!`。这里是一个实践 `unwrap` 的例子：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```

如果调用这段代码时不存在 *hello.txt* 文件，我们将会看到一个 `unwrap` 调用 `panic!` 时提供的错误信息：

```text
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: Error {
repr: Os { code: 2, message: "No such file or directory" } }',
src/libcore/result.rs:906:4
```

还有另一个类似于 `unwrap` 的方法它还允许我们选择 `panic!` 的错误信息：`expect`。使用 `expect` 而不是 `unwrap` 并提供一个好的错误信息可以表明你的意图并更易于追踪 panic 的根源。`expect` 的语法看起来像这样：

<span class="filename">文件名: src/main.rs</span>

```rust,should_panic
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```

`expect` 与 `unwrap` 的使用方式一样：返回文件句柄或调用 `panic!` 宏。`expect` 用来调用 `panic!` 的错误信息将会作为参数传递给 `expect` ，而不像`unwrap` 那样使用默认的 `panic!` 信息。它看起来像这样：

```text
thread 'main' panicked at 'Failed to open hello.txt: Error { repr: Os { code:
2, message: "No such file or directory" } }', src/libcore/result.rs:906:4
```

因为这个错误信息以我们指定的文本开始，`Failed to open hello.txt`，将会更容易找到代码中的错误信息来自何处。如果在多处使用 `unwrap`，则需要花更多的时间来分析到底是哪一个 `unwrap` 造成了 panic，因为所有的 `unwrap` 调用都打印相同的信息。

### 传播错误

当编写一个其实现会调用一些可能会失败的操作的函数时，除了在这个函数中处理错误外，还可以选择让调用者知道这个错误并决定该如何处理。这被称为 **传播**（*propagating*）错误，这样能更好的控制代码调用，因为比起你代码所拥有的上下文，调用者可能拥有更多信息或逻辑来决定应该如何处理错误。

例如，示例 9-6 展示了一个从文件中读取用户名的函数。如果文件不存在或不能读取，这个函数会将这些错误返回给调用它的代码：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let f = File::open("hello.txt");

    let mut f = match f {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut s = String::new();

    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}
```

<span class="caption">示例 9-6：一个函数使用 `match` 将错误返回给代码调用者</span>

首先让我们看看函数的返回值：`Result<String, io::Error>`。这意味着函数返回一个 `Result<T, E>` 类型的值，其中泛型参数 `T` 的具体类型是 `String`，而 `E` 的具体类型是 `io::Error`。如果这个函数没有出任何错误成功返回，函数的调用者会收到一个包含 `String` 的 `Ok` 值 —— 函数从文件中读取到的用户名。如果函数遇到任何错误，函数的调用者会收到一个 `Err` 值，它储存了一个包含更多这个问题相关信息的 `io::Error` 实例。这里选择 `io::Error` 作为函数的返回值是因为它正好是函数体中那两个可能会失败的操作的错误返回值：`File::open` 函数和 `read_to_string` 方法。

函数体以 `File::open` 函数开头。接着使用 `match` 处理返回值 `Result`，类似于示例 9-4 中的 `match`，唯一的区别是当 `Err` 时不再调用 `panic!`，而是提早返回并将 `File::open` 返回的错误值作为函数的错误返回值传递给调用者。如果 `File::open` 成功了，我们将文件句柄储存在变量 `f` 中并继续。

接着我们在变量 `s` 中创建了一个新 `String` 并调用文件句柄 `f` 的 `read_to_string` 方法来将文件的内容读取到 `s` 中。`read_to_string` 方法也返回一个 `Result` 因为它也可能会失败：哪怕是 `File::open` 已经成功了。所以我们需要另一个 `match` 来处理这个 `Result`：如果 `read_to_string` 成功了，那么这个函数就成功了，并返回文件中的用户名，它现在位于被封装进 `Ok` 的 `s` 中。如果`read_to_string` 失败了，则像之前处理 `File::open` 的返回值的 `match` 那样返回错误值。不过并不需要显式的调用 `return`，因为这是函数的最后一个表达式。

调用这个函数的代码最终会得到一个包含用户名的 `Ok` 值，或者一个包含 `io::Error` 的 `Err` 值。我们无从得知调用者会如何处理这些值。例如，如果他们得到了一个 `Err` 值，他们可能会选择 `panic!` 并使程序崩溃、使用一个默认的用户名或者从文件之外的地方寻找用户名。我们没有足够的信息知晓调用者具体会如何尝试，所以将所有的成功或失败信息向上传播，让他们选择合适的处理方法。

这种传播错误的模式在 Rust 是如此的常见，以至于 Rust 提供了 `?` 问号运算符来使其更易于处理。

### 传播错误的简写：`?` 运算符

示例 9-7 展示了一个 `read_username_from_file` 的实现，它实现了与示例 9-6 中的代码相同的功能，不过这个实现使用了 `?` 运算符：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

<span class="caption">示例 9-7：一个使用 `?` 运算符向调用者返回错误的函数</span>

`Result` 值之后的 `?` 被定义为与示例 9-6 中定义的处理 `Result` 值的 `match` 表达式有着完全相同的工作方式。如果 `Result` 的值是 `Ok`，这个表达式将会返回 `Ok` 中的值而程序将继续执行。如果值是 `Err`，`Err` 中的值将作为整个函数的返回值，就好像使用了 `return` 关键字一样，这样错误值就被传播给了调用者。

示例 9-6 中的 `match` 表达式与问号运算符所做的有一点不同：`?` 运算符所使用的错误值被传递给了 `from` 函数，它定义于标准库的 `From` trait 中，其用来将错误从一种类型转换为另一种类型。当 `?` 运算符调用 `from` 函数时，收到的错误类型被转换为定义为当前函数返回的错误类型。这在当一个函数返回一个错误类型来代表所有可能失败的方式时很有用，即使其可能会因很多种原因失败。只要每一个错误类型都实现了 `from` 函数来定义如将其转换为返回的错误类型，`?` 运算符会自动处理这些转换。

在示例 9-7 的上下文中，`File::open` 调用结尾的 `?` 将会把 `Ok` 中的值返回给变量 `f`。如果出现了错误，`?` 运算符会提早返回整个函数并将一些 `Err` 值传播给调用者。同理也适用于 `read_to_string` 调用结尾的 `?`。

`?` 运算符消除了大量样板代码并使得函数的实现更简单。我们甚至可以在 `?` 之后直接使用链式方法调用来进一步缩短代码，如示例 9-8 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();

    File::open("hello.txt")?.read_to_string(&mut s)?;

    Ok(s)
}
```

<span class="caption">示例 9-8：问号运算符之后的链式方法调用</span>

在 `s` 中创建新的 `String` 被放到了函数开头；这一部分没有变化。我们对 `File::open("hello.txt")?` 的结果直接链式调用了 `read_to_string`，而不再创建变量 `f`。仍然需要 `read_to_string` 调用结尾的 `?`，而且当 `File::open` 和 `read_to_string` 都成功没有失败时返回包含用户名 `s` 的 `Ok` 值。其功能再一次与示例 9-6 和示例 9-7 保持一致，不过这是一个与众不同且更符合工程学的写法。

说到编写这个函数的不同方法，甚至还有一个更短的写法：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::io;
use std::fs;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

<span class="caption">示例 9-9: 使用 `fs::read_to_string`</span>

将文件读取到一个字符串是相当常见的操作，所以 Rust 提供了名为 `fs::read_to_string` 的函数，它会打开文件、新建一个 `String`、读取文件的内容，并将内容放入 `String`，接着返回它。当然，这样做就没有展示所有这些错误处理的机会了，所以我们最初就选择了艰苦的道路。

### `?` 运算符可被用于返回 `Result` 的函数

`?` 运算符可被用于返回值类型为 `Result` 的函数，因为他被定义为与示例 9-6 中的 `match` 表达式有着完全相同的工作方式。`match` 的 `return Err(e)` 部分要求返回值类型是 `Result`，所以函数的返回值必须是 `Result` 才能与这个 `return` 相兼容。

让我们看看在 `main` 函数中使用 `?` 运算符会发生什么，如果你还记得的话其返回值类型是`()`：

```rust,ignore,does_not_compile
use std::fs::File;

fn main() {
    let f = File::open("hello.txt")?;
}
```

当编译这些代码，会得到如下错误信息：

```text
error[E0277]: the `?` operator can only be used in a function that returns
`Result` or `Option` (or another type that implements `std::ops::Try`)
 --> src/main.rs:4:13
  |
4 |     let f = File::open("hello.txt")?;
  |             ^^^^^^^^^^^^^^^^^^^^^^^^ cannot use the `?` operator in a
  function that returns `()`
  |
  = help: the trait `std::ops::Try` is not implemented for `()`
  = note: required by `std::ops::Try::from_error`
```

错误指出只能在返回 `Result` 或者其它实现了 `std::ops::Try` 的类型的函数中使用 `?` 运算符。当你期望在不返回 `Result` 的函数中调用其他返回 `Result` 的函数时使用 `?` 的话，有两种方法修复这个问题。一种技巧是将函数返回值类型修改为 `Result<T, E>`，如果没有其它限制组织你这么做的话。另一种技巧是通过合适的方法使用 `match` 或 `Result` 的方法之一来处理 `Result<T, E>`。

`main` 函数是特殊的，其必须返回什么类型是有限制的。`main` 函数的一个有效的返回值是 `()`，同时出于方便，另一个有效的返回值是 `Result<T, E>`，如下所示：

```rust,ignore
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;

    Ok(())
}
```

`Box<dyn Error>` 被称为 “trait 对象”（“trait object”），第十七章 [“为使用不同类型的值而设计的 trait 对象”][trait-objects] 部分会做介绍。目前可以理解 `Box<dyn Error>` 为使用 `?` 时 `main` 允许返回的 “任何类型的错误”。

现在我们讨论过了调用 `panic!` 或返回 `Result` 的细节，是时候回到他们各自适合哪些场景的话题了。

[trait-objects]: ch17-02-trait-objects.html#using-trait-objects-that-allow-for-values-of-different-types