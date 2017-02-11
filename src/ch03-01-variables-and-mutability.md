## 变量和可变性

> [ch03-01-variables-and-mutability.md](https://github.com/rust-lang/book/blob/master/src/ch03-01-variables-and-mutability.md)
> <br>
> commit b0fab378c9c6a817d4f0080d7001d085017cdef8

第二章中提到过，变量默认是*不可变*（*immutable*）的。这是 Rust 中许多鼓励以利用 Rust 提供的安全和简单并发优势编写代码的助力之一。不过，仍然有使变量可变的选项。让我们探索一下为什么以及如何鼓励你拥抱不可变性，还有为什么你可能想要弃之不用。

当变量使不可变时，这意味着一旦一个值被绑定上了一个名称，你就不能改变这个值。作为说明，通过`cargo new --bin variables`在 *projects* 目录生成一个叫做 *variables* 的新项目。

接着，在新建的 *variables* 目录，打开 *src/main.rs* 并替换其代码为如下：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

保存并使用`cargo run`运行程序。应该会看到一个错误信息，如下输出所示：

```sh
$ cargo run
   Compiling variables v0.0.1 (file:///projects/variables)
error[E0384]: re-assignment of immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         - first assignment to `x`
3 |     println!("The value of x is: {}", x);
4 |     x = 6;
  |     ^^^^^ re-assignment of immutable variable
```

这个例子显示了编译器如何帮助你寻找程序中的错误。即便编译器错误可能是令人沮丧的，他们也仅仅意味着程序不能安全的完成你想让它完成的工作；他们*不能*说明你不是一个好的程序员！有经验的 Rustacean 们也会遇到编译器错误。这些错误表明错误的原因是`对不可变变量重新赋值`（`re-assignment of immutable variable`），因为我们尝试对不可变变量`x`赋第二个值。

当尝试去改变之前设计为不可变的值出现编译时错误是很重要的，因为这种情况可能导致 bug。如果代码的一部分假设一个值永远也不会改变而另一部分代码改变了它，这样第一部分代码就有可能不能像它设计的那样运行。你必须承认这种 bug 难以跟踪，尤其是当第二部分代码只是*有时*当变量使不可变时，这意味着一旦一个值被绑定上了一个名称，你就不能改变这个值。

Rust 编译器保证如果声明一个值不会改变，它就真的不会改变。这意味着当阅读和编写代码时，并不需要记录如何以及在哪可能会被改变，这使得代码易于推导。

不过可变性也是非常有用的。变量只是默认不可变；可以通过在变量名之前增加`mut`来使其可变。它向之后的读者表明了其他部分的代码将会改变这个变量值的意图。

例如，改变 *src/main.rs* 并替换其代码为如下：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    x = 6;
    println!("The value of x is: {}", x);
}
```

当运行这个程序，出现如下：

```sh
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
     Running `target/debug/variables`
The value of x is: 5
The value of x is: 6
```

通过`mut`，允许把绑定到`x`的值从`5`改成`6`。在一些情况下，你会想要使一个变量可变，因为这比只使用不可变变量实现的代码更易于编写。

除了避免 bug 外，这里还有数个需要权衡取舍的地方。例如，有时使用大型数据结构时，适当地使变量可变可能比复制和返回新分配的实例要更快。对于较小的数据结构，总是创建新实例并采用一种更函数式的编程风格可能会使代码更易理解。所以为了可读性而造成的性能惩罚也许使值得的。

### 变量和常量的区别

不能改变一个变量的值可能会使你想起另一个大部分编程语言都有的概念：*常量*（*constants*）。常量也是绑定到一个名称的不允许改变的值，不过常量与变量还是有一些区别。首先，不允许对常量使用`mut`：常量不光是默认不能改变，它总是不能改变。常量使用`const`关键字而不是`let`关键字声明，而且*必须*注明值的类型。现在我们准备在下一部分，“数据类型”，涉及到类型和类型注解，所以现在无需担心这些细节。常量可以在任何作用域声明，包括全局作用域，这在一个值需要被很多部分的代码用到时很有用。最后一个区别是常量只能用于常量表达式，而不能作为函数调用的结果或任何其他只在运行时使用到的值。

这是一个常量声明的例子，它的名称是`MAX_POINTS`而它的值是 100,000。Rust 常量的命名规范是使用大写字母和单词间使用下划线：

```rust
const MAX_POINTS: u32 = 100_000;
```

常量在整个程序生命周期中都有效，位于它声明的作用域之中。这使得常量可以用作多个部分的代码可能需要知道的程序范围的值，例如一个游戏中任何玩家可以获得的最高分或者一年的秒数。

将用于整个程序的硬编码的值命名为常量（并编写文档）对为将来代码维护者表明值的意义是很有用的。它也能帮助你将硬编码的值至于一处以便将来可能需要修改他们。

### 覆盖

如第二章猜猜看游戏所讲到的，我们可以定义一个与之前变量名称相同的新变量，而新变量会*覆盖*之前的变量。Rustacean 们称其为第一个变量被第二个*给覆盖*了，这意味着第二个变量的值是使用这个变量时会看到的值。可以用相同变量名称来覆盖它自己以及重复使用`let`关键字来多次覆盖，如下所示：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let x = 5;

    let x = x + 1;

    let x = x * 2;

    println!("The value of x is: {}", x);
}
```

这个程序首先将`x`绑定到值`5`上。接着通过`let x =`覆盖`x`，获取原始值并加`1`这样`x`的值就变成`6`了。第三个`let`语句也覆盖了`x`，获取之前的值并乘以`2`，`x`的最终值是`12`。当运行这个程序，它会有如下输出：

```sh
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
     Running `target/debug/variables`
The value of x is: 12
```

这与将变量声明为`mut`是有区别的。因为除非再次使用`let`关键字，不小心尝试对变量重新赋值会导致编译时错误。我们可以用这个值进行一些计算，不过计算完之后变量仍然是不变的。

另一个`mut`与覆盖的区别是当再次使用`let`关键字时，事实上创建了一个新变量，我们可以改变值的类型。例如，假设程序请求用户输入空格来提供在一些文本之间需要多少空间来分隔，不过我们真正需要的是将输入存储成数字（多少个空格）：

```rust
let spaces = "   ";
let spaces = spaces.len();
```
这里允许第一个`spaces`变量是字符串类型，而第二个`spaces`变量，它是一个恰巧与第一个变量名字相同的崭新的变量，它是数字类型。因此覆盖使我们不必使用不同的名字，比如`spaces_str`和`spaces_num`；相反，我们可以复用`spaces`这个更简单的名称。然而，如果尝试使用`mut`，如下所示：

```rust,ignore
let mut spaces = "   ";
spaces = spaces.len();
```

会导致一个编译时错误，因为不允许改变一个变量的类型：

```sh
error[E0308]: mismatched types
 --> src/main.rs:3:14
  |
3 |     spaces = spaces.len();
  |              ^^^^^^^^^^^^ expected &str, found usize
  |
  = note: expected type `&str`
  = note:    found type `usize`
```

现在我们探索了变量如何工作，让我们看看他们能有多少数据类型。