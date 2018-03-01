## 所有可能会用到模式的位置

> [ch18-01-all-the-places-for-patterns.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch18-01-all-the-places-for-patterns.md)
> <br>
> commit b1de391964190a0cec101ecfc86e05c9351af565

模式出现在 Rust 的很多地方。你已经在不经意间使用了很多模式！本部分是一个所有有效模式位置的参考。

### `match` 分支

如第六章所讨论的，一个模式常用的位置是 `match` 表达式的分支。在形式上 `match` 表达式由 `match` 关键字、用于匹配的值和一个或多个分支构成，这些分支包含一个模式和在值匹配分支的模式时运行的表达式：

```text
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

`match` 表达式必须是 **穷尽**（*exhaustive*）的，意为 `match` 表达式所有可能的值都必须被考虑到。一个确保覆盖每个可能值的方法是在最后一个分支使用捕获所有的模式 —— 比如，一个匹配任何值的名称永远也不会失败，因此可以覆盖所有匹配剩下的情况。

有一个特定的模式 `_` 可以匹配所有情况，不过它从不绑定任何变量。这在例如希望忽略任何未指定值的情况很有用。本章之后会详细讲解。

### `if let` 条件表达式

第六章讨论过了 `if let` 表达式，以及它是如何主要用于编写等同于只关心一个情况的 `match` 语句简写的。`if let` 可以对应一个可选的带有代码的 `else` 在 `if let` 中的模式不匹配时运行。

<!-- Can you say up front why we'd use this, and not just a match? I've just
added something here, not sure if it's right -->
<!-- The first sentence says why-- it's a shorter way to write a `match` when
there's only one case we care about. Can you elaborate on why that's not clear
or up front? /Carol -->

示例 18-1 展示了也可以组合并匹配 `if let`、`else if` 和 `else if let` 表达式。这相比 `match` 表达式一次只能将一个值与模式比较提供了更多灵活性；一系列 `if let`/`else if`/`else if let` 分支并不要求其条件相互关联。

示例 18-1 中的代码展示了一系列针对不同条件的检查来决定背景颜色应该是什么。为了达到这个例子的目的，我们创建了硬编码值的变量，在真实程序中则可能由询问用户获得。

如果用户指定了中意的颜色，将使用其作为背景颜色。如果今天是星期二，背景颜色将是绿色。如果用户指定了他们的年龄字符串并能够成功将其解析为数字的话，我们将根据这个数字使用紫色或者橙色。最后，如果没有一个条件符合，背景颜色将是蓝色：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(color) = favorite_color {
        println!("Using your favorite color, {}, as the background", color);
    } else if is_tuesday {
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            println!("Using purple as the background color");
        } else {
            println!("Using orange as the background color");
        }
    } else {
        println!("Using blue as the background color");
    }
}
```

<span class="caption">示例 18-1: 结合 `if let`、`else if`、`else if let` 以及 `else`</span>

这个条件结构允许我们支持复杂的需求。使用这里硬编码的值，例子会打印出 `Using purple as the background color`。

注意 `if let` 也可以像 `match` 分支那样引入覆盖变量：`if let Ok(age) = age` 引入了一个新的覆盖变量 `age`，它包含 `Ok` 成员中的值。这意味着 `if age > 30` 条件需要位于这个代码块内部；不能将两个条件组合为 `if let Ok(age) = age && age > 30`，因为我们希望与 30 进行比较的被覆盖的 `age` 直到大括号开始的新作用域才是有效的。

`if let` 表达式的缺点在于其穷尽性没有为编译器所检查，而 `match` 表达式则检查了。如果去掉最后的 `else` 块而遗漏处理一些情况，编译器也不会警告这类可能的逻辑错误。

<!-- So what would happen, we'd just end up with a program that wasn't correct,
in the Rust sense? -->
<!-- Yes, we would have a logic bug. /Carol -->

### `while let` 条件循环

一个与 `if let` 结构类似的是 `while let` 条件循环，它允许只要模式匹配就一直进行 `while` 循环。示例 18-2 展示了一个使用 `while let` 的例子，它使用 vector 作为栈并以先进后出的方式打印出 vector 中的值：

```rust
let mut stack = Vec::new();

stack.push(1);
stack.push(2);
stack.push(3);

while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

<span class="caption">列表 18-2: 使用 `while let` 循环只要 `stack.pop()` 返回 `Some` 就打印出其值</span>

<!-- Some lovely simple, but edifying, examples in this chapter!-->

这个例子会打印出 3、2 接着是 1。`pop` 方法取出 vector 的最后一个元素并返回 `Some(value)`。如果 vector 是空的，它返回 `None`。`while` 循环只要 `pop` 返回 `Some` 就会一直运行其块中的代码。一旦其返回 `None`，`while` 循环停止。我们可以使用 `while let` 来弹出栈中的每一个元素。

### `for` 循环

如同第三章所讲的，`for` 循环是 Rust 中最常见的循环结构，不过还没有讲到的是 `for` 可以获取一个模式。在 `for` 循环中，模式是 `for` 关键字直接跟随的值，正如 `for x in y` 中的 `x`。

<!-- Can you check the line I added above? I think it'd help to point out the
pattern section of a for loop straight away -->
<!-- Yep, looks good! /Carol -->

示例 18-3 中展示了如何使用 `for` 循环来解构，或拆开一个元组作为 `for` 循环的一部分：

<!-- Liz: We've been using the word "destructure" throughout the book in
chapters 3, 4, 5, and 16. In chapter 3, in the "Grouping Values into Tuples"
section, we said "This is called *destructuring*, because it breaks the single
tuple into three parts.". So I don't think we need to define destructure again
in this chapter, but I've added a small parenthetical here in case the reader
forgets. /Carol -->

```rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

<span class="caption">列表 18-3: 在 `for` 循环中使用模式来解构元组</span>

这会打印出：

```text
a is at index 0
b is at index 1
c is at index 2
```

这里使用 `enumerate` 方法适配一个迭代器来产生一个值和其在迭代器中的索引，他们位于一个元组中。第一个 `enumerate` 调用会产生元组 `(0, 'a')`。当这个值匹配模式 `(index, value)`，`index` 将会是 0 而 `value` 将会是 'a'，并打印出第一行输出。

### `let` 语句

在本章之前，我们只明确的讨论过通过 `match` 和 `if let` 使用模式，不过事实上也在别地地方使用过模式，包括 `let` 语句。例如，考虑一下这个直白的 `let` 变量赋值：

```rust
let x = 5;
```

本书进行了不下百次这样的操作。你可能没有发觉，不过你这正是在使用模式！`let` 语句更为正式的样子如下：

```text
let PATTERN = EXPRESSION;
```

像 `let x = 5;` 这样的语句中变量名位于 `PATTERN` 位置，变量名不过是形式特别朴素的模式。我们将表达式与模式比较，并为任何找到的名称赋值。所以例如 `let x = 5;` 的情况，`x` 是一个模式代表 “将匹配到的值绑定到变量 x”。同时因为名称 `x` 是整个模式，这个模式实际上等于 “将任何值绑定到变量 `x`，不管值是什么”。

为了更清楚的理解 `let` 的模式匹配方面的内容，考虑示例 18-4 中使用 `let` 和模式解构一个元组：

```rust
let (x, y, z) = (1, 2, 3);
```

<span class="caption">示例 18-4: 使用模式解构元组并一次创建三个变量</span>

这里将一个元组与模式匹配。Rust 会比较值 `(1, 2, 3)` 与模式 `(x, y, z)` 并发现此值匹配这个模式。在这个例子中，将会把 `1` 绑定到 `x`，`2` 绑定到 `y` 并将 `3` 绑定到 `z`。你可以将这个元组模式看作是将三个独立的变量模式结合在一起。

<!-- so if we have a pattern of four elements, say (w, x, y, z), but only three
values, would the values would not bind at all? -->
<!-- Either too many or too few elements in the pattern is a type error. I've
added a small example below to illustrate. /Carol -->

如果模式中元素的数量不匹配元组中元素的数量，则整个类型不匹配，并会得到一个编译时错误。例如，示例 18-5 展示了尝试用两个变量解构三个元素的元组，这是不行的：

```rust,ignore
let (x, y) = (1, 2, 3);
```

<span class="caption">示例 18-5: 一个错误的模式结构，其中变量的数量不符合元组中元素的数量</span>

尝试编译这段代码会给出如下类型错误：

```text
error[E0308]: mismatched types
 --> src/main.rs:2:9
  |
2 |     let (x, y) = (1, 2, 3);
  |         ^^^^^^ expected a tuple with 3 elements, found one with 2 elements
  |
  = note: expected type `({integer}, {integer}, {integer})`
             found type `(_, _)`
```

如果希望忽略元组中一个或多个值，也可以使用 `_` 或 `..`，如 “忽略模式中的值” 部分所示。如果问题是模式中有太多的变量，则解决方法是通过去掉变量使得变量数与元组中元素数相等。

### 函数参数

函数参数也可以是模式。列表 18-6 中的代码声明了一个叫做 `foo` 的函数，它获取一个 `i32` 类型的参数 `x`，现在这看起来应该很熟悉：

```rust
fn foo(x: i32) {
    // code goes here
}
```

<span class="caption">列表 18-6: 在参数中使用模式的函数签名</span>

`x` 部分就是一个模式！类似于之前对 `let` 所做的，可以在函数参数中匹配元组。列表 18-7 将传递给函数的元组拆分为值：

<span class="filename">文件名: src/main.rs</span>

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

<span class="caption">列表 18-7: 一个在参数中解构元组的函数</span>

这会打印出 `Current location: (3, 5)`。值 `&(3, 5)` 会匹配模式 `&(x, y)`，如此 `x` 得到了值 3，而 `y`得到了值 5。

因为如第十三章所讲闭包类似于函数，也可以在闭包参数中使用模式。

现在我们见过了很多使用模式的方式了，不过模式在每个使用它的地方并不以相同的方式工作；在一些地方，模式必须是 *irrefutable* 的，意味着他们必须匹配所提供的任何值。在另一些情况，他们则可以是 refutable 的。接下来让我们讨论这个。
