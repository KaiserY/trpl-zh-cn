## 函数如何工作

> [ch03-03-how-functions-work.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch03-03-how-functions-work.md)
> <br>
> commit 6aad5008b69078a2fc18e6dd7e00ef395170c749

函数在 Rust 代码中应用广泛。你已经见过一个语言中最重要的函数：`main` 函数，它是很多程序的入口点。你也见过了 `fn` 关键字，它用来声明新函数。

Rust 代码使用 *snake case* 作为函数和变量名称的规范风格。在 snake case 中，所有字母都是小写并使用下划线分隔单词。这里是一个包含函数定义的程序的例子：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}
```

Rust 中的函数定义以 `fn` 开始并在函数名后跟一对括号。大括号告诉编译器哪里是函数体的开始和结尾。

可以使用定义过的函数名后跟括号来调用任意函数。因为 `another_function` 已经在程序中定义过了，它可以在 `main` 函数中被调用。注意，源码中 `another_function` 在 `main` 函数 **之后** 被定义；也可以在其之前定义。Rust 不关心函数定义于何处，只要它们被定义了。

让我们开始一个叫做 *functions* 的新二进制项目来进一步探索函数。将上面的 `another_function` 例子写入 *src/main.rs* 中并运行。你应该会看到如下输出：

```text
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished dev [unoptimized + debuginfo] target(s) in 0.28 secs
     Running `target/debug/functions`
Hello, world!
Another function.
```

代码在 `main` 函数中按照它们出现的顺序被执行。首先，打印 “Hello, world!” 信息，接着 `another_function` 被调用并打印它的信息。

### 函数参数

函数也可以被定义为拥有 **参数**（*parameters*），它们是作为函数签名一部分的特殊变量。当函数拥有参数时，可以为这些参数提供具体的值。技术上讲，这些具体值被称为参数（*arguments*），不过通常的习惯是倾向于在函数定义中的变量和调用函数时传递的具体值都可以用 “parameter” 和 “argument” 而不加区别。

如下被重写的 `another_function` 版本展示了 Rust 中参数是什么样的：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {}", x);
}
```

尝试运行程序，将会得到如下输出：

```text
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished dev [unoptimized + debuginfo] target(s) in 1.21 secs
     Running `target/debug/functions`
The value of x is: 5
```

`another_function` 的声明有一个叫做 `x` 的参数。`x` 的类型被指定为 `i32`。当 `5` 被传递给 `another_function` 时，`println!` 宏将 `5` 放入格式化字符串中大括号的位置。

在函数签名中 **必须** 声明每个参数的类型。这是 Rust 设计中一个经过慎重考虑的决定：要求在函数定义中提供类型注解意味着编译器不需要在别的地方要求你注明类型就能知道你的意图。

当一个函数有多个参数时，使用逗号隔开它们，像这样：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    another_function(5, 6);
}

fn another_function(x: i32, y: i32) {
    println!("The value of x is: {}", x);
    println!("The value of y is: {}", y);
}
```

这个例子创建了一个有两个参数的函数，都是 `i32` 类型的。函数打印出了这两个参数的值。注意函数参数并不一定都是相同类型的，这个例子中它们只是碰巧相同罢了。

尝试运行代码。使用上面的例子替换当前 *functions* 项目的 *src/main.rs* 文件，并用 `cargo run` 运行它：

```text
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/functions`
The value of x is: 5
The value of y is: 6
```

因为我们使用 `5` 作为 `x` 的值 `6` 作为 `y` 的值来调用函数，这两个字符串和它们的值被相应打印出来。

### 函数体

函数体由一系列的语句和一个可选的表达式构成。目前为止，我们只涉及到了没有结尾表达式的函数，不过我们见过表达式作为了语句的一部分。因为 Rust 是一个基于表达式（expression-based）的语言，这是一个需要理解的（不同于其他语言）重要区别。其他语言并没有这样的区别，所以让我们看看语句与表达式有什么区别以及它们是如何影响函数体的。

### 语句与表达式

我们已经用过语句与表达式了。**语句**（*Statements*）是执行一些操作但不返回值的指令。表达式（*Expressions*）计算并产生一个值。让我们看一些例子：

使用 `let` 关键字创建变量并绑定一个值是一个语句。在列表 3-1 中，`let y = 6;` 是一个语句：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let y = 6;
}
```

<span class="caption">列表 3-1：包含一个语句的 `main` 函数定义</span>

函数定义也是语句，上面整个例子本身就是一个语句。

语句并不返回值。因此，不能把 `let` 语句赋值给另一个变量，比如下面的例子尝试做的，这会产生一个错误：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = (let y = 6);
}
```

当运行这个程序，会得到如下错误：

```text
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
error: expected expression, found statement (`let`)
 --> src/main.rs:2:14
  |
2 |     let x = (let y = 6);
  |              ^^^
  |
  = note: variable declaration using `let` is a statement
```

`let y = 6` 语句并不返回值，所以并没有 `x` 可以绑定的值。这与其他语言不同，例如 C 和 Ruby，它们的赋值语句返回所赋的值。在这些语言中，可以这么写 `x = y = 6` 这样 `x` 和 `y` 的值都是 `6`；这在 Rust 中可不行。

表达式计算出一些值，而且它们组成了其余大部分你将会编写的 Rust 代码。考虑一个简单的数学运算，比如 `5 + 6`，这是一个表达式并计算出值 `11`。表达式可以是语句的一部分：在列表 3-3 中有这个语句 `let y = 6;`，`6` 是一个表达式，它计算出的值是 `6`。函数调用是一个表达式。宏调用是一个表达式。我们用来创建新作用域的大括号（代码块），`{}`，也是一个表达式，例如：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 5;

    let y = {
        let x = 3;
        x + 1
    };

    println!("The value of y is: {}", y);
}
```

这个表达式：

```rust,ignore
{
    let x = 3;
    x + 1
}
```

是一个代码块，它的值是 `4`。这个值作为 `let` 语句的一部分被绑定到 `y` 上。注意结尾没有分号的那一行，与大部分我们见过的代码行不同。表达式并不包含结尾的分号。如果在表达式的结尾加上分号，他就变成了语句，这也就使其不返回一个值。在接下来的探索中记住函数和表达式都返回值就行了。

### 函数的返回值

函数可以向调用它的代码返回值。我们并不对返回值命名，不过会在一个箭头（`->`）后声明它的类型。在 Rust 中，函数的返回值等同于函数体最后一个表达式的值。这是一个有返回值的函数的例子：

<span class="filename">文件名: src/main.rs</span>

```rust
fn five() -> i32 {
    5
}

fn main() {
    let x = five();

    println!("The value of x is: {}", x);
}
```

在函数 `five` 中并没有函数调用、宏、甚至也没有 `let` 语句————只有数字 `5` 自身。这在 Rust 中是一个完全有效的函数。注意函数的返回值类型也被指定了，就是 `-> i32`。尝试运行代码；输出应该看起来像这样：

```text
$ cargo run
   Compiling functions v0.1.0 (file:///projects/functions)
    Finished dev [unoptimized + debuginfo] target(s) in 0.30 secs
     Running `target/debug/functions`
The value of x is: 5
```

函数 `five` 的返回值是 `5`，也就是为什么返回值类型是 `i32`。让我们仔细检查一下这段代码。这有两个重要的部分：首先，`let x = five();` 这一行表明我们使用函数的返回值来初始化了一个变量。因为函数 `five` 返回 `5`，这一行与如下这行相同：

```rust
let x = 5;
```

其次，函数 `five` 没有参数并定义了返回值类型，不过函数体只有单单一个 `5` 也没有分号，因为这是我们想要返回值的表达式。让我们看看另一个例子：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = plus_one(5);

    println!("The value of x is: {}", x);
}

fn plus_one(x: i32) -> i32 {
    x + 1
}
```

运行代码会打印出 `The value of x is: 6`。如果在包含 `x + 1` 的那一行的结尾加上一个分号，把它从表达式变成语句后会怎样呢？

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = plus_one(5);

    println!("The value of x is: {}", x);
}

fn plus_one(x: i32) -> i32 {
    x + 1;
}
```

运行代码会产生一个错误，如下：

```text
error[E0308]: mismatched types
 --> src/main.rs:7:28
  |
7 |   fn plus_one(x: i32) -> i32 {
  |  ____________________________^
8 | |     x + 1;
  | |          - help: consider removing this semicolon
9 | | }
  | |_^ expected i32, found ()
  |
  = note: expected type `i32`
             found type `()`
```

主要的错误信息，“mismatched types”（类型不匹配），揭示了代码的核心问题。函数 `plus_one` 的定义说明它要返回一个 `i32`，不过语句并不返回一个值，这由那个空元组 `()` 表明。因此，这个函数返回了空元组 `()`，这与函数定义相矛盾并导致一个错误。在输出中，Rust 提供了一个可能会对修正问题有帮助的信息：它建议去掉分号，这会修复这个错误。
