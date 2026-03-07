## 控制流

[ch03-05-control-flow.md](https://github.com/rust-lang/book/blob/9cc190796f28505c7a9a9cacea42f50d895ff3bd/src/ch03-05-control-flow.md)

根据条件是否为 `true` 来决定是否执行某些代码，以及在条件为 `true` 时重复执行某些代码的能力，是大多数编程语言的基本构件。Rust 中最常见的控制执行流的结构是 `if` 表达式和循环。

### `if` 表达式

`if` 表达式允许根据条件执行不同的代码分支。你提供一个条件并表示 “如果条件满足，运行这段代码；如果条件不满足，不运行这段代码。”

在 *projects* 目录中创建一个名为 *branches* 的新项目，来体验 `if` 表达式。在 *src/main.rs* 文件中输入如下内容：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-26-if-true/src/main.rs}}
```

所有 `if` 表达式都以 `if` 关键字开头，后面紧跟一个条件。在这个例子中，条件会检查变量 `number` 的值是否小于 5。如果条件为 `true`，就执行紧跟在条件后面的大括号中的代码块。与 `if` 表达式中各个条件关联的代码块有时也被称为 *arms*，就像我们在第二章[“比较猜测的数字和秘密数字”][comparing-the-guess-to-the-secret-number]一节中讨论过的 `match` 表达式分支一样。

也可以包含一个可选的 `else` 表达式来提供一个在条件为 `false` 时应当执行的代码块，这里我们就这么做了。如果不提供 `else` 表达式并且条件为 `false` 时，程序会直接忽略 `if` 代码块并继续执行下面的代码。

尝试运行代码，应该能看到如下输出：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-26-if-true/output.txt}}
```

尝试改变 `number` 的值使条件为 `false` 时看看会发生什么：

```rust,ignore
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-27-if-false/src/main.rs:here}}
```

再次运行程序并查看输出：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-27-if-false/output.txt}}
```

还值得注意的是，条件**必须**是 `bool` 值。如果条件不是 `bool`，我们就会得到一个错误。例如，尝试运行下面这段代码：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-28-if-condition-must-be-bool/src/main.rs}}
```

这里 `if` 条件的值是 `3`，Rust 抛出了一个错误：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-28-if-condition-must-be-bool/output.txt}}
```

这个错误表明 Rust 期望得到的是一个 `bool`，却收到了一个整数。不同于 Ruby 或 JavaScript 这样的语言，Rust 不会自动尝试把非布尔类型转换成布尔类型。你必须显式地为 `if` 提供一个布尔值作为条件。例如，如果我们希望 `if` 代码块只在某个数字不等于 `0` 时运行，就可以把 `if` 表达式改成下面这样：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-29-if-not-equal-0/src/main.rs}}
```

运行代码会打印出 `number was something other than zero`。

#### 使用 `else if` 处理多重条件

可以将 `else if` 表达式与 `if` 和 `else` 组合来实现多重条件。例如：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-30-else-if/src/main.rs}}
```

这个程序有四个可能的执行路径。运行后应该能看到如下输出：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-30-else-if/output.txt}}
```

当执行这个程序时，它按顺序检查每个 `if` 表达式并执行第一个条件为 `true` 的代码块。注意即使 6 可以被 2 整除，也不会输出 `number is divisible by 2`，更不会输出 `else` 块中的 `number is not divisible by 4, 3, or 2`。原因是 Rust 只会执行第一个条件为 `true` 的代码块，并且一旦它找到一个以后，甚至都不会检查剩下的条件了。

使用过多的 `else if` 表达式会让代码显得杂乱，所以如果你有不止一个 `else if`，可能就该考虑重构代码了。针对这种情况，第六章会介绍一个强大的 Rust 分支结构（branching construct），叫做 `match`。

#### 在 `let` 语句中使用 `if`

因为 `if` 是一个表达式，我们可以在 `let` 语句的右侧使用它，例如在示例 3-2 中：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/listing-03-02/src/main.rs}}
```

<span class="caption">示例 3-2：将 `if` 表达式的返回值赋给一个变量</span>

变量 `number` 会绑定到 `if` 表达式结果所产生的那个值。运行这段代码看看会发生什么：

```console
{{#include ../listings/ch03-common-programming-concepts/listing-03-02/output.txt}}
```

记住，代码块的值就是其中最后一个表达式的值，而数字本身也是表达式。在这个例子中，整个 `if` 表达式的值取决于哪个代码块被执行。这意味着 `if` 的各个分支可能产生的结果值都必须是相同类型；在示例 3-2 中，`if` 分支和 `else` 分支的结果都是 `i32` 整数。如果类型不一致，就会像下面这个例子一样报错：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-31-arms-must-return-same-type/src/main.rs}}
```

当编译这段代码时，会得到一个错误。`if` 和 `else` 分支的值类型是不相容的，同时 Rust 也准确地指出在程序中的何处发现的这个问题：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-31-arms-must-return-same-type/output.txt}}
```

`if` 代码块中的表达式会求值为一个整数，而 `else` 代码块中的表达式会求值为一个字符串。这是行不通的，因为变量必须只有一个类型。Rust 需要在编译时就明确知道 `number` 的类型，这样它才能在编译阶段验证每一处对 `number` 的使用是否合法。如果 `number` 的类型只能在运行时确定，Rust 就无法做到这一点；而如果编译器必须为每个变量跟踪多种假设类型，它也会变得更加复杂，并且对代码的保证会更少。

### 使用循环重复执行

反复执行同一段代码是一件很常见的事，为此 Rust 提供了多种 **循环**（*loops*）。循环会执行循环体中的代码直到结尾，然后立即回到开头继续执行。为了体验循环，我们来新建一个叫做 *loops* 的项目。

Rust 有三种循环：`loop`、`while` 和 `for`。我们每一个都试试。

#### 使用 `loop` 重复执行代码

`loop` 关键字告诉 Rust 反复执行一段代码，要么永远执行下去，要么直到你明确要求它停止。

作为一个例子，将 *loops* 目录中的 *src/main.rs* 文件修改为如下：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-32-loop/src/main.rs}}
```

运行这个程序时，我们会看到 `again!` 被不断重复打印，直到我们手动停止程序。大多数终端都支持使用快捷键 <kbd>ctrl</kbd>-<kbd>C</kbd> 来中断一个陷入无限循环的程序。试试看：

```console
$ cargo run
   Compiling loops v0.1.0 (file:///projects/loops)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.08s
     Running `target/debug/loops`
again!
again!
again!
again!
^Cagain!
```

符号 `^C` 表示你在这里按下了 <kbd>ctrl</kbd>-<kbd>C</kbd>。在 `^C` 后面，你可能会看到，也可能不会看到 `again!`，这取决于代码在收到中断信号时正执行到循环的哪个位置。

幸运的是，Rust 也提供了在代码中跳出循环的方法。你可以在循环中放置 `break` 关键字，告诉程序何时停止执行该循环。回忆一下，我们曾在第二章猜数字游戏的[“猜测正确后退出”][quitting-after-a-correct-guess]一节中使用过它，让程序在用户猜中数字后退出。

我们在猜数字游戏中也使用过 `continue`。在循环里，`continue` 关键字会告诉程序跳过本次循环迭代剩余的代码，并直接进入下一次迭代。

#### 从循环返回值

`loop` 的一个用途是重试那些你知道可能失败的操作，比如检查某个线程是否完成了任务。不过，你也可能希望把这个操作的结果传递给其他代码。为此，你可以在用于停止循环的 `break` 表达式后面加上想要返回的值；这个值会作为循环的返回值返回出来，因而你就可以使用它，如下所示：

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-33-return-value-from-loop/src/main.rs}}
```

在循环之前，我们声明了一个名为 `counter` 的变量，并将其初始化为 `0`。然后，又声明了一个名为 `result` 的变量，用来保存循环返回的值。在循环的每次迭代中，我们都会给 `counter` 加 `1`，然后检查它是否等于 `10`。当条件满足时，就用 `break` 关键字返回 `counter * 2` 的值。循环结束后，我们用分号结束把值赋给 `result` 的那条语句。最后，打印出 `result` 的值，也就是 `20`。

如果你在循环内部使用 `return`，也可以从中返回。不过，`break` 只会退出当前循环，而 `return` 总是会退出当前函数。

#### 循环标签：在多个循环之间消除歧义

如果循环中又套了循环，那么 `break` 和 `continue` 默认只作用于当前最内层的那个循环。你可以选择给某个循环加上一个 **循环标签**（*loop label*），然后把这个标签和 `break` 或 `continue` 一起使用，这样这些关键字就会作用于被标记的循环，而不是最内层循环。下面是一个包含两层嵌套循环的例子：

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-32-5-loop-labels/src/main.rs}}
```

外层循环带有标签 `'counting_up`，它会从 0 数到 2。没有标签的内层循环则从 10 倒数到 9。第一个没有指定标签的 `break` 只会退出内层循环。语句 `break 'counting_up;` 则会退出外层循环。这段代码会打印：

```console
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-32-5-loop-labels/output.txt}}
```

#### `while` 条件循环

程序经常需要在循环中计算某个条件：只要条件为 `true`，循环就继续；当条件不再为 `true` 时，程序就会调用 `break` 来停止循环。这种循环类型可以通过组合 `loop`、`if`、`else` 和 `break` 来实现；如果你愿意，现在就可以在程序里试试看。不过，这种模式实在太常见了，所以 Rust 为它内置了一个语言结构，叫做 `while` 循环。在示例 3-3 中，我们使用 `while` 让程序循环三次，每次计数都减一；之后，在循环结束后打印另一条消息并退出。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/listing-03-03/src/main.rs}}
```

<span class="caption">示例 3-3: 当条件为 `true` 时，使用 `while` 循环运行代码</span>

这种结构消除了使用 `loop`、`if`、`else` 和 `break` 时原本需要的大量嵌套，因此代码会更清晰。只要条件求值为 `true`，代码就会继续执行；否则就退出循环。

#### 使用 `for` 遍历集合

可以使用 `while` 结构来遍历集合中的元素，比如数组。例如，示例 3-4 中的循环会打印数组 `a` 中的每一个元素。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/listing-03-04/src/main.rs}}
```

<span class="caption">示例 3-4：使用 `while` 循环遍历集合中的每一个元素</span>

这里，代码对数组中的元素进行计数。它从索引 `0` 开始，并接着循环直到遇到数组的最后一个索引（这时，`index < 5` 不再为 `true`）。运行这段代码会打印出数组中的每一个元素：

```console
{{#include ../listings/ch03-common-programming-concepts/listing-03-04/output.txt}}
```

数组中的所有五个元素都如期出现在终端中。尽管 `index` 在某一时刻会到达值 `5`，不过循环在其尝试从数组获取第六个值（会越界）之前就停止了。

不过，这种方式很容易出错；如果索引值或测试条件写错了，就会导致程序 panic。例如，如果你把数组 `a` 改成只有 4 个元素，却忘了把条件更新成 `while index < 4`，代码就会 panic。它也会让程序变慢，因为编译器会加入运行时代码，在每次循环迭代时检查索引是否仍然位于数组边界之内。

作为更简洁的替代方案，可以使用 `for` 循环来对一个集合的每个元素执行一些代码。`for` 循环看起来如示例 3-5 所示：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/listing-03-05/src/main.rs}}
```

<span class="caption">示例 3-5：使用 `for` 循环遍历集合中的元素</span>

运行这段代码时，你会看到和示例 3-4 相同的输出。更重要的是，我们提高了代码的安全性，并消除了那种可能因为越过数组末尾，或遍历不够完整而漏掉某些元素所导致的 bug。

例如，在示例 3-4 的代码中，如果你把数组 `a` 改成只有 4 个元素，却忘了把条件更新为 `while index < 4`，代码就会 panic。而使用 `for` 循环时，你就不必记着在修改数组元素个数时还要同步修改其他代码了。

`for` 循环的安全性和简洁性，使它成为 Rust 中最常用的循环结构。即使是在你只想把某段代码执行特定次数的情况下，比如示例 3-3 里那个使用 `while` 的倒计时例子，大多数 Rustaceans 也会选择使用 `for` 循环。实现这种写法的方式是使用 `Range`，这是标准库提供的一种类型，用来生成从某个数字开始、到另一个数字之前结束的所有数字序列。

下面是一个使用 `for` 循环来倒计时的例子，它还用到了一个我们尚未讲到的方法 `rev`，用于反转 range。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-34-for-range/src/main.rs}}
```

这段代码是不是更好一些？

## 总结

你做到了！这是内容相当丰富的一章：你学习了变量、标量和复合数据类型、函数、注释、`if` 表达式以及循环！如果你想练习本章讨论的概念，可以尝试构建下面这些程序：

- 相互转换摄氏与华氏温度。
- 生成第 n 个斐波那契数。
- 打印圣诞颂歌 “The Twelve Days of Christmas” 的歌词，并利用歌曲中的重复部分（通过编写循环）。

当你准备好继续时，我们将讨论一个在其他编程语言中**并不**常见的概念：所有权（ownership）。

[comparing-the-guess-to-the-secret-number]: ch02-00-guessing-game-tutorial.html#比较猜测的数字和秘密数字
[quitting-after-a-correct-guess]: ch02-00-guessing-game-tutorial.html#猜测正确后退出
