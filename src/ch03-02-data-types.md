## 数据类型

[ch03-02-data-types.md](https://github.com/rust-lang/book/blob/9cc190796f28505c7a9a9cacea42f50d895ff3bd/src/ch03-02-data-types.md)

在 Rust 中，每个值都属于某种特定的 **数据类型**（*data type*），这会告诉 Rust 当前指定的是什么种类的数据，从而知道该如何处理这些数据。我们将看到两类数据类型的子集：标量（scalar）和复合（compound）。

记住，Rust 是 **静态类型**（*statically typed*）语言，也就是说，它必须在编译时就知道所有变量的类型。编译器通常可以根据值以及它的使用方式推断出我们想要使用的类型。但在存在多种可能类型的情况下，比如我们在第二章[“比较猜测的数字和秘密数字”][comparing-the-guess-to-the-secret-number]一节中使用 `parse` 将 `String` 转换为数值类型时，就必须加上类型注解，像这样：

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

如果不按前面的代码那样加上 `: u32` 类型注解，Rust 就会显示如下错误。这说明编译器需要我们提供更多信息，才能知道我们想使用哪一种类型：

```console
{{#include ../listings/ch03-common-programming-concepts/output-only-01-no-type-annotations/output.txt}}
```

你会看到其它数据类型的各种类型注解。

### 标量类型

**标量**（*scalar*）类型代表一个单独的值。Rust 有四种基本的标量类型：整型、浮点型、布尔类型和字符类型。你可能在其他语言中见过它们。让我们深入了解它们在 Rust 中是如何工作的。

#### 整型

**整型** 是没有小数部分的数字。我们在第二章已经用过 `u32` 这种整数类型。这个类型声明表明，它关联的值应该是一个占用 32 位空间的无符号整数（有符号整数类型以 `i` 开头，而不是 `u`）。表格 3-1 展示了 Rust 内建的整数类型。我们可以使用其中任意一种来声明整数值的类型。

<span class="caption">表格 3-1: Rust 中的整型</span>

| 长度 | 有符号 | 无符号 |
|------|--------|--------|
| 8-bit | `i8` | `u8` |
| 16-bit | `i16` | `u16` |
| 32-bit | `i32` | `u32` |
| 64-bit | `i64` | `u64` |
| 128-bit | `i128` | `u128` |
| 架构相关 | `isize` | `usize` |

每一种变体都可以是有符号或无符号的，并且具有明确的大小。**有符号** 和 **无符号** 指的是数字是否可能为负数。换句话说，这个数字是需要带符号的（有符号），还是它永远为正，因此无需符号（无符号）。这有点像我们在纸上写数字：当符号有意义时，数字前面会带上加号或减号；但如果可以安全地假定它是正数，通常就不会写加号。有符号数使用[二进制补码（two’s complement）][twos-complement]表示。

每一个有符号的变体可以储存包含从 -(2<sup>n - 1</sup>) 到 2<sup>n - 1</sup> - 1 在内的数字，这里 *n* 是变体使用的位数。所以 `i8` 可以储存从 -(2<sup>7</sup>) 到 2<sup>7</sup> - 1 在内的数字，也就是从 -128 到 127。无符号的变体可以储存从 0 到 2<sup>n</sup> - 1 的数字，所以 `u8` 可以储存从 0 到 2<sup>8</sup> - 1 的数字，也就是从 0 到 255。

另外，`isize` 和 `usize` 类型依赖运行程序的计算机架构：64 位架构上它们是 64 位的，32 位架构上它们是 32 位的。

你可以使用表格 3-2 中展示的任意一种形式来编写整数字面值。请注意，那些可能对应多种数值类型的数字字面值可以带上类型后缀，例如 `57u8`，用来显式指定类型。数字字面值也可以使用 `_` 作为视觉分隔符，方便阅读，例如 `1_000`，它和 `1000` 的值完全相同。

<span class="caption">表格 3-2: Rust 中的整型字面值</span>

| 数字字面值 | 例子 |
|------------|------|
| Decimal（十进制） | `98_222` |
| Hex（十六进制） | `0xff` |
| Octal（八进制） | `0o77` |
| Binary（二进制） | `0b1111_0000` |
| Byte（字节字面值，仅限 `u8`） | `b'A'` |

那么该使用哪种整型呢？如果拿不定主意，Rust 的默认类型通常是一个不错的起点：整型默认是 `i32`。而 `isize` 和 `usize` 主要用在对某种集合进行索引的场景中。

> ##### 整型溢出
>
> 假设你有一个 `u8` 类型的变量，它可以保存 `0` 到 `255` 之间的值。如果你试图把它改成超出该范围的值，比如 `256`，就会发生 **整型溢出**（*integer overflow*），并可能导致两种行为之一。当你在 debug 模式下编译时，Rust 会加入整型溢出的检查，并在发生这种情况时让程序在运行时 *panic*。Rust 用 *panicking* 这个术语表示程序因错误而退出；我们会在第九章[“`panic!` 与不可恢复的错误”][unrecoverable-errors-with-panic]一节中更深入地讨论 panic。
>
> 当你使用 `--release` flag 在 release 模式下编译时，Rust **不会**加入会导致 panic 的整型溢出检查。相反，如果发生溢出，Rust 会执行一种叫做 *two’s complement wrapping* 的行为。简而言之，超过该类型最大值的数会“回绕”到该类型所能表示的最小值。对于 `u8` 来说，`256` 会变成 `0`，`257` 会变成 `1`，依此类推。程序不会 panic，但变量得到的值很可能不是你原本期望的值。依赖整型溢出的回绕行为通常被认为是一种错误。
>
> 为了显式地处理溢出的可能性，可以使用这几类标准库提供的原始数字类型方法：
> * 所有模式下都可以使用 `wrapping_*` 方法进行 wrapping，如 `wrapping_add`
> * 如果 `checked_*` 方法发生溢出，则返回 `None` 值
> * 用 `overflowing_*` 方法返回值和一个布尔值，表示是否出现溢出
> * 用 `saturating_*` 方法在值的最小值或最大值处进行饱和处理

#### 浮点型

Rust 也有两个原生的 **浮点数**（*floating-point numbers*）类型，它们是带小数点的数字。Rust 的浮点数类型是 `f32` 和 `f64`，分别占 32 位和 64 位。默认类型是 `f64`，因为在现代 CPU 中，它与 `f32` 速度几乎一样，不过精度更高。所有的浮点型都是有符号的。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-06-floating-point/src/main.rs}}
```

浮点数按照 IEEE-754 标准表示。

#### 数值运算

Rust 中的所有数字类型都支持基本数学运算：加法、减法、乘法、除法和取余。整数除法会向零舍入到最接近的整数。下面的代码展示了如何在 `let` 语句中使用各种数值运算：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-07-numeric-operations/src/main.rs}}
```

这些语句中的每个表达式使用了一个数学运算符并计算出了一个值，然后绑定给一个变量。[附录 B][appendix_b]<!-- ignore --> 包含 Rust 提供的所有运算符的列表。

#### 布尔类型

正如其他大部分编程语言一样，Rust 中的布尔类型有两个可能的值：`true` 和 `false`。Rust 中的布尔类型使用 `bool` 表示。例如：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-08-boolean/src/main.rs}}
```

布尔值最主要的使用场景是条件表达式，例如 `if` 表达式。我们会在[“控制流”][control-flow]一节介绍 `if` 表达式在 Rust 中是如何工作的。

#### 字符类型

Rust 的 `char` 类型是语言中最原始的字母类型。下面是一些声明 `char` 值的例子：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-09-char/src/main.rs}}
```

注意，我们使用单引号来表示 `char` 字面值，而字符串字面值使用的是双引号。Rust 的 `char` 类型大小为 4 个字节，并表示一个 Unicode 标量值（Unicode Scalar Value），这意味着它所能表示的内容远不止 ASCII。带重音符号的字母，中文、日文、韩文字符，emoji，以及零宽空格，都是 Rust 中合法的 `char` 值。Unicode 标量值的范围包括 `U+0000` 到 `U+D7FF`，以及 `U+E000` 到 `U+10FFFF`。不过，“字符”并不是 Unicode 中一个严格对应的概念，因此你直觉上认为的“字符”未必和 Rust 中的 `char` 一一对应。我们会在第八章[“使用字符串储存 UTF-8 编码的文本”][strings]中更详细地讨论这个主题。

### 复合类型

**复合类型**（*compound types*）可以把多个值组合成一个类型。Rust 有两种原生的复合类型：元组（tuple）和数组（array）。

#### 元组类型

元组是一种将多个不同类型的值组合成一个复合类型的通用方式。元组长度固定：一旦声明，它的大小就不能增长或缩小。

我们通过在圆括号中写一组由逗号分隔的值来创建元组。元组中的每个位置都有一个类型，而且这些不同位置上的值类型不必相同。下面这个例子中加入了可选的类型注解：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-10-tuples/src/main.rs}}
```

变量 `tup` 绑定到整个元组上，因为元组本身会被视为一个单独的复合值。为了从元组中取出单个值，我们可以使用模式匹配（pattern matching）来解构（destructure）元组，像这样：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-11-destructuring-tuples/src/main.rs}}
```

程序首先创建了一个元组并绑定到 `tup` 变量上。接着使用了 `let` 和一个模式将 `tup` 分成了三个不同的变量，`x`、`y` 和 `z`。这叫做 **解构**（*destructuring*），因为它将一个元组拆成了三个部分。最后，程序打印出了 `y` 的值，也就是 `6.4`。

我们也可以使用点号（`.`）后跟值的索引来直接访问所需的元组元素。例如：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-12-tuple-indexing/src/main.rs}}
```

这个程序创建了一个元组，`x`，然后使用其各自的索引访问元组中的每个元素。跟大多数编程语言一样，元组的第一个索引值是 0。

不带任何值的元组有一个特殊名字，叫做 **单元（unit）**。这种值以及其对应的类型都写作 `()`，表示空值或空的返回类型。如果一个表达式没有返回任何其他值，它就会隐式返回单元值。

#### 数组类型

另一种包含多个值的方式是 **数组**（*array*）。和元组不同，数组中的每个元素都必须具有相同类型。Rust 中的数组也不同于某些其他语言中的数组：Rust 的数组长度是固定的。

我们将数组的值写成在方括号内，用逗号分隔的列表：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-13-arrays/src/main.rs}}
```

当你希望把数据分配在栈（stack）上而不是堆（heap）上时（[第四章][stack-and-heap]会更详细地讨论栈与堆），或者当你想确保始终拥有固定数量的元素时，数组就非常有用。不过，数组不如 vector 类型灵活。vector 是标准库提供的一种类似数组的集合类型，它 **允许** 长度增长或缩小。如果你不确定该用数组还是 vector，那么很可能你应该用 vector。[第八章][vectors]会更详细地讨论 vector。

不过，当你明确知道元素个数不会变化时，数组就更有用。例如，如果你在程序中使用月份名称，那么你大概会选择数组而不是 vector，因为你知道它始终只有 12 个元素。

```rust
let months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];
```

可以像这样编写数组的类型：在方括号中包含每个元素的类型，后跟分号，再后跟数组元素的数量。

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];
```

这里，`i32` 是每个元素的类型。分号之后，数字 `5` 表明该数组包含五个元素。

你还可以通过在方括号中指定初始值加分号再加元素个数的方式来创建一个每个元素都为相同值的数组：

```rust
let a = [3; 5];
```

变量名为 `a` 的数组将包含 `5` 个元素，这些元素的值最初都将被设置为 `3`。这种写法与 `let a = [3, 3, 3, 3, 3];` 效果相同，但更简洁。

##### 访问数组元素

数组是在栈（stack）上分配的一整块、大小已知且固定的内存。你可以像下面这样使用索引来访问数组中的元素：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-14-array-indexing/src/main.rs}}
```

在这个例子中，叫做 `first` 的变量的值是 `1`，因为它是数组索引 `[0]` 的值。变量 `second` 将会是数组索引 `[1]` 的值 `2`。

##### 无效的数组元素访问

让我们看看如果尝试访问数组末尾之后的元素会发生什么。假设你运行下面这段代码，它类似于第 2 章中的猜数字游戏：从用户那里读取一个数组索引。

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,panics
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-15-invalid-array-access/src/main.rs}}
```

这段代码能够成功编译。如果你用 `cargo run` 运行它，并输入 `0`、`1`、`2`、`3` 或 `4`，程序就会打印出数组中对应索引位置的值。相反，如果你输入一个超出数组末尾的数字，比如 `10`，你就会看到像下面这样的输出：

```console
thread 'main' panicked at src/main.rs:19:19:
index out of bounds: the len is 5 but the index is 10
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

程序在索引操作中使用了无效值，因此产生了一个 **运行时** 错误。程序带着错误信息退出，并且没有执行最后那条 `println!` 语句。当你尝试通过索引访问元素时，Rust 会检查你指定的索引是否小于数组长度。如果索引大于或等于数组长度，Rust 就会 *panic*。这种检查必须在运行时完成，尤其是在这种场景下，因为编译器不可能知道用户之后运行代码时会输入什么值。

这是 Rust 内存安全原则在实践中的一个例子。在许多底层语言中，不会进行这种检查，因此如果你提供了错误的索引，就可能访问到无效内存。Rust 通过立即退出，而不是允许这次内存访问继续发生并让程序往下执行，来保护你免受这类错误的影响。第九章会更详细地讨论 Rust 的错误处理机制，以及如何编写既可读又安全的代码，让程序既不会 panic，也不会发生非法内存访问。

[comparing-the-guess-to-the-secret-number]:
ch02-00-guessing-game-tutorial.html#比较猜测的数字和秘密数字
[twos-complement]: https://en.wikipedia.org/wiki/Two%27s_complement
[control-flow]: ch03-05-control-flow.html#控制流
[strings]: ch08-02-strings.html#使用字符串储存-utf-8-编码的文本
[stack-and-heap]: ch04-01-what-is-ownership.html#栈stack与堆heap
[vectors]: ch08-01-vectors.html
[unrecoverable-errors-with-panic]: ch09-01-unrecoverable-errors-with-panic.html
[appendix_b]: appendix-02-operators.html
