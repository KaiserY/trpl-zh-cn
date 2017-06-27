## 所有的模式语法

通过本书我们已领略过一些不同类型模式的例子. 本节会列出所有在模式中有效的语法并且会阐述你为什么可能会用到它们中的每一个.

### 字面量

我们在第6章已经见过, 你可以直接匹配字面量:

```rust
let x = 1;

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

这段代码会打印`one`因为`x`的值是1.

### 命名变量

命名变量是可匹配任何值的`irrefutable`(不可反驳)模式.

与所有变量一样, 模式中声明的变量会屏蔽`match`表达式外层的同名变量, 因为一个`match`表达式会开启一个新的作用域. 在列表18-10中, 我们声明了一个值为`Some(5)`的变量`x`和一个值为`10`的变量`y`. 然后是一个值`x`上的`match`表达式. 看一看匹配分支的模式和结尾的`println!`, 你可以在继续阅读或运行代码前猜一猜什么会被打印出来:

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

<span class="caption">列表18-10: 引入了一个阴影变量`y`的`match`语句</span>

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

让我们看看当`match`语句运行的时候发生了什么. 第一个匹配分支是模式`Some(50)`, `x`中的值(`Some(5)`)不匹配`Some(50)`, 所以我们继续. 在第二个匹配分支中, 模式`Some(y)`引入了一个可以匹配在`Some`里的任意值的新变量`y`. 因为我们位于`match`表达式里面的新作用域中, 所以`y`就是一个新变量而不是在开头被声明的其值为10的变量`y`. 这个新的`y`绑定将会匹配在`Some`中的任意值, 这里也就是`x`中的值, 因为`y`绑定到`Some`中的值是`x`, 这里是5, 所以我们就执行了这个分支中的表达式并打印出`Matched, y = 5`.

如果`x`的值是`None`而不是`Some(5)`, 我们将会匹配下划线因为其它两个分支的模式将不会被匹配. 在这个匹配分支(下划线)的表达式里, 因为我们没有在分支的模式中引入变量`x`, 所以这个`x`仍然是`match`作用域外部的那个没被屏蔽的`x`. 在这个假想的例子中, `match`表达式将会打印出`Default case, x =
None`.

一旦`match`表达式执行完毕, 它的作用域也就结束了, 同时`match`内部的`y`也就结束了. 最后的`println!`会打印`at the end: x = Some(5), y = 10`.

为了让`match`表达式能比较外部变量`x`和`y`的值而不是内部引入的阴影变量`x`和`y`, 我们需要使用一个有条件的匹配守卫(guard). 我们将在本节的后面讨论匹配守卫.

### 多种模式

只有在`match`表达式中, 你可以通过`|`符号匹配多个模式, 它代表*或*(*or*)的意思:

```rust
let x = 1;

match x {
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

上面的代码会打印`one or two`.

### 通过`...`匹配值的范围

你可以用`...`匹配一个值包含的范围:

```rust
let x = 5;

match x {
    1 ... 5 => println!("one through five"),
    _ => println!("something else"),
}
```

上面的代码中, 如果`x`是1、 2、 3、 4或5, 第一个分支就会匹配.

范围只能是数字或`char`类型的值. 下面是一个使用`char`类型值范围的例子:

```rust
let x = 'c';

match x {
    'a' ... 'j' => println!("early ASCII letter"),
    'k' ... 'z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```

上面的代码会打印`early ASCII letter`.

### 解构并提取值

模式可以用来*解构*(*destructure*)结构、枚举、元组和引用. 解构意味着把一个值分解成它的组成部分. 例18-11中的结构`Point`有两个字段`x`和`y`, 我们可以通过一个模式和`let`语句来进行提取:

<span class="filename">Filename: src/main.rs</span>

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

<span class="caption">例18-11: 用结构的字段来解构</span>

上面的代码创建了匹配`p`中的`x`和`y`字段的变量`x`和`y`. 变量的名字必须匹配使用了这个写法中的字段. 如果我们想使用不同的变量名字, 我们可以在模式中使用`field_name: variable_name`. 在例18-12中, `a`会拥有`Point`实例的`x`字段的值, `b`会拥有`y`字段的值:

<span class="filename">Filename: src/main.rs</span>

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

<span class="caption">例18-12: 把结构解构到与字段不同名的变量中</span>

为了测试和使用一个值内部的某个属性, 我们也可以用字面量来解构. 例18-13用一个`match`语句来判断一个点是位于`x`(此时`y` = 0)轴上还是在`y`(此时`x` = 0)轴上或者不在两个轴上面:

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

<span class="caption">例18-13: 解构和匹配一个模式中的字面量</span>

上面的代码会打印`On the y axis at 7`, 因为`p`的`x`字段的值是0, 这正好匹配第二个分支.

在第6章中我们对枚举进行了解构, 比如例6-5中, 我们用一个`match`表达式来解构一个`Option<i32>`, 其中被提取出来的一个值是`Some`内的变量.

当我们正匹配的值在一个包含了引用的模式里面时, 为了把引用和值分割开我们可以在模式中指定一个`&`符号. 在迭代器对值的引用进行迭代时当我们想在闭包中使用值而不是引用的时侯这个符号在闭包里特别有用. 例18-14演示了如何在一个向量里迭代`Point`实例的引用, 为了能方便地对`x`和`y`的值进行计算还对引用的结构进行了解构:

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
    .map(|&Point {x, y}| x * x + y * y)
    .sum();
```

<span class="caption">例18-14: 把结构的引用解构到结构的字段值中</span>

因为`iter`会对向量里面的项目的引用进行迭代, 如果我们在`map`里的闭包的参数上忘了`&`符号, 我们将会得到下面的类型不匹配的错误:

```text
error[E0308]: mismatched types
  -->
   |
14 |         .map(|Point {x, y}| x * x + y * y)
   |               ^^^^^^^^^^^^ expected &Point, found struct `Point`
   |
   = note: expected type `&Point`
              found type `Point`
```

这个报错提示Rust希望我们的闭包匹配参数匹配`&Point`, 但是我们却试图用一个`Point`的值的模式去匹配它, 而不是一个`Point`的引用.

我们可以用更复杂的方法来合成、匹配和嵌套解构模式: 下例中我们通过在一个元组中嵌套结构和元组来解构出所有的基础类型的值:

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

这使得我们把复杂的类型提取成了它们的组成成分.

### 忽略模式中的值

有一些简单的方法可以忽略模式中全部或部分值: 使用`_`模式, 在另一个模式中使用`_`模式, 使用一个以下划线开始的名字, 或者使用`..`来忽略掉所有剩下的值. 下面让我们来探索如何以及为什么要这么做.

#### 用`_`忽略整个值

我们已经见过了用下划线作为通配符会匹配任意值, 但是它不会绑定值. 把下划线模式用作`match`表达式的最后一个匹配分支特别有用, 我们可以在任意模式中使用它, 比如在例18-15中显示的函数参数:

```rust
fn foo(_: i32) {
    // code goes here
}
```

<span class="caption">例18-15: 在一个函数签名中使用`_`</span>

通常, 你应该把这种函数的参数声明改成不用无用参数. 如果是要实现这样一个有特定类型签名的*trait*, 使用下划线可以让你忽略一个参数, 并且编译器不会像使用命名参数那样警告有未使用的函数参数.

#### 用一个嵌套的`_`忽略部分值

我们也可以在另一个模式中使用`_`来忽略部分值. 在例18-16中, 第一个`match`分支中的模式匹配了一个`Some`值, 但是却通过下划线忽略掉了`Some`变量中的值:

```rust
let x = Some(5);

match x {
    Some(_) => println!("got a Some and I don't care what's inside"),
    None => (),
}
```

<span class="caption">例18-16: 通过使用一个嵌套的下划线忽略`Some`变量中的值</span>

当代码关联的`match`分支不需要使用被嵌套的全部变量时这很有用.

我们也可以在一个模式中多处使用下划线, 在例18-17中我们将忽略掉一个五元元组中的第二和第四个值:

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {}, {}, {}", first, third, fifth)
    },
}
```

<span class="caption">例18-17: 忽略元组中的多个部分</span>

上面的代码将会打印出`Some numbers: 2, 8, 32`, 元组中的4和16会被忽略.

#### 通过在名字前以一个下划线开头来忽略不使用的变量

如果你创建了一个变量却不使用它, Rust通常会给你一个警告, 因为这可能会是个bug. 如果你正在做原型或者刚开启一个项目, 那么你可能会创建一个暂时不用但是以后会使用的变量. 如果你面临这个情况并且希望Rust不要对你警告未使用的变量, 你可以让那个变量以一个下划线开头. 这和其它模式中的变量名没什么区别, 只是Rust不会警告你这个变量没用被使用. 在例18-18中, 我们会得到一个没用使用变量`y`的警告, 但是我们不会得到没用使用变量`_x`的警告:

```rust
fn main() {
    let _x = 5;
    let y = 10;
}
```

<span class="caption">例18-18: 为了消除对未被使用变量的警告以一个下划线开始来命名变量</span>

注意, 只使用`_`和使用一个以一个下划线起头的名字是有微妙的不同的: `_x`仍然会把值绑定到变量上但是`_`不会绑定值.

例18-19显示了这种区别的主要地方: `s`将仍然被转移到`_s`, 它会阻止我们继续使用`s`:

```rust,ignore
let s = Some(String::from("Hello!"));

if let Some(_s) = s {
    println!("found a string");
}

println!("{:?}", s);
```

<span class="caption">例18-19: 以下划线起头的未被使用的变量仍然会绑定值, 它也会拥有值的所有权</span>

只使用下划线本身却不会绑定值. 例18-20在编译时将不会报错, 因为`s`不会被转移到`_`:

```rust
let s = Some(String::from("Hello!"));

if let Some(_) = s {
    println!("found a string");
}

println!("{:?}", s);
```

<span class="caption">例18-20: 使用下划线不会绑定值</span>

上面的代码能很好的运行. 因为我们没有把`s`绑定到其它地方, 它没有被转移.

#### 用`..`忽略剩余的值

对于有多个字段的值而言, 我们可以只提取少数字段并使用`..`来代替下划线, 这就避免了用`_`把剩余的部分列出来的麻烦. `..`模式将忽略值中没有被精确匹配值中的其它部分. 在例18-21中, 我们有一个持有三维空间坐标的`Point`结构. 在`match`表达式里,
我们只想操作`x`坐标上的值并忽略`y`坐标和`z`坐标上的值:

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

<span class="caption">例18-21: 通过用`..`来忽略除了`x`以外的所有其它`Point`的字段</span>

使用`..`比列出`y: _`和`z: _`写起来更简单. 当一个结构有很多字段但却只需要使用少量字段时`..`模式就特别有用.

`..`将会囊括它能匹配的尽可能多的值. 例18-22显示了一个在元组中使用`..`的情况:

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

<span class="caption">例18-22: 用`..`匹配元组中的第一和最后一个值并忽略掉所有的其它值</span>

我们在这里用`first`和`last`来匹配了第一和最后一个值. `..`将匹配并忽略中间的所有其它值.

然而使用`..`必须清晰明了. 例18-23中的代码就不是很清晰, Rust看不出哪些值时我们想匹配的, 也看不出哪些值是我们想忽略的:

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

<span class="caption">例18-23: 尝试含混不清地使用`..`</span>

如果我们编译上面的例子, 我们会得到下面的错误:

```text
error: `..` can only be used once per tuple or tuple struct pattern
 --> src/main.rs:5:22
  |
5 |         (.., second, ..) => {
  |                      ^^
```

上面的代码中在一个值被匹配到`second`之前不可能知道元组中有多少值应该被忽略, 同样在`second`被匹配后也不知道应该有多少值被忽略. 我们可以忽略2, 把`second`绑定到4, 然后忽略8、16和32, 或者我们也可以忽略2和4, 把`second`绑定到8, 然后再忽略16和32. 对Rust而言, 变量名`second`并不意味着某个确定的值, 因为像这样在两个地方使用`..`是含混不清的, 所以我们就得到了一个编译错误.

### 用`ref`和`ref mut`在模式中创建引用

当你匹配一个模式时, 模式匹配的变量会被绑定到一个值. 也就是说你会把值转移进`match`(或者是其它你使用了模式的地方), 这是所有权规则的作用. 例18-24提供了一个例子:

```rust,ignore
let robot_name = Some(String::from("Bors"));

match robot_name {
    Some(name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">例18-24: 在一个匹配分支模式里创建的变量会拥有值的所有权</span>

上例的代码不能编译通过, 因为`robot_name`中的值被转移到了`match`中的`Some`的值所绑定的`name`里了.

在模式中使用`&`会匹配已存在的引用中的值, 我们在"解构并提取值"这一节中已经见过了. 如果你想创建一个引用来借用模式中变量的值, 可以在新变量名前使用`ref`关键字, 比如例18-25:

```rust
let robot_name = Some(String::from("Bors"));

match robot_name {
    Some(ref name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">例18-25: 创建一个引用这样模式中的变量就不会拥有值的所有权</span>

上例可以编译, 因为`robot_name`没有被转移到`Some(ref name)`匹配分支的`Some`变量中; 这个匹配分支只是持有`robot_name`中的数据, `robot_name`并没被转移.

如果要创建一个可变引用, 可以像例18-26那样使用`ref mut`:

```rust
let mut robot_name = Some(String::from("Bors"));

match robot_name {
    Some(ref mut name) => *name = String::from("Another name"),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

<span class="caption">例18-26: 在模式中使用`ref mut`来创建一个值的可变引用</span>

上例可以编译并打印出`robot_name is: Some("Another name")`. 因为在匹配分支的代码中`name`是一个可变引用, 为了能够改变这个值, 我们需要用`*`操作符来对它解引用.

### 用了匹配守卫的额外条件

你可以通过在模式后面指定一个额外的`if`条件来往匹配分支中引入*匹配守卫*(*match guards*). 这个条件可以使用模式中创建的变量. 例18-27中的`match`表达式的第一个匹配分支就有一个匹配守卫:

```rust
let num = Some(4);

match num {
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}
```

<span class="caption">例18-27: 往一个模式中加入匹配守卫</span>

上例会打印`less than five: 4`. 如果把`num`换成`Some(7)`, 上例将会打印`7`.  匹配守卫让你能表达出模式不能给予你的更多的复杂的东西.

在例18-10中, 我们见过了模式中的阴影变量, 当一个值等于`match`外部的变量时我们不能用模式来表达出这种情况. 例18-28演示了我们如何用一个匹配守卫来解决这个问题:

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

<span class="caption">例18-28: 用一个匹配守卫来测试与外部变量的相等性</span>

上例会打印出`Default case, x = Some(5)`. 因为第二个匹配分支没有往模式中引入新变量`y`, 所以外部变量`y`就不会被遮掩, 这样我们就可以在匹配守卫中直接使用外部变量`y`. 我们还把`x`解构到了内部变量`n`中, 这样我们就可以在匹配守卫中比较`n`和`y`了.

If you're using a match guard with multiple patterns specified by `|`, the
match guard condition applies to all of the patterns. Listing 18-29 shows a
match guard that applies to the value matched by all three patterns in the
first arm:

```rust
let x = 4;
let y = false;

match x {
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```

<span class="caption">Listing 18-29: Combining multiple patterns with a match
guard</span>

This prints `no` since the `if` condition applies to the whole pattern `4 | 5 |
6`, not only to the last value `6`. In other words, the precedence of a match
guard in relation to a pattern behaves like this:

```text
(4 | 5 | 6) if y => ...
```

rather than this:

```text
4 | 5 | (6 if y) => ...
```

### `@` Bindings

In order to test a value in a pattern but also be able to create a variable
bound to the value, we can use `@`. Listing 18-30 shows an example where we
want to test that a `Message::Hello` `id` field is within the range `3...7` but
also be able to bind to the value so that we can use it in the code associated
with the arm:

```rust
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
    Message::Hello { id: id @ 3...7 } => {
        println!("Found an id in range: {}", id)
    },
    Message::Hello { id: 10...12 } => {
        println!("Found an id in another range")
    },
    Message::Hello { id } => {
        println!("Found some other id: {}", id)
    },
}
```

<span class="caption">Listing 18-30: Using `@` to bind to a value in a pattern
while also testing it</span>

This example will print `Found an id in range: 5`. By specifying `id @` before
the range, we're capturing whatever value matched the range while also testing
it. In the second arm where we only have a range specified in the pattern, the
code associated with the arm doesn't know if `id` is 10, 11, or 12, since we
haven't saved the `id` value in a variable: we only know that the value matched
something in that range if that arm's code is executed. In the last arm where
we've specified a variable without a range, we do have the value available to
use in the arm's code, but we haven't applied any other test to the value.
Using `@` lets us test a value and save it in a variable within one pattern.

## Summary

Patterns are a useful feature of Rust that help to distinguish between
different kinds of data. When used in `match` statements, Rust makes sure that
your patterns cover every possible value. Patterns in `let` statements and
function parameters make those constructs more powerful, enabling the
destructuring of values into smaller parts at the same time as assigning to
variables.

Now, for the penultimate chapter of the book, let's take a look at some
advanced parts of a variety of Rust's features.
