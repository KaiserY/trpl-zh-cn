## 所有可能会用到模式的位置

> [ch18-01-all-the-places-for-patterns.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch18-01-all-the-places-for-patterns.md)
> <br>
> commit 4ca9e513e532a4d229ab5af7dfcc567129623bf4

模式出现在 Rust 的很多地方。你已经在不经意间使用了很多模式！本部分是一个所有有效模式位置的参考。

### `match` 分支

如第六章所讨论的，一个模式常用的位置是 `match` 表达式的分支。在形式上 `match` 表达式由 `match` 关键字、用于匹配的值和一个或多个分支构成。这些分支包含一个模式和在值匹配分支的模式时运行的表达式：

```
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

#### 穷尽性和默认模式 `_`

`match` 表达式必须是穷尽的。当我们把所有分支的模式都放在一起，`match` 表达式所有可能的值都应该被考虑到。一个确保覆盖每个可能值的方法是在最后一个分支使用捕获所有的模式，比如一个变量名。一个匹配任何值的名称永远也不会失败，因此可以覆盖之前分支模式匹配剩下的情况。

这有一个额外的模式经常被用于结尾的分支：`_`。它匹配所有情况，不过它从不绑定任何变量。这在例如只希望在某些模式下运行代码而忽略其他值的时候很有用。

### `if let` 表达式

第六章讨论过了 `if let` 表达式，以及它是如何成为编写等同于只关心一个情况的 `match` 语句的简写的。`if let` 可以对应一个可选的 `else` 和代码在 `if let` 中的模式不匹配时运行。

列表 18-1 展示了甚至可以组合并匹配 `if let`、`else if` 和 `else if let`。这些代码展示了一系列针对不同条件的检查来决定背景颜色应该是什么。为了达到这个例子的目的，我们创建了硬编码值的变量，在真实程序中则可能由询问用户获得。如果用户指定了中意的颜色，我们将使用它作为背景颜色。如果今天是星期二，背景颜色将是绿色。如果用户指定了他们的年龄字符串并能够成功将其解析为数字的话，我们将根据这个数字使用紫色或者橙色。最后，如果没有一个条件符合，背景颜色将是蓝色：

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

<span class="caption">列表 18-1: 结合 `if let`、`else if`、`else if let` 和 `else`</span>

这个条件结构允许我们支持复杂的需求。使用这里硬编码的值，例子会打印出 `Using purple as the background color`。

注意 `if let` 也可以像 `match` 分支那样引入覆盖变量：`if let Ok(age) = age` 引入了一个新的覆盖变量 `age`，它包含 `Ok` 成员中的值。这也意味着 `if age > 30` 条件需要位于这个代码块内部；不能将两个条件组合为 `if let Ok(age) = age && age > 30`，因为我们希望与 30 进行比较的被覆盖的 `age` 直到大括号开始的新作用域才是有效的。

另外注意这样有很多情况的条件并没有 `match` 表达式强大，因为其穷尽性没有为编译器所检查。如果去掉最后的 `else` 块而遗漏处理一些情况，编译器也不会报错。这个例子可能过于复杂以致难以重写为一个可读的 `match`，所以需要额外注意处理了所有的情况，因为编译器不会为我们检查穷尽性。

### `while let`

一个与 `if let` 类似的结构体是 `while let`：它允许只要模式匹配就一直进行 `while` 循环。列表 18-2 展示了一个使用 `while let` 的例子，它使用 vector 作为栈并打以先进后出的方式打印出 vector 中的值：

```rust
let mut stack = Vec::new();

stack.push(1);
stack.push(2);
stack.push(3);

while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

<span class="caption">列表 18-2: 使用 `while let` 循环只要 `stack.pop()` 返回 `Some`就打印出其值</span>

这个例子会打印出 3、2 和 1。`pop` 方法取出 vector 的最后一个元素并返回`Some(value)`，如果 vector 是空的，它返回 `None`。`while` 循环只要 `pop` 返回 `Some` 就会一直运行其块中的代码。一旦其返回 `None`，`while`循环停止。我们可以使用 `while let` 来弹出栈中的每一个元素。

### `for` 循环

`for` 循环，如同第三章所讲的，是 Rust 中最常见的循环结构。那一章所没有讲到的是 `for` 可以获取一个模式。列表 18-3 中展示了如何使用 `for` 循环来解构一个元组。`enumerate` 方法适配一个迭代器来产生元组，其包含值和值的索引：

```rust
let v = vec![1, 2, 3];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

<span class="caption">列表 18-3: 在 `for` 循环中使用模式来解构 `enumerate` 返回的元组</span>

这会打印出：

```
1 is at index 0
2 is at index 1
3 is at index 2
```

第一个 `enumerate` 调用会产生元组 `(0, 1)`。当这个匹配模式 `(index, value)`，`index` 将会是 0 而 `value` 将会是 1。

### `let` 语句

`match` 和 `if let` 都是本书之前明确讨论过的使用模式的位置，不过他们不是仅有的**使用过**模式的地方。例如，考虑一下这个直白的 `let` 变量赋值：

```rust
let x = 5;
```

本书进行了不下百次这样的操作。你可能没有发觉，不过你这正是在使用模式！`let` 语句更为正式的样子如下：

```
let PATTERN = EXPRESSION;
```

我们见过的像 `let x = 5;` 这样的语句中变量名位于 `PATTERN` 位置；变量名不过是形式特别朴素的模式。

通过 `let`，我们将表达式与模式比较，并为任何找到的名称赋值。所以例如 `let x = 5;` 的情况，`x` 是一个模式代表“将匹配到的值绑定到变量 x”。同时因为名称 `x` 是整个模式，这个模式实际上等于“将任何值绑定到变量 `x`，不过它是什么”。

为了更清楚的理解 `let` 的模式匹配的方面，考虑列表 18-4 中使用 `let` 和模式解构一个元组：

```rust
let (x, y, z) = (1, 2, 3);
```

<span class="caption">列表 18-4: 使用模式解构元组并一次创建三个变量</span>

这里有一个元组与模式匹配。Rust 会比较值 `(1, 2, 3)` 与模式 `(x, y, z)` 并发现值匹配这个模式。在这个例子中，将会把 `1` 绑定到 `x`，`2` 绑定到 `y`， `3` 绑定到 `z`。你可以将这个元组模式看作是将三个独立的变量模式结合在一起。

在第十六章中我们见过另一个解构元组的例子，列表 16-6 中，那里解构 `mpsc::channel()` 的返回值为 `tx`（发送者）和 `rx`（接收者）。

### 函数参数

类似于 `let`，函数参数也可以是模式。列表 18-5 中的代码声明了一个叫做 `foo` 的函数，它获取一个 `i32` 类型的参数 `x`，这看起来应该很熟悉：

```rust
fn foo(x: i32) {
    // code goes here
}
```

<span class="caption">列表 18-5: 在参数中使用模式的函数签名</span>

`x` 部分就是一个模式！类似于之前对 `let` 所做的，可以在函数参数中匹配元组。列表 18-6 展示了如何可以将传递给函数的元组拆分为值：

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

<span class="caption">列表 18-6: 一个在参数中解构元组的函数</span>

这会打印出 `Current location: (3, 5)`。当传递值 `&(3, 5)` 给 `print_coordinates` 时，这个值会匹配模式 `&(x, y)`，`x` 得到了值 3，而 `y`得到了值 5。

因为如第十三章所讲闭包类似于函数，也可以在闭包参数中使用模式。

在这些可以使用模式的位置中的一个区别是，对于 `for` 循环、`let` 和函数参数，其模式必须是 *irrefutable* 的。接下来让我们讨论这个。