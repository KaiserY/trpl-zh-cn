## 函数

[ch03-03-how-functions-work.md](https://github.com/rust-lang/book/blob/9cc190796f28505c7a9a9cacea42f50d895ff3bd/src/ch03-03-how-functions-work.md)

函数在 Rust 代码中非常普遍。你已经见过语言中最重要的函数之一：`main` 函数，它是很多程序的入口点。你也见过 `fn` 关键字，它用来声明新函数。

Rust 代码中的函数名和变量名通常使用 *snake case* 风格。在 snake case 中，所有字母都使用小写，并用下划线分隔单词。下面是一个包含函数定义示例的程序：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-16-functions/src/main.rs}}
```

我们在 Rust 中通过输入 `fn` 后面跟着函数名和一对圆括号来定义函数。大括号告诉编译器哪里是函数体的开始和结尾。

可以使用函数名后跟圆括号来调用我们定义过的任意函数。因为程序中已定义 `another_function` 函数，所以可以在 `main` 函数中调用它。注意，源码中 `another_function` 定义在 `main` 函数 **之后**；也可以定义在之前。Rust 不关心函数定义所在的位置，只要函数被调用时出现在调用之处可见的作用域内就行。

让我们新建一个叫做 *functions* 的二进制项目，来进一步探索函数。把上面的 `another_function` 示例放到 *src/main.rs* 中并运行。你应该会看到如下输出：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-16-functions/output.txt}}
```

这些代码行会按照它们在 `main` 函数中出现的顺序执行。首先打印 “Hello, world!”，然后调用 `another_function` 并打印它的消息。

### 参数

我们可以定义带有 **参数**（*parameters*）的函数，参数是特殊变量，是函数签名的一部分。当函数带有参数时，你就可以为这些参数提供具体的值。从严格意义上说，这些具体值叫做 *arguments*，不过在日常交流中，人们通常会把 *parameter* 和 *argument* 混用，用来指函数定义中的变量，或调用函数时传入的具体值。

在这个版本的 `another_function` 中，我们增加了一个参数：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-17-functions-with-parameters/src/main.rs}}
```

尝试运行程序，将会输出如下内容：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-17-functions-with-parameters/output.txt}}
```

`another_function` 的声明中有一个命名为 `x` 的参数。`x` 的类型被指定为 `i32`。当我们将 `5` 传给 `another_function` 时，`println!` 宏会把 `5` 放在格式字符串中包含 `x` 的那对花括号的位置。

在函数签名中，**必须** 声明每个参数的类型。这是 Rust 设计中经过深思熟虑的一个决定：要求在函数定义里提供类型注解，意味着编译器几乎不再需要你在代码的其他地方额外标明类型来表达意图。而且，如果编译器知道函数期望什么类型，就能给出更有帮助的错误信息。

当定义多个参数时，使用逗号分隔，像这样：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-18-functions-with-multiple-parameters/src/main.rs}}
```

这个例子创建了一个名为 `print_labeled_measurement` 的函数，它有两个参数。第一个参数名为 `value`，类型是 `i32`。第二个参数是 `unit_label` ，类型是 `char`。然后，该函数打印包含 `value` 和 `unit_label` 的文本。

尝试运行代码。使用上面的例子替换当前 *functions* 项目的 *src/main.rs* 文件，并用 `cargo run` 运行它：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-18-functions-with-multiple-parameters/output.txt}}
```

因为我们使用 `5` 作为 `value` 的值，`h` 作为 `unit_label` 的值来调用函数，所以程序输出包含这些值。

### 语句和表达式

函数体由一系列语句组成，并且可以选择以一个表达式结束。到目前为止，我们讲过的函数还没有包含结尾表达式，不过你已经见过出现在语句中的表达式了。由于 Rust 是一门基于表达式（expression-based）的语言，理解这一点非常重要。其他语言通常没有这种区分，所以让我们看看语句和表达式分别是什么，以及它们的差异会如何影响函数体。

- **语句**（*Statements*）是执行一些操作但不返回值的指令。
- **表达式**（*Expressions*）计算并产生一个值。

让我们看一些例子。

实际上，我们已经使用过语句和表达式。使用 `let` 关键字创建变量并绑定一个值是一个语句。在示例 3-1 中，`let y = 6;` 是一个语句。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/listing-03-01/src/main.rs}}
```

<span class="caption">示例 3-1：包含一个语句的 `main` 函数定义</span>

函数定义本身也是语句，因此前面的整个例子本身也是一条语句。（不过，正如我们稍后会看到的，**调用**函数并不是语句。）

语句不返回值。因此，不能把 `let` 语句赋值给另一个变量，比如下面的例子尝试做的，会产生一个错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-19-statements-vs-expressions/src/main.rs}}
```

当运行这个程序时，会得到如下错误：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-19-statements-vs-expressions/output.txt}}
```

`let y = 6` 这条语句不会返回值，因此没有什么东西可以绑定到 `x` 上。这和一些其他语言不同，比如 C 和 Ruby，在那些语言里，赋值语句会返回被赋的值。因此，在那些语言中你可以写 `x = y = 6`，让 `x` 和 `y` 都得到值 `6`；但 Rust 不是这样。

表达式会计算出一个值，并且你将编写的大部分 Rust 代码是由表达式组成的。考虑一个数学运算，比如 `5 + 6`，这是一个表达式并计算出值 `11`。表达式可以是语句的一部分：在示例 3-1 中，语句 `let y = 6;` 中的 `6` 是一个表达式，它计算出的值是 `6`。函数调用是一个表达式。宏调用是一个表达式。用大括号创建的一个新的块作用域也是一个表达式，例如：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-20-blocks-are-expressions/src/main.rs}}
```

这个表达式：

```rust,ignore
{
    let x = 3;
    x + 1
}
```

是一个代码块，它的值是 `4`。这个值作为 `let` 语句的一部分被绑定到 `y` 上。注意 `x + 1` 这一行在结尾没有分号，与你见过的大部分代码行不同。表达式的结尾没有分号。如果在表达式的结尾加上分号，它就变成了语句，而语句不会返回值。在接下来探索具有返回值的函数和表达式时要谨记这一点。

### 具有返回值的函数

函数可以把值返回给调用它的代码。我们不会给返回值命名，但必须在箭头（`->`）后面声明它的类型。在 Rust 中，函数的返回值等同于函数体中最后一个表达式的值。你也可以使用 `return` 关键字并指定一个值，从函数中提前返回；不过大多数函数都会隐式返回最后一个表达式的值。下面是一个带有返回值的函数示例：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-21-function-return-values/src/main.rs}}
```

在 `five` 函数中，没有函数调用、没有宏，甚至连 `let` 语句都没有，只有单独一个数字 `5`。这在 Rust 中是一个完全合法的函数。注意，我们也指定了函数返回值的类型，即 `-> i32`。试着运行这段代码；输出应该如下所示：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-21-function-return-values/output.txt}}
```

`five` 函数的返回值是 `5`，所以返回类型是 `i32`。让我们更仔细地看看这段代码。有两个重要的点：首先，`let x = five();` 这一行表明我们用函数的返回值来初始化一个变量。因为 `five` 返回的是 `5`，所以这一行与下面的代码等价：

```rust
let x = 5;
```

其次，`five` 函数没有参数，但定义了返回值类型，而且函数体里只有单独一个没有分号的 `5`，因为这是一个表达式，而我们想返回它的值。

让我们看看另一个例子：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-22-function-parameter-and-return/src/main.rs}}
```

运行代码会打印出 `The value of x is: 6`。但如果在包含 `x + 1` 的行尾加上一个分号，把它从表达式变成语句，我们将看到一个错误。

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch03-common-programming-concepts/no-listing-23-statements-dont-return-values/src/main.rs}}
```

运行代码会产生一个错误，如下：

```console
{{#include ../listings/ch03-common-programming-concepts/no-listing-23-statements-dont-return-values/output.txt}}
```

主要的错误信息 `mismatched types`（类型不匹配）揭示了这段代码的核心问题。`plus_one` 函数的定义表明它要返回一个 `i32`，但语句不会求值为某个值，语句对应的是单元类型 `()`。因此，函数实际上没有返回值，这就与函数定义相矛盾，从而产生了错误。在这段输出中，Rust 还提供了一条可能有助于修复该问题的提示：它建议删除这个分号，而这么做确实能修复错误。
