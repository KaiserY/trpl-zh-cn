## 变量和可变性

> [ch03-01-variables-and-mutability.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch03-01-variables-and-mutability.md)
> <br>
> commit 6aad5008b69078a2fc18e6dd7e00ef395170c749

第二章中提到过，变量默认是 **不可变**（*immutable*）的。这是鼓励你利用 Rust 安全和简单并发的优势来编写代码的一大助力。不过，你仍然可以使用可变变量。让我们探讨一下 Rust 拥抱不可变性的原因及方法，以及何时你不想使用不可变性。

当变量不可变时，意味着一旦值被绑定上一个名称，你就不能改变这个值。作为说明，通过 `cargo new --bin variables` 在 *projects* 目录生成一个叫做 *variables* 的新项目。

接着，在新建的 *variables* 目录，打开 *src/main.rs* 并替换其代码为如下：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

保存并使用 `cargo run` 运行程序。应该会看到一个错误信息，如下输出所示：

```text
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         - first assignment to `x`
3 |     println!("The value of x is: {}", x);
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable
```

这个例子展示了编译器如何帮助你找出程序中的错误。虽然编译错误令人沮丧，那也不过是说程序不能安全的完成你想让它完成的工作；而 **不能** 说明你是不是一个好程序员！有经验的 Rustacean 们一样会遇到编译错误。

这些错误给出的原因是 `不能对不可变变量二次赋值`（`cannot assign twice to immutable variable x`），因为我们尝试对不可变变量 `x` 赋第二个值。

在尝试改变预设为不可变的值的时候产生编译错误是很重要的，因为这种情况可能导致 bug：如果代码的一部分假设一个值永远也不会改变，而另一部分代码改变了它，第一部分代码就有可能以不可预料的方式运行。不得不承认这种 bug 难以跟踪，尤其是第二部分代码只是 **有时** 改变其值的时候。

Rust 编译器保证，如果声明一个值不会变，它就真的不会变。这意味着当阅读和编写代码时，不需要追踪一个值如何以及哪里可能会被改变，从而使得代码易于推导。

不过可变性也是非常有用的。变量只是默认不可变，可以通过在变量名之前加 `mut` 来使其可变。除了使值可以改变之外，它向读者表明了其他代码将会改变这个变量的意图。

例如，改变 *src/main.rs* 并替换其代码为如下：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

当运行这个程序，出现如下：

```text
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished dev [unoptimized + debuginfo] target(s) in 0.30 secs
     Running `target/debug/variables`
The value of x is: 5
The value of x is: 6
```

通过 `mut`，允许把绑定到 `x` 的值从 `5` 改成 `6`。在一些情况下，你会想用可变变量，因为这样的代码比起只用不可变变量的实现更容易编写。

除了避免 bug 外，还有很多地方需要权衡取舍。例如，使用大型数据结构时，适当地使用可变变量，可能比复制和返回新分配的实例更快。对于较小的数据结构，总是创建新实例，采用更偏向函数式的风格编程，可能会使代码更易理解，为可读性而遭受性能惩罚或许值得。

### 变量和常量的区别

不允许改变值的变量，可能会使你想起另一个大部分编程语言都有的概念：**常量**（*constants*）。类似于不可变变量，常量也是绑定到一个名称的不允许改变的值，不过常量与变量还是有一些区别。

首先，不允许对常量使用 `mut`：常量不光默认不能变，它总是不能变。

声明常量使用 `const` 关键字而不是 `let`，并且 *必须* 注明值的类型。在下一部分，“数据类型” 中会涉及到类型和类型注解，现在无需关心这些细节，记住总是标注类型即可。

常量可以在任何作用域声明，包括全局作用域，这在一个值需要被很多部分的代码用到时很有用。

最后一个区别是常量只能用于常量表达式，而不能作为函数调用的结果，或任何其他只在运行时计算的值。

这是一个常量声明的例子，它的名称是 `MAX_POINTS`，值是 100,000。（Rust 的常量使用下划线分隔的大写字母的命名规范）：

```rust
const MAX_POINTS: u32 = 100_000;
```

在声明它的作用域之中，常量在整个程序生命周期中都有效，这使得常量可以作为多处代码使用的全局范围的值，例如一个游戏中所有玩家可以获取的最高分或者光速。

将用于整个程序的硬编码的值声明为常量对后来的维护者了解值的意义很有帮助。同时将硬编码的值汇总于一处，也能为将来修改提供方便。

### 隐藏（Shadowing）

如第二章 “猜猜看游戏” 所讲的，我们可以定义一个与之前变量重名的新变量，而新变量会 **隐藏** 之前的变量。Rustacean 们称之为第一个变量被第二个 **隐藏** 了，这意味着使用这个变量时会看到第二个值。可以用相同变量名称来隐藏它自己，以及重复使用 `let` 关键字来多次隐藏，如下所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 5;

    let x = x + 1;

    let x = x * 2;

    println!("The value of x is: {}", x);
}
```

这个程序首先将 `x` 绑定到值 `5` 上。接着通过 `let x =` 隐藏 `x`，获取原始值并加 `1` 这样 `x` 的值就变成 `6` 了。第三个 `let` 语句也隐藏了 `x`，获取之前的值并乘以 `2`，`x` 最终的值是 `12`。运行这个程序，它会有如下输出：

```text
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/variables`
The value of x is: 12
```

这与将变量声明为 `mut` 是有区别的。因为除非再次使用 `let` 关键字，不小心尝试对变量重新赋值会导致编译时错误。我们可以用这个值进行一些计算，不过计算完之后变量仍然是不变的。

`mut` 与隐藏的另一个区别是，当再次使用 `let` 时，实际上创建了一个新变量，我们可以改变值的类型，从而复用这个名字。例如，假设程序请求用户输入空格来提供文本间隔，然而我们真正需要的是将输入存储成数字（多少个空格）：

```rust
let spaces = "   ";
let spaces = spaces.len();
```

这里允许第一个 `spaces` 变量是字符串类型，而第二个 `spaces` 变量，它是一个恰巧与第一个变量同名的崭新变量，是数字类型。隐藏使我们不必使用不同的名字，如 `spaces_str` 和 `spaces_num`；相反，我们可以复用 `spaces` 这个更简单的名字。然而，如果尝试使用 `mut`，如下所示：

```rust,ignore
let mut spaces = "   ";
spaces = spaces.len();
```

会导致一个编译错误，因为改变一个变量的类型是不被允许的：

```text
error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected &str, found usize
  |
  = note: expected type `&str`
             found type `usize`
```

现在我们已经了解了变量如何工作，让我们再看看更多变量可以拥有的数据类型。
