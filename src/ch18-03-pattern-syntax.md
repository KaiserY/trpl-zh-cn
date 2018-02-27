## 所有的模式语法

> [ch18-03-pattern-syntax.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch18-03-pattern-syntax.md)
> <br>
> commit 3f91c488ad4261dee6a61db4f60c197074151aac

通过本书我们已领略过许多不同类型模式的例子. 本节会统一列出所有在模式中有效的语法并且会阐述你为什么可能会希望使用其中的每一个。

<!-- We don't always go over why we might want to use them for each section
here, presumably because it's clear why it's useful. I might recommend you do
just add a line to each, since we've promised it, and just to really hammer the
point home. Definitely keep it short and sweet though, where it's pretty clear.
-->

### 匹配字面值

如第六章所示，可以直接匹配字面值模式。如下代码给出了一些例子：

```rust
let x = 1;

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

这段代码会打印 `one` 因为 `x` 的值是 1。

### 匹配命名变量

<!-- I found this next bit a little tougher to follow, I've tried to clarify in
this opening paragraph, connect it all up, can you please check it? -->
<!-- Yep! Looks good! /Carol -->

命名变量是匹配任何值的不可反驳模式，这在之前已经使用过数次。然而当其用于 `match` 表达式时情况会有些复杂。因为 `match` 会开始一个新作用域，`match` 表达式中作为模式的一部分声明的变量会覆盖 `match` 结构之外的同名变量 ———— 与所有变量一样。在示例 18-11 中，声明了一个值为 `Some(5)` 的变量 `x` 和一个值为 `10` 的变量 `y`。接着在值 `x` 上创建了一个 `match` 表达式。观察匹配分支中的模式和结尾的 `println!`，并尝试在运行代码之前计算出会打印什么，或者继续阅读：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {:?}", y),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

<span class="caption">示例 18-11: 一个 `match` 语句其中一个分支引入了覆盖变量 `y`</span>

让我们看看当 `match` 语句运行的时候发生了什么。第一个匹配分支的模式并不匹配 `x` 中定义的值，所以继续。

第二个匹配分支中的模式引入了一个新变量 `y`，它会匹配任何 `Some` 中的值。因为我们在 `match` 表达式的新作用域中，这是一个新变量，而不是开头声明为值 10 的那个 `y`。这个新的 `y` 绑定会撇配任何 `Some` 中的值，在这是是 `x` 中的值。因此这个 `y` 绑定了 `x` 中 `Some` 内部的值。这个值是 5，所以这个分支的表达式将会执行并打印出 `Matched, y = 5`。

<!-- Below -- We haven't fully introduced the underscore yet, is there anything
else we could use for that final arm? -->
<!-- We have *used* the underscore briefly before, though-- we actually
introduced the underscore in chapter 6. There really isn't anything else that
we can put that will still have this example illustrating what we want to
illustrate. /Carol -->

如果 `x` 的值是 `None` 而不是 `Some(5)`，头两个分支的模式不会匹配，所以会匹配下划线。这个分支的模式中没有引入变量 `x`，所以此时表达式中的 `x` 会是外部没有被覆盖的 `x`。在这个假想的例子中，`match` 将会打印 `Default case, x = None`。

一旦 `match` 表达式执行完毕，其作用域也就结束了，同理内部 `y` 的作用域也结束了。最后的 `println!` 会打印 `at the end: x = Some(5), y = 10`。

为了创建能够比较外部 `x` 和 `y` 的值，而不引入覆盖变量的 `match` 表达式，我们需要相应的使用带有条件的匹配守卫（match guard）。本部分的后面会讨论匹配守卫。

### 多个模式

在 `match` 表达式中，可以使用 `|` 语法匹配多个模式，它代表 **或**（*or*）的意思。例如，如下代码将 `x` 的值与匹配分支向比较，第一个分支有 **或** 选项，意味着如果 `x` 的值匹配此分支的任一个值，它就会运行：

<!-- I've tried to flesh this out a bit, can you check? -->
<!-- Yep, it's fine! /Carol -->

```rust
let x = 1;

match x {
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

上面的代码会打印 `one or two`。

<!-- Is there a corresponding "and" operator? Is that worth tacking on here? -->
<!-- No, there is not-- how could one value match, say, 1 AND 2? Does it make
sense why there isn't an "and" operator? /Carol -->

### 通过 `...` 匹配值的范围

`...` 语法允许你匹配一个闭区间范围内的值。在如下代码中，当模式匹配任何在此范围内的值时，该分支会执行：

<!-- Above--this seems like it's true, that the range allows you to match to
just one of the values? If so, can you say how this differs to using the or
operator? -->
<!-- I'm not sure what you mean by "match to just one of the values". `...`
matches any value between the two specified endpoints, which I thought would be
clear by the text below the code, and I changed "just one of" to "any of the
values within" above, and mentioned what the equivalent "or" pattern would look
like below. Does that clear it up? /Carol -->

```rust
let x = 5;

match x {
    1 ... 5 => println!("one through five"),
    _ => println!("something else"),
}
```

如果 `x` 是 1、2、3、4 或 5，第一个分支就会匹配。这相比使用 `|` 运算符表达相同的意思更为方便；相比 `1 ... 5`，使用 `|` 则不得不指定 `1 | 2 | 3 | 4 | 5`。相反指定范围就简短的多，特别是在希望匹配比如从 1 到 1000 的数字的时候！

范围只允许用于数字或 `char` 值，因为编译器会在编译时检查范围不为空。`char` 和 数字值是 Rust 唯一知道范围是否为空的类型。

<!-- why, because they are the only types with inherent order? -->
<!-- Nope, I've added the explanation /Carol -->

如下是一个使用 `char` 类型值范围的例子：

```rust
let x = 'c';

match x {
    'a' ... 'j' => println!("early ASCII letter"),
    'k' ... 'z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```

Rust 知道 `c` 位于第一个模式的范围内，并会打印出 `early ASCII letter`。

### 解构并分解值

<!-- I moved the definition of destructure earlier in the chapter, to when we
first use it -->
<!-- See my comment there; we first use destructure in chapter 3 /Carol -->

也可以使用模式来解构结构体、枚举、元组和引用，以便使用这些值的不同部分。让我们来分别看一看。

#### 解构结构体

示例 18-12 展示带有两个字段 `x` 和 `y` 的结构体 `Point`，可以通过带有模式的 `let` 语句将其分解：

<span class="filename">文件名: src/main.rs

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}
```

<span class="caption">示例 18-12: 解构一个结构体的字段为单独的变量</span>

<!-- I'm not sure I follow which part of this is the shorthand, what is it
shorthand for, and which syntax here counts as the shorthand? Can you slow this
down, talk it through a little more. Is the point of this section that we have
a shorthand for destructuring, or that we are able to destructure these items
with patterns at all? -->
<!-- I've reorganized this section to start with the non-shorthand instead, is
this clearer? /Carol -->

这段代码创建了变量 `a` 和 `b` 来匹配变量 `p` 中的 `x` 和 `y` 字段。

这个例子展示了模式中的变量名不必与结构体中的字段名一致，不过通常希望变量名与字段名一致以便于理解变量来自于哪些字段。因为变量名匹配字段名是常见的，同时因为 `let Point { x: x, y: y } = p;` 包含了很多重复，所以对于匹配结构体字段的模式存在简写：只需列出结构体字段的名称，则模式创建的变量会有相同的名称。示例 18-13 展示了与示例 18-12 有着相同行为的代码，不过 `let` 模式创建的变量为 `x` 和 `y` 而不是 `a` 和 `b`：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}
```

<span class="caption">示例 18-13: 使用结构体字段简写来解构结构体字段</span>

这段代码创建了变量 `x` 和 `y`，与变量 `p` 中的 `x` 和 `y` 相匹配。其结果是变量 `x` 和 `y` 包含结构体 `p` 中的值。

也可以在部分结构体模式中使用字面值进行结构，而不是为所有的字段创建变量。这允许我们测试一些字段为特定值的同时创建其他字段的变量。

示例 18-14 展示了一个 `match` 语句将 `Point` 值分成了三种情况：直接位于 `x` 轴上（此时 `y = 0` 为真）、位于 `y` 轴上（`x = 0`）或其他的点：

<!-- I'm not sure what you mean by "inner parts of a value" -- that we aren't
matching a whole value but part of it? -->
<!-- I've reworded, is this version clearer? /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        Point { x, y: 0 } => println!("On the x axis at {}", x),
        Point { x: 0, y } => println!("On the y axis at {}", y),
        Point { x, y } => println!("On neither axis: ({}, {})", x, y),
    }
}
```

<span class="caption">示例 18-14: 解构和匹配模式中的字面值</span>

第一个分支通过指定字段 `y` 匹配字面值 `0` 来匹配任何位于 `x` 轴上的点。此模式仍然创建了变量 `x` 以便在分支的代码中使用。类似的，第二个分支通过指定字段 `x` 匹配字面值 `0` 来匹配任何位于 `y` 轴上的点，并为字段 `y` 创建了变量 `y`。第三个分支没有指定任何字面值，所以其会匹配任何其他的 `Point` 并为 `x` 和 `y` 两个字段创建变量。

在这个例子中，值 `p` 因为其 `x` 包含 0 而匹配第二个分支，因此会打印出 `On the y axis at 7`。

#### 解构枚举

本书之前的部分曾经解构过么局，比如第六章中示例 6-5 中解构了一个 `Option<i32>`。一个当时没有明确提到的细节是解构枚举的模式需要对应枚举所定义的储存数据的方式。让我们以示例 6-2 中的 `Message` 枚举为例，编写一个 `match` 使用模式解构每一个内部值，如示例 18-15 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("The Quit variant has no data to destructure.")
        },
        Message::Move { x, y } => {
            println!(
                "Move in the x direction {} and in the y direction {}",
                x,
                y
            );
        }
        Message::Write(text) => println!("Text message: {}", text),
        Message::ChangeColor(r, g, b) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
    }
}
```

<span class="caption">示例 18-15: 解构包含不同类型值成员的枚举</span>

这段代码会打印出 `Change the color to red 0, green 160, and blue 255`。尝试改变 `msg` 的值来观察其他分支代码的运行。

对于像 `Message::Quit` 这样没有任何数据的枚举成员，不能进一步解构其值。只能匹配其字面值 `Message::Quit`，因此模式中没有任何变量。

对于像 `Message::Move` 这样的类结构体枚举成员，可以采用类似于匹配结构体的模式。在成员名称后，使用大括号并列出字段变量以便将其分解以供此分支的代码使用。这里使用了示例 18-13 所真实的简写。

对于像 `Message::Write` 这样的包含一个元素，以及像 `Message::ChangeColor` 这样包含两个元素的类元组枚举成员，其模式则类似于用于解构元组的模式。模式中变量的数量必须与成员中元素的数量一致。

#### 解构引用

当模式所匹配的值中包含引用时，需要解构引用之中的值，这可以通过在模式中指定 `&` 做到。这让我们得到一个包含引用所指向数据的变量，而不是包含引用的变量。

<!-- What does it mean, to separate the reference and the value, precisely? So
that we specify Rust use the value in place of the reference? And what does &
here do, tell Rust to follow the reference to the value itself, rather than
work on the reference?-->
<!-- Yes, pretty much. I've tried rewording, is this clearer? /Carol -->

这在迭代器遍历引用，不过我们需要使用闭包中的值而不是其引用时非常有用

示例 18-16 中的例子遍历一个 vector 中的 `Point` 实例的引用，并同时解构引用和其中的结构体以方便对 `x` 和 `y` 值进行计算：

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
let points = vec![
    Point { x: 0, y: 0 },
    Point { x: 1, y: 5 },
    Point { x: 10, y: -3 },
];

let sum_of_squares: i32 = points
    .iter()
    .map(|&Point { x, y }| x * x + y * y)
    .sum();
```

<span class="caption">示例 18-16: 将结构体的引用解构到其字段值中</span>

<!-- and what do we actually get, instead of the error? -->
<!-- Added explanation text below /Carol -->

这段代码的结果是变量 `sum_of_squares` 的值为 135，这个结果是将 `points` vector 中每一个 `Point` 的 `x` 和 `y` 的平方相加后求和得到的数字。

如果没有在 `&Point { x, y }` 中包含 `&` 则会得到一个类型不匹配错误，因为这样 `iter` 会遍历 vector 中项的引用而不是值本身。这个错误看起来像这样：

```text
error[E0308]: mismatched types
  -->
   |
14 |         .map(|Point { x, y }| x * x + y * y)
   |               ^^^^^^^^^^^^ expected &Point, found struct `Point`
   |
   = note: expected type `&Point`
              found type `Point`
```

这个错误表明 Rust 期望闭包匹配 `&Point`，不过我们尝试直接匹配 `Point` 值，而不是 `Point` 的引用。

#### 解构结构体和元组

甚至可以用复杂的方式来合成、匹配和嵌套解构模式。如下是一个负责结构体的例子，其中结构体和元组嵌套在元组中，并将所有的原始类型解构出来：

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

这将复杂的类型分解成部分组件以便可以单独使用我们感兴趣的值。

<!-- Can you round up the destructuring section here before we move on. For
this bit, maybe say explicitly what this would be useful for -->
<!-- Done /Carol -->

通过模式解构是一个方便利用部分值片段的手段，比如结构体中每个单独字段的值。

### 忽略模式中的值

有时忽略模式中的一些值是有用的，比如 `match` 中最后捕获全部情况的分支实际上没有做任何事，但是它确实对所有剩余情况负责。有一些简单的方法可以忽略模式中全部或部分值：使用 `_` 模式（我们已经见过了），在另一个模式中使用 `_` 模式，使用一个以下划线开始的名称，或者使用 `..` 忽略所剩部分的值。让我们来分别探索如何以及为什么要这么做。

#### 使用 `_` 忽略整个值

我们已经使用过下划线作为匹配但不绑定任何值的通配符模式了。虽然下划线模式作为 `match` 表达式最后的分支特别有用，也可以将其用于任意模式，包括函数参数中，如示例 18-17 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {}", y);
}

fn main() {
    foo(3, 4);
}
```

<span class="caption">示例 18-17: 在函数签名中使用 `_`</span>

<!-- What is this doing exactly, can you help the reader out here? Are we
letting the function run without a parameter at all? I'm not sure the purpose
clear enough at the moment -->
<!-- Done /Carol -->

这段代码会完全忽略作为第一个参数传递的值，3，并会打印出 `This code only uses the y parameter: 4`。大部分情况当你不再需要特定函数参数时，最好修改签名不再包含无用的参数。

在一些情况下忽略函数参数会变得特别有用，比如实现 trait 时，当你需要特定类型签名但是函数实现并不需要某个参数时。此时编译器就不会警告说存在未使用的函数参数，就跟使用命名参数一样。

#### 使用嵌套的 `_` 忽略部分值

<!-- When would we want to do this? -->
<!-- Done, moved the explanation up and made the example have a bit more
motivation /Carol -->

当只需要测试部分值但在期望运行的代码部分中没有使用它们时，也可以在另一个模式内部使用 `_` 来只忽略部分值。示例 18-18 展示了负责从设置中获取一个值的代码。业务需求是用户不允许覆盖某个设置中已经存在的自定义配置，但是可以重设设置和在目前未设置时提供新的设置。

```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value, new_setting_value) {
    (Some(_), Some(_)) => {
        println!("Can't overwrite an existing customized value");
    }
    _ => {
        setting_value = new_setting_value;
    }
}

println!("setting is {:?}", setting_value);
```

<span class="caption">使用 18-18: 当不需要 `Some` 中的值时在模式内使用下划线来匹配 `Some` 成员</span>

这段代码会打印出 `Can't overwrite an existing customized value` 接着是 `setting is Some(5)`。在第一个匹配分支，我们不需要匹配或使用任一个 `Some` 成员中的值；重要的部分是需要测试 `setting_value` 和 `new_setting_value` 都为 `Some` 成员的情况。在这种情况，我们希望打印出为何不改变 `setting_value`，并且不会改变它。

对于所有其他情况（`setting_value` 或 `new_setting_value` 任一为 `None`），这由第二个分支的 `_` 模式体现，这时确实希望允许 `new_setting_value` 变为 `setting_value`。

<!-- So when we need to match but don't actually need the value, is that what
we're saying? -->
<!-- Yes /Carol -->

也可以在一个模式中的多处使用下划线来忽略特定值，如示例 18-19 所示，这里忽略了一个五元元组中的第二和第四个值：

我们也可以在一个模式中多处使用下划线, 在例18-17中我们将忽略掉一个五元元组中的第二和第四个值:

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {}, {}, {}", first, third, fifth)
    },
}
```

<span class="caption">示例 18-19: 忽略元组的多个部分</span>

这会打印出 `Some numbers: 2, 8, 32`, 值 4 和 16 会被忽略。

#### 通过在名字前以一个下划线开头来忽略未使用的变量

如果你创建了一个变量却不在任何地方使用它, Rust 通常会给你一个警告，因为这可能会是个 bug。但是有时创建一个还未使用的变量是有用的，比如你正在设计原型或刚刚开始一个项目。这时你希望告诉 Rust 不要警告未使用的变量，为此可以用下划线作为变量名的开头。示例 18-20 中创建了两个未使用变量，不过当运行代码时只会得到其中一个的警告：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let _x = 5;
    let y = 10;
}
```

<span class="caption">示例 18-20: 以下划线开始变量名以便去掉未使用变量警告</span>

这里得到了警告说未使用变量 `y`，不过没有警告说未使用下划线开头的变量。

注意, 只使用`_`和使用以下划线开头的名称有些微妙的不同：比如 `_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定。为了展示这个区别的意义，示例 18-21 会产生一个错误。

```rust,ignore
let s = Some(String::from("Hello!"));

if let Some(_s) = s {
    println!("found a string");
}

println!("{:?}", s);
```

<span class="caption">示例 18-21: 以下划线开头的未使用变量仍然会绑定值，它可能会获取值的所有权</span>

我们会得到一个错误，因为 `s` 的值仍然会移动进 `_s`，并阻止我们再次使用 `s`。然而只使用下划线本身，并不会绑定值。示例 18-22 能够无错编译，因为 `s` 没有被移动进 `_`：

```rust
let s = Some(String::from("Hello!"));

if let Some(_) = s {
    println!("found a string");
}

println!("{:?}", s);
```

<span class="caption">示例 18-22: 单独使用下划线不会绑定值</span>

上面的代码能很好的运行；因为没有把 `s` 绑定到任何变量，它没有被移动。

#### 用 `..` 忽略剩余值

对于有多个部分的值，可以使用 `..` 语法来只使用部分并忽略其它值，同时避免不得不每一个忽略值列出下划线。`..` 模式会忽略模式中剩余的任何没有显式匹配的值部分。在示例 18-23 中，有一个 `Point` 结构体存放了三维空间中的坐标。在 `match` 表达式中，我们希望只操作 `x` 坐标并忽略 `y` 和 `z` 字段的值：

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
    Point { x, .. } => println!("x is {}", x),
}
```

<span class="caption">示例 18-23: 通过使用 `..` 来忽略 `Point` 中除 `x` 以外的字段</span>

这里列出了 `x` 值，接着仅仅包含了 `..` 模式。这比不得不列出 `y: _` 和 `z: _` 要来得简单，特别是在处理有很多字段的结构体，但只涉及一到两个字段时的情形。

`..` 会扩展为所需要的值的数量。示例 18-24 展示了元组中 `..` 的应用：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (first, .., last) => {
            println!("Some numbers: {}, {}", first, last);
        },
    }
}
```

<span class="caption">示例 18-24: 用 `..` 匹配元组中的第一个和最后一个值并忽略掉所有其它值</span>

这里用 `first` 和 `last` 来匹配第一个和最后一个值。`..` 将匹配并忽略中间的所有值。

然而使用 `..` 必须是无歧义的。如果期望匹配和忽略的值是不明确的，Rust 会报错。示例 18-25 展示了一个带有歧义的 `..` 应用，因此其不能编译：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (.., second, ..) => {
            println!("Some numbers: {}", second)
        },
    }
}
```

<span class="caption">示例 18-25: 尝试以有歧义的方式运用 `..`</span>

如果编译上面的例子，会得到下面的错误：

```text
error: `..` can only be used once per tuple or tuple struct pattern
 --> src/main.rs:5:22
  |
5 |         (.., second, ..) => {
  |                      ^^
```

Rust 不可能决定在元组中匹配 `second` 值之前应该忽略多少个值，以及在之后忽略多少个值。这段代码可能表明我们意在忽略 2，绑定 `second` 为 4，接着忽略 8、16 和 32；抑或是意在忽略 2 和 4，绑定 `second` 为 8，接着忽略 16 和 32，以此类推。变量名 `second` 对于 Rust 来说并没有任何特殊意义，所以会得到编译错误，因为在这两个地方使用 `..` 是有歧义的。

### 使用 `ref` 和 `ref mut` 在模式中创建引用

这里我们将看到使用 `ref` 来创建引用，这样值的所有权就不会移动到模式的变量中。通常当匹配模式时，模式所引入的变量将绑定一个值。Rust 的所有权规则意味着这个值将被移动到 `match` 中，或者任何使用此模式的位置。示例 18-26 展示了一个带有变量的模式的例子，并接着在 `match` 之后使用这整个值。这会编译失败，因为值 `robot_name` 的一部分在第一个 `match` 分支时被移动到了模式的变量 `name` 中：

<!-- Can you lay out what is supposed to happen with this code, that doesn't
work? -->
<!-- Done /Carol -->

```rust,ignore
let robot_name = Some(String::from("Bors"));

match robot_name {
    Some(name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">示例 18-26: 在匹配分支的模式中创建获取值所有权的变量</span>

这个例子会编译失败，因为当 `name` 绑定 `robot_name` 的 `Some` 中的值时，其被移动到了 `match` 中。因为 `robot_name` 的部分所有权被移动到了 `name` 中，就不再能够在 `match` 之后的 `println!` 中使用 `robot_name`，因为 `robot_name` 不再有所有权。

<!-- Above -- why will that make it fail, because the bind is then invalid? -->
<!-- Yes, I've clarified a bit /Carol -->

<!--Below -- Is this then the solution, introducing &? I assume so, because we
don’t have & in the example above, but the connection isn't clear -->
<!-- No, the solution is introducing `ref`. I've clarified /Carol -->

为了修复这段代码，需要让 `Some(name)` 模式借用部分 `robot_name` 而不是获取其所有权。在模式之外，我们见过了使用 `&` 创建引用来借用值，所以可能会想到的解决方案是将 `Some(name)` 改为 `Some(&name)`。

然而，在 “解构并分解值” 部分我们见过了模式中的 `&` 并不能 **创建** 引用，它会 **匹配** 值中已经存在的引用。因为 `&` 在模式中已经有其他意义，不能够使用 `&` 在模式中创建引用。

相对的，为了在模式中创建引用，可以在新变量前使用 `ref` 关键字，如示例 18-27 所示：

```rust
let robot_name = Some(String::from("Bors"));

match robot_name {
    Some(ref name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">示例 18-27: 创建一个引用以便模式变量不会获取其所有权</span>

这个例子可以编译，因为 `robot_name` 中 `Some` 成员的值没有被移动到 `match` 中；`match` 值获取了 `robot_name` 中数据的引用而没有移动它。

为了能够修改模式中匹配的值需要创建可变引用，使用 `ref mut` 替代 `&mut`，类似于上面用 `ref` 替代 `&`：模式中的 `&mut` 用于匹配已经存在的可变引用，而不是新建一个。示例 18-28 展示了一个创建可变引用模式的例子：

```rust
let mut robot_name = Some(String::from("Bors"));

match robot_name {
    Some(ref mut name) => *name = String::from("Another name"),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">示例 18-28: 在模式中使用 `ref mut` 来创建一个值的可变引用</span>

上例可以编译并打印出 `robot_name is: Some("Another name")`。因为 `name` 是一个可变引用，我们需要在匹配分支代码中使用 `*` 运算符解引用以便能够修改它。

### 匹配守卫提供的额外条件

<!-- Can you give a full definition of a match guard here, and what we use it
for, before covering how to do it? -->

**匹配守卫**（*match guard*）是一个指定与 `match` 分支模式之后的额外 `if` 条件，它也必须被满足才能选择此分支。匹配守卫用于表达比单独的模式所能允许的更为复杂的情况。

这个条件可以使用模式中创建的变量。示例 18-29 展示了一个 `match`，其中第一个分支有模式 `Some(x)` 还有匹配守卫 `if x < 5`：

```rust
let num = Some(4);

match num {
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}
```

<span class="caption">示例 18-29: 在模式中加入匹配守卫</span>

<span class="caption">例18-27: 往一个模式中加入匹配守卫</span>

上例会打印出 `less than five: 4`。当 `num` 与模式中第一个分支比较时，因为 `Some(4)` 匹配 `Some(x)` 所以可以匹配。接着匹配守卫检查 `x` 值是否小于 5，因为 4 小于 5，所以第一个分支被选择。

相反如果 `num` 为 `Some(10)`，因为 10 不小于 5 所以第一个分支的匹配守卫为假。接着 Rust 会前往第二个分支，这会匹配因为它没有匹配守卫所以会匹配任何 `Some` 成员。

无法在模式中表达 `if x < 5` 的条件，所以匹配守卫提供了表现此逻辑的能力。

<!-- I think we need this spelled out, can you say what it is the match guard
is doing here? I've had a guess above, but I think it needs your review! -->
<!-- Reviewed and tweaked a bit! /Carol -->

在示例 18-11 中，我们提到可以使用匹配守卫来解决模式中变量覆盖的问题，那里 `match` 表达式的模式中新建了一个变量而不是使用 `match` 之外的同名变量。新变量意味着不能够测试外部变量的值。实例 18-30 展示了如何使用匹配守卫修复这个问题：

<!-- Can you check this above -- I've tried to paraphrase the final paragraph
from that section. -->
<!-- Checked and reworded a bit /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(n) if n == y => println!("Matched, n = {:?}", n),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

<span class="caption">示例 18-30: 使用匹配守卫来测试与外部变量的相等性</span>

现在这会打印出 `Default case, x = Some(5)`。现在第二个匹配分支中的模式不会引入一个覆盖外部 `y` 的新变量 `y`，这意味着可以在匹配守卫中使用外部的 `y`。相比指定会覆盖外部 `y` 的模式 `Some(y)`，这里指定为 `Some(n)`。此新建的变量 `n` 并没有覆盖任何值，因为 `match` 外部没有变量 `n`。

在匹配守卫 `if n == y` 中，这并不是一个模式所以没有引入新变量。这个 `y` **正是** 外部的 `y` 而不是新的覆盖变量 `y`，这样就可以通过比较 `n` 和 `y` 来表达寻找一个与外部 `y` 相同的值的概念了。

<!-- Why is this one not introducing a new variable y but 18-10 was? Instead we
create a new variable n and then compare it to the outer y, is that it? In
which case, I'm not understanding how we get n from destructuring x, can you
lay this out?-->
<!-- I've elaborated a bit, does this clear it up? /Carol -->

也可以在匹配守卫中使用或运算符 `|` 来指定多个模式，同时匹配守卫的条件会作用域所有的模式。示例 18-31 展示了结合匹配守卫与使用了 `|` 的模式的优先级。这个例子中重要的部分是匹配守卫 `if y` 作用于 4、5 **和** 6，即使这看起来好像 `if y` 只作用于 6：

<!-- What's the match condition actually doing here, with y having a value of
`false`? Can you let us know how that's being applied to all the values in that
match arm? -->
<!-- The point of the example here is to illustrate operator precedence, that
this code might look like it's saying `4 | 5 | (6 if y)` but it's actually
saying `(4 | 5 | 6) if y`. I've tried to elaborate above and below, does that
make sense now? /Carol -->

```rust
let x = 4;
let y = false;

match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```

<span class="caption">示例 18-31: 结合多个模式与匹配守卫</span>

这个匹配条件表明此分支值匹配 `x` 值为 4、5 或 6 **同时** `y` 为 `true` 的情况。运行这段代码时会发生的是第一个分支的模式因 `x` 为 4 而匹配，不过匹配守卫 `if y` 为假，所以第一个分支不会被选择。代码移动到第二个分支，这会匹配，此程序会打印出 `no`。

<!-- Is this what we mean, if 4 or 5 or 6 being equal to x is false, run the
first arm? And so, because it's applying that to all of the values (including
4), the second arm is run and not the first? -->
<!-- It seems like `if y` was confusing, I've tried to spell it out a bit more.
Does this make sense now? /Carol -->

这是因为 `if` 条件作用于整个 `4 | 5 | 6` 模式，而不仅是最后的值 `6`。换句话说，匹配守卫与模式的优先级关系看起来像这样：

```text
(4 | 5 | 6) if y => ...
```

而不是：

```text
4 | 5 | (6 if y) => ...
```

可以通过运行代码时的情况看出这一点：如果匹配守卫只作用于由 `|` 运算符指定的值列表的最后一个值，这个分支就会匹配且程序会打印出 `yes`。

### `@` 绑定

<!-- Below - use @ to what, can you say explicitly what it does. Also what the
name of the operator is? -->
<!-- I don't think it has a name other than "the at operator". And we tried to
say what it does-- it creates a variable at the same time as letting us test
it, I've tried rewording a bit but I'm not sure why that wasn't explicit
enough, can you clarify if this still doesn't make sense? /Carol -->

at 运算符 `@` 允许我们在创建一个存放值的变量的同时测试其值是否匹配模式。示例 18-32 展示了一个例子，这里我们希望测试 `Message::Hello` 的 `id` 字段是否位于 `3...7` 范围内，同时也希望能其值绑定到 `id_variable` 变量中以便此分支相关联的代码可以使用它。可以将 `id_variable` 命名为 `id`，与字段同名，不过出于示例的目的这里选择了不同的名称：

```rust
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
    Message::Hello { id: id_variable @ 3...7 } => {
        println!("Found an id in range: {}", id_variable)
    },
    Message::Hello { id: 10...12 } => {
        println!("Found an id in another range")
    },
    Message::Hello { id } => {
        println!("Found some other id: {}", id)
    },
}
```

<span class="caption">示例 18-32: 使用 `@` 在模式中绑定值的同时测试它</span>

上例会打印出 `Found an id in range: 5`。通过在 `3...7` 之前指定 `id_variable @`，我们捕获了任何匹配此范围的值并同时测试其值匹配这个范围模式。

第二个分支只在模式中指定了一个范围，分支相关代码代码没有一个包含 `id` 字段实际值的变量。`id` 字段的值将会是 10、11 或 12，不过这个模式的代码并不知情也不能使用 `id` 字段中的值，因为没有将 `id` 值保存进一个变量。

最后一个分支指定了一个没有范围的变量，此时确实拥有可以用于分支代码的变量 `id`，因为这里使用了结构体字段简写语法。不过此分支中不能像头两个分支那样对 `id` 字段的值进行任何测试：任何值都会匹配此分支。

使用 `@` 可以在一个模式中同时测试和保存变量值。

## 总结

模式是 Rust 中一个很有用的功能，它帮助我们区分不同类型的数据。当用于 `match` 语句时，Rust 确保模式会包含每一个可能的值，否则程序将不能编译。`let` 语句和函数参数的模式使得这些结构更强大，可以在将值解构为更小部分的同时为变量赋值。可以创建简单或复杂的模式来满足我们的要求。

现在，作为本书的倒数第二个章节，让我们看看一些 Rust 众多功能中较为高级的部分。
