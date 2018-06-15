## 控制流

> [ch03-05-control-flow.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch03-05-control-flow.md)
> <br>
> commit ec65990849230388e4ce4db5b7a0cb8a0f0d60e2

通过条件是不是为真来决定是否执行某些代码，或者根据条件是否为真来重复运行一段代码是大部分编程语言的基本组成部分。Rust 代码中最常见的用来控制执行流的结构是 `if` 表达式和循环。

### `if` 表达式

`if` 表达式允许根据条件执行不同的代码分支。我们提供一个条件并表示 “如果符合这个条件，运行这段代码。如果条件不满足，不运行这段代码。”

在 *projects* 目录创建一个叫做 *branches* 的新项目来学习 `if` 表达式。在 *src/main.rs* 文件中，输入如下内容：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

所有的 `if` 表达式都以 `if` 关键字开头，其后跟一个条件。在这个例子中，条件检查变量 `number` 是否有一个小于 5 的值。在条件为真时希望执行的代码块位于紧跟条件之后的大括号中。`if` 表达式中与条件关联的代码块有时被叫做 *arms*，就像第二章 “比较猜测与秘密数字” 部分中讨论到的 `match` 表达式中分支一样。也可以包含一个可选的 `else` 表达式来提供一个在条件为假时应当执行的代码块，这里我们就这么做了。如果不提供 `else` 表达式并且条件为假时，程序会直接忽略 `if` 代码块并继续执行下面的代码。

尝试运行代码，应该能看到如下输出：

```text
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/branches`
condition was true
```

尝试改变 `number` 的值使条件为假时看看会发生什么：

```rust,ignore
let number = 7;
```

再次运行程序并查看输出：

```text
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/branches`
condition was false
```

另外值得注意的是代码中的条件 **必须** 是 `bool` 值。如果想看看条件不是 `bool` 值时会发生什么，尝试运行如下代码：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let number = 3;

    if number {
        println!("number was three");
    }
}
```

这里 `if` 条件的值是 `3`，Rust 抛出了一个错误：

```text
error[E0308]: mismatched types
 --> src/main.rs:4:8
  |
4 |     if number {
  |        ^^^^^^ expected bool, found integral variable
  |
  = note: expected type `bool`
             found type `{integer}`
```

这个错误表明 Rust 期望一个 `bool` 不过却得到了一个整型。不像 Ruby 或 JavaScript 这样的语言，Rust 并不会尝试自动地将非布尔值转换为布尔值。必须总是显式地使用布尔值作为 `if` 的条件。例如，如果想要 `if` 代码块只在一个数字不等于 `0` 时执行，可以把 `if` 表达式修改成下面这样：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let number = 3;

    if number != 0 {
        println!("number was something other than zero");
    }
}
```

运行代码会打印出 `number was something other than zero`。

#### 使用 `else if` 实现多重条件

可以将 `else if` 表达式与 `if` 和 `else` 组合来实现多重条件。例如：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

这个程序有四个可能的执行路径。运行后应该能看到如下输出：

```text
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running `target/debug/branches`
number is divisible by 3
```

当执行这个程序，它按顺序检查每个 `if` 表达式并执行第一个条件为真的代码块。注意即使 6 可以被 2 整除，也不会出现 `number is divisible by 2` 的输出，更不会出现 `else` 块中的 `number is not divisible by 4, 3, or 2`。原因是 Rust 只会执行第一个条件为真的代码块，并且一旦它找到一个以后，甚至就不会检查剩下的条件了。

使用过多的 `else if` 表达式会使代码显得杂乱无章，所以如果有多于一个 `else if`，最好重构代码。为此第六章会介绍 Rust 中一个叫做 `match` 的强大的分支结构（branching construct）。

#### 在 `let` 语句中使用 `if`

因为 `if` 是一个表达式，我们可以在 `let` 语句的右侧使用它，例如在示例 3-2 中：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let condition = true;
    let number = if condition {
        5
    } else {
        6
    };

    println!("The value of number is: {}", number);
}
```

<span class="caption">示例 3-2：将 `if` 的返回值赋值给一个变量</span>

`number` 变量将会绑定到基于 `if` 表达式结果的值。运行这段代码看看会出现什么：

```text
$ cargo run
   Compiling branches v0.1.0 (file:///projects/branches)
    Finished dev [unoptimized + debuginfo] target(s) in 0.30 secs
     Running `target/debug/branches`
The value of number is: 5
```

还记得代码块的值是其最后一个表达式的值，以及数字本身也是一个表达式吗。在这个例子中，整个 `if` 表达式的值依赖哪个代码块被执行。这意味着 `if` 的每个分支的可能的返回值都必须是相同类型；在示例 3-2 中，`if` 分支和 `else` 分支的结果都是 `i32` 整型。如果它们的类型不匹配，如下面这个例子，则会出现一个错误：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let condition = true;

    let number = if condition {
        5
    } else {
        "six"
    };

    println!("The value of number is: {}", number);
}
```

当运行这段代码，会得到一个错误。`if` 和 `else` 分支的值类型是不相容的，同时 Rust 也准确地表明了在程序中的何处发现的这个问题：

```text
error[E0308]: if and else have incompatible types
 --> src/main.rs:4:18
  |
4 |       let number = if condition {
  |  __________________^
5 | |         5
6 | |     } else {
7 | |         "six"
8 | |     };
  | |_____^ expected integral variable, found reference
  |
  = note: expected type `{integer}`
             found type `&str`
```

`if` 代码块的表达式返回一个整型，而 `else` 代码块返回一个字符串。这并不可行，因为变量必须只有一个类型。Rust 需要在编译时就确切的知道 `number` 变量的类型，这样它就可以在编译时证明其他使用 `number` 变量的地方它的类型是有效的。Rust 并不能够在 `number` 的类型只能在运行时确定的情况下工作；这样会使编译器变得更复杂而且只能为代码提供更少的保障，因为它不得不记录所有变量的多种可能的类型。

### 使用循环重复执行

多次执行同一段代码是很常用的，Rust 为此提供了多种 **循环**（*loops*）。一个循环执行循环体中的代码直到结尾并紧接着回到开头继续执行。为了实验一下循环，让我们创建一个叫做 *loops* 的新项目。

Rust 有三种循环类型：`loop`、`while` 和 `for`。让我们每一个都试试。

#### 使用 `loop` 重复执行代码

`loop` 关键字告诉 Rust 一遍又一遍地执行一段代码直到你明确要求停止。

作为一个例子，将 *loops* 目录中的 *src/main.rs* 文件修改为如下：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    loop {
        println!("again!");
    }
}
```

当执行这个程序，我们会看到 `again!` 被连续的打印直到我们手动停止程序。大部分终端都支持一个键盘快捷键，<span class="keystroke">ctrl-C</span>，来终止一个陷入无限循环的程序。尝试一下：

```text
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished dev [unoptimized + debuginfo] target(s) in 0.29 secs
     Running `target/debug/loops`
again!
again!
again!
again!
^Cagain!
```

符号 `^C` 代表你在这按下了<span class="keystroke">ctrl-C</span>。在 `^C` 之后你可能看到也可能看不到 `again!` ，这依赖于在接收到终止信号时代码执行到了循环的何处。

幸运的是，Rust 提供了另一个更可靠的方式来退出循环。可以使用 `break` 关键字来告诉程序何时停止执行循环。回忆一下在第二章猜猜看游戏的 “猜测正确后退出” 部分使用过它来在用户猜对数字赢得游戏后退出程序。

#### `while` 条件循环

在程序中计算循环的条件也很常见。当条件为真，执行循环。当条件不再为真，调用 `break` 停止循环。这个循环类型可以通过组合 `loop`、`if`、`else` 和 `break` 来实现；如果你喜欢的话，现在就可以在程序中试试。

然而，这个模式太常见了以至于 Rust 为此提供了一个内建的语言结构，它被称为 `while` 循环。下面的例子使用了 `while`：程序循环三次，每次数字都减一。接着，在循环之后，打印出另一个信息并退出：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{}!", number);

        number = number - 1;
    }

    println!("LIFTOFF!!!");
}
```

这个结构消除了很多需要嵌套使用 `loop`、`if`、`else` 和 `break` 的代码，这样显得更加清楚。当条件为真就执行，否则退出循环。

#### 使用 `for` 遍历集合

可以使用 `while` 结构来遍历一个元素集合，比如数组。例如，看看如下的示例 3-3：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index = index + 1;
    }
}
```

<span class="caption">示例 3-3：使用 `while` 循环遍历集合中的每一个元素</span>

这里代码对数组中的元素进行计数。它从索引 `0` 开始，并接着循环直到遇到数组的最后一个索引（这时，`index < 5` 不再为真）。运行这段代码会打印出数组中的每一个元素：

```text
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished dev [unoptimized + debuginfo] target(s) in 0.32 secs
     Running `target/debug/loops`
the value is: 10
the value is: 20
the value is: 30
the value is: 40
the value is: 50
```

所有数组中的五个元素都如期被打印出来。尽管 `index` 在某一时刻会到达值 `5`，不过循环在其尝试从数组获取第六个值（会越界）之前就停止了。

不过这个过程是容易出错的；如果索引长度不正确会导致程序 panic。这也使程序更慢，因为编译器增加了运行时代码来对每次循环的每个元素进行条件检查。

可以使用 `for` 循环来对一个集合的每个元素执行一些代码，来作为一个更有效率的替代。`for` 循环看起来如示例 3-4 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a.iter() {
        println!("the value is: {}", element);
    }
}
```

<span class="caption">示例 3-4：使用 `for` 循环遍历集合中的每一个元素</span>

当运行这段代码，将看到与示例 3-3 一样的输出。更为重要的是，我们增强了代码安全性并消除了出现可能会导致超出数组的结尾或遍历长度不够而缺少一些元素这类 bug 的机会。

例如，在示例 3-3 的代码中，如果从数组 `a` 中移除一个元素但忘记更新条件为 `while index < 4`，代码将会 panic。使用`for`循环的话，就不需要惦记着在更新数组元素数量时修改其他的代码了。

`for` 循环的安全性和简洁性使得它在成为 Rust 中使用最多的循环结构。即使是在想要循环执行代码特定次数时，例如示例 3-3 中使用 `while` 循环的倒计时例子，大部分 Rustacean 也会使用 `for` 循环。这么做的方式是使用 `Range`，它是标准库提供的用来生成从一个数字开始到另一个数字之前结束的所有数字序列的类型。

下面是一个使用 `for` 循环来倒计时的例子，它还使用了一个我们还未讲到的方法，`rev`，用来反转 range：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    for number in (1..4).rev() {
        println!("{}!", number);
    }
    println!("LIFTOFF!!!");
}
```

这段代码看起来更帅气不是吗？

## 总结

你做到了！这是一个大章节：你学习了变量，标量和 `if` 表达式，还有循环！如果你想要实践本章讨论的概念，尝试构建如下的程序：

* 相互转换摄氏与华氏温度
* 生成 n 阶斐波那契数列
* 打印圣诞颂歌 “The Twelve Days of Christmas” 的歌词，并利用歌曲中的重复部分（编写循环）

当你准备好继续的时候，让我们讨论一个其他语言中 *并不* 常见的概念：所有权（ownership）。
