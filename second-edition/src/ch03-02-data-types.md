## 数据类型

> [ch03-02-data-types.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch03-02-data-types.md)
> <br>
> commit ec65990849230388e4ce4db5b7a0cb8a0f0d60e2

在 Rust 中，任何值都属于一种明确的 **类型**（*type*），这告诉了 Rust 它被指定为何种数据，以便明确其处理方式。本部分我们将看到一系列内建于语言中的类型。我们将其分为两类：标量（scalar）和复合（compound）。

Rust 是 **静态类型**（*statically typed*）语言，也就是说在编译时就必须知道所有变量的类型，这一点将贯穿整个章节。通过值的形式及其使用方式，编译器通常可以推断出我们想要用的类型。多种类型均有可能时，比如第二章中使用 `parse` 将 `String` 转换为数字时，必须增加类型注解，像这样：

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

这里如果不添加类型注解，Rust 会显示如下错误，这说明编译器需要更多信息，来了解我们想要的类型：

```text
error[E0282]: type annotations needed
 --> src/main.rs:2:9
  |
2 |     let guess = "42".parse().expect("Not a number!");
  |         ^^^^^
  |         |
  |         cannot infer type for `_`
  |         consider giving `guess` a type
```

在我们讨论各种数据类型时，你会看到不同的类型注解。

### 标量类型

**标量**（*scalar*）类型代表一个单独的值。Rust 有四种基本的标量类型：整型、浮点型、布尔类型和字符类型。你可能在其他语言中见过它们，不过让我们深入了解它们在 Rust 中是如何工作的。

#### 整型

**整数** 是一个没有小数部分的数字。我们在这一章的前面使用过 `u32` 类型。该类型声明表明，u32 关联的值应该是一个占据 32 比特位的无符号整数（有符号整型类型以 `i` 开头而不是 `u`）。表格 3-1 展示了 Rust 内建的整数类型。每一种变体都有符号和无符号列（例如，*i8*）可以用来声明对应的整数值。

<span class="caption">表格 3-1: Rust 中的整型</span>

| 长度 | 有符号 | 无符号 |
|--------|--------|----------|
| 8-bit  | i8     | u8       |
| 16-bit | i16    | u16      |
| 32-bit | i32    | u32      |
| 64-bit | i64    | u64      |
| arch   | isize  | usize    |

每一种变体都可以是有符号或无符号的，并有一个明确的大小。有符号和无符号代表数字能否为负值；换句话说，数字是否需要有一个符号（有符号数），或者永远为正而不需要符号（无符号数）。这有点像在纸上书写数字：当需要考虑符号的时候，数字以加号或减号作为前缀；然而，可以安全地假设为正数时，加号前缀通常省略。有符号数以二进制补码形式（two’s complement representation）存储（如果你不清楚这是什么，可以在网上搜索；对其的解释超出了本书的范畴）。

每一个有符号的变体可以储存包含从 -(2<sup>n - 1</sup>) 到 2<sup>n - 1</sup> - 1 在内的数字，这里 `n` 是变体使用的位数。所以 `i8` 可以储存从 -(2<sup>7</sup>) 到 2<sup>7</sup> - 1 在内的数字，也就是从 -128 到 127。无符号的变体可以储存从 0 到 2<sup>n</sup> - 1 的数字，所以 `u8` 可以储存从 0 到 2<sup>8</sup> - 1 的数字，也就是从 0 到 255。

另外，`isize` 和 `usize` 类型依赖运行程序的计算机架构：64 位架构上它们是 64 位的， 32 位架构上它们是 32 位的。

可以使用表格 3-2 中的任何一种形式编写数字字面值。注意除 byte 以外的其它字面值允许使用类型后缀，例如 `57u8`，同时也允许使用 `_` 做为分隔符以方便读数，例如`1_000`。

<span class="caption">表格 3-2: Rust 中的整型字面值</span>

| 数字字面值  | 例子       |
|------------------|---------------|
| Decimal          | `98_222`      |
| Hex              | `0xff`        |
| Octal            | `0o77`        |
| Binary           | `0b1111_0000` |
| Byte (`u8` only) | `b'A'`        |

那么该使用哪种类型的数字呢？如果拿不定主意，Rust 的默认类型通常就很好，数字类型默认是 `i32`：它通常是最快的，甚至在 64 位系统上也是。`isize` 或 `usize` 主要作为某些集合的索引。

#### 浮点型

Rust 同样有两个主要的 **浮点数**（*floating-point numbers*）类型，`f32` 和 `f64`，它们是带小数点的数字，分别占 32 位和 64 位比特。默认类型是 `f64`，因为在现代 CPU 中它与 `f32` 速度几乎一样，不过精度更高。

这是一个展示浮点数的实例：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 2.0; // f64

    let y: f32 = 3.0; // f32
}
```

浮点数采用 IEEE-754 标准表示。`f32` 是单精度浮点数，`f64` 是双精度浮点数。

#### 数字运算符

Rust 支持所有数字类型常见的基本数学运算操作：加法、减法、乘法、除法以及取余。下面的代码展示了如何在一个 `let` 语句中使用它们：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    // addition
    let sum = 5 + 10;

    // subtraction
    let difference = 95.5 - 4.3;

    // multiplication
    let product = 4 * 30;

    // division
    let quotient = 56.7 / 32.2;

    // remainder
    let remainder = 43 % 5;
}
```

这些语句中的每个表达式使用了一个数学运算符并计算出了一个值，它们绑定到了一个变量。附录 B 包含了一个 Rust 提供的所有运算符的列表。

#### 布尔型

正如其他大部分编程语言一样，Rust 中的布尔类型有两个可能的值：`true` 和 `false`。Rust 中的布尔类型使用 `bool` 表示。例如：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let t = true;

    let f: bool = false; // with explicit type annotation
}
```

使用布尔值的主要场景是条件表达式，例如 `if` 表达式。在 “控制流”（“Control Flow”）部分将讲到 `if` 表达式在 Rust 中如何工作。

#### 字符类型

目前为止只使用到了数字，不过 Rust 也支持字符。Rust 的 `char` 类型是大部分语言中基本字母字符类型，如下代码展示了如何使用它。注意 `char` 由单引号指定，不同于字符串使用双引号：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
   let c = 'z';
   let z = 'ℤ';
   let heart_eyed_cat = '😻';
}
```

Rust 的 `char` 类型代表了一个 Unicode 标量值（Unicode Scalar Value），这意味着它可以比 ASCII 表示更多内容。拼音字母（Accented letters），中文/日文/韩文等象形文字，emoji（絵文字）以及零长度的空白字符对于 Rust `char` 类型都是有效的。Unicode 标量值包含从 `U+0000` 到 `U+D7FF` 和 `U+E000` 到 `U+10FFFF` 在内的值。不过，“字符” 并不是一个 Unicode 中的概念，所以人直觉上的 “字符” 可能与 Rust 中的 `char` 并不符合。第八章的 “字符串” 部分将详细讨论这个主题。

### 复合类型

**复合类型**（*Compound types*）可以将多个其他类型的值组合成一个类型。Rust 有两个原生的复合类型：元组（tuple）和数组（array）。

#### 将值组合进元组

元组是一个将多个其他类型的值组合进一个复合类型的主要方式。

我们使用一个括号中的逗号分隔的值列表来创建一个元组。元组中的每一个位置都有一个类型，而且这些不同值的类型也不必是相同的。这个例子中使用了额外的可选类型注解：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

`tup` 变量绑定了整个元组，因为元组被认为是一个单独的复合元素。为了从元组中获取单个的值，可以使用模式匹配（pattern matching）来解构（destructure）元组，像这样：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let tup = (500, 6.4, 1);

    let (x, y, z) = tup;

    println!("The value of y is: {}", y);
}
```

程序首先创建了一个元组并绑定到 `tup` 变量上。接着使用了 `let` 和一个模式将 `tup` 分成了三个不同的变量，`x`、`y` 和 `z`。这叫做 **解构**（*destructuring*），因为它将一个元组拆成了三个部分。最后，程序打印出了 `y` 的值，也就是 `6.4`。

除了使用模式匹配解构之外，也可以使用点号（`.`）后跟值的索引来直接访问它们。例如：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x: (i32, f64, u8) = (500, 6.4, 1);

    let five_hundred = x.0;

    let six_point_four = x.1;

    let one = x.2;
}
```

这个程序创建了一个元组，`x`，并接着使用索引为每个元素创建新变量。跟大多数编程语言一样，元组的第一个索引值是 0。

#### 数组

另一个获取一个多个值集合的方式是 **数组**（*array*）。与元组不同，数组中的每个元素的类型必须相同。Rust 中的数组与一些其他语言中的数组不同，因为 Rust 中的数组是固定长度的：一旦声明，它们的长度不能增长或缩小。

Rust 中数组的值位于中括号中的逗号分隔的列表中：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
}
```

当你想要在栈（stack）而不是在堆（heap）上为数据分配空间（第四章将讨论栈与堆的更多内容），或者是想要确保总是有固定数量的元素时，数组非常有用，虽然它并不如 vector 类型那么灵活。vector 类型是标准库提供的一个 **允许** 增长和缩小长度的类似数组的集合类型。当不确定是应该使用数组还是 vector 的时候，你可能应该使用 vector。第八章会详细讨论 vector。

一个你可能想要使用数组而不是 vector 的例子是，当程序需要知道一年中月份的名字时，程序不大可能会去增加或减少月份。这时你可以使用数组，因为我们知道它总是含有 12 个元素：

```rust
let months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];
```

##### 访问数组元素

数组是一整块分配在栈上的内存。可以使用索引来访问数组的元素，像这样：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];

    let first = a[0];
    let second = a[1];
}
```

在这个例子中，叫做 `first` 的变量的值是 `1`，因为它是数组索引 `[0]` 的值。变量 `second` 将会是数组索引 `[1]` 的值 `2`。

##### 无效的数组元素访问

如果我们访问数组结尾之后的元素会发生什么呢？比如我们将上面的例子改成下面这样，这可以编译不过在运行时会因错误而退出：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let a = [1, 2, 3, 4, 5];
    let index = 10;

    let element = a[index];

    println!("The value of element is: {}", element);
}
```

使用 `cargo run` 运行代码后会产生如下结果：

```text
$ cargo run
   Compiling arrays v0.1.0 (file:///projects/arrays)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/arrays`
thread '<main>' panicked at 'index out of bounds: the len is 5 but the index is
 10', src/main.rs:6
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

编译并没有产生任何错误，不过程序会导致一个 **运行时**（*runtime*）错误并且不会成功退出。当尝试用索引访问一个元素时，Rust 会检查指定的索引是否小于数组的长度。如果索引超出了数组长度，Rust 会 *panic*，这是 Rust 中的术语，它用于程序因为错误而退出的情况。

这是第一个在实战中遇到的 Rust 安全原则的例子。在很多底层语言中，并没有进行这类检查，这样当提供了一个不正确的索引时，就会访问无效的内存。Rust 通过立即退出而不是允许内存访问并继续执行来使你免受这类错误困扰。第九章会讨论更多 Rust 的错误处理。
