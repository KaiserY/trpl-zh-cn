# 结构体

> [ch05-00-structs.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch05-00-structs.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

`struct`，是 *structure* 的缩写，是一个允许我们命名并将多个相关值包装进一个有意义的组合的自定义类型。如果你来自一个面向对象编程语言背景，`struct`就像对象中的数据属性（字段）。在这一章的下一部分会讲到如何在结构体上定义方法；方法是如何为结构体数据指定**行为**的函数。`struct`和`enum`（将在第六章讲到）是为了充分利用 Rust 的编译时类型检查来在程序范围内创建新类型的基本组件。

对结构体的一种看法是他们与元组类似，这个我们在第三章讲过了。就像元组，结构体的每一部分可以是不同类型。可以命名各部分数据以便能更清楚的知道其值的意义。由于有了这些名字使得结构体更灵活：不需要依赖顺序来指定或访问实例中的值。

为了定义结构体，通过`struct`关键字并为整个结构体提供一个名字。结构体的名字需要描述它所组合的数据的意义。接着，在大括号中，定义每一部分数据的名字，他们被称作**字段**（*field*），并定义字段类型。例如，列表 5-1 展示了一个储存用户账号信息的结构体：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

<span class="caption">Listing 5-1: A `User` struct definition</span>

一旦定义了结构体后为了使用它，通过为每个字段指定具体值来创建这个结构体的**实例**。创建一个实例需要以结构体的名字开头，接着在大括号中使用`key: value`对的形式提供字段，其中 key 是字段的名字而 value 是需要储存在字段中的数据值。这时字段的顺序并不必要与在结构体中声明他们的顺序一致。换句话说，结构体的定义就像一个这个类型的通用模板，而实例则会在这个模板中放入特定数据来创建这个类型的值。例如，我们可以像这样来声明一个特定的用户：

```rust
# struct User {
#     username: String,
#     email: String,
#     sign_in_count: u64,
#     active: bool,
# }
#
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

为了从结构体中获取某个值，可以使用点号。如果我们只想要用户的邮箱地址，可以用`user1.email`。

## 结构体数据的所有权

在列表 5-1 中的`User`结构体的定义中，我们使用了自身拥有所有权的`String`类型而不是`&str`字符串 slice 类型。这是一个有意而为之的选择，因为我们想要这个结构体拥有它所有的数据，为此只要整个结构体是有效的话其数据也应该是有效的。

可以使结构体储存被其他对象拥有的数据的引用，不过这么做的话需要用上**生命周期**（*lifetimes*），这是第十章会讨论的一个 Rust 的功能。生命周期确保结构体引用的数据有效性跟结构体本身保持一致。如果你尝试在结构体中储存一个引用而不指定生命周期，比如这样：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
struct User {
    username: &str,
    email: &str,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let user1 = User {
        email: "someone@example.com",
        username: "someusername123",
        active: true,
        sign_in_count: 1,
    };
}
```

编译器会抱怨它需要生命周期说明符：

```
error[E0106]: missing lifetime specifier
 -->
  |
2 |     username: &str,
  |               ^ expected lifetime parameter

error[E0106]: missing lifetime specifier
 -->
  |
3 |     email: &str,
  |            ^ expected lifetime parameter
```

第十章会讲到如何修复这个问题以便在结构体中储存引用，不过现在，通过从像`&str`这样的引用切换到像`String`这类拥有所有权的类型来修改修改这个错误。

## 一个示例程序

为了理解何时会需要使用结构体，让我们编写一个计算长方形面积的程序。我们会从单独的变量开始，接着重构程序直到使用结构体替代他们为止。

使用 Cargo 来创建一个叫做 *rectangles* 的新二进制程序，它会获取一个长方形以像素为单位的长度和宽度并计算它的面积。列表 5-2 中是项目的 *src/main.rs* 文件中为此实现的一个小程序：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let length1 = 50;
    let width1 = 30;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(length1, width1)
    );
}

fn area(length: u32, width: u32) -> u32 {
    length * width
}
```

<span class="caption">Listing 5-2: Calculating the area of a rectangle
specified by its length and width in separate variables</span>

尝试使用`cargo run`运行程序：

```
The area of the rectangle is 1500 square pixels.
```

### 使用元组重构

我们的小程序能正常运行；它调用`area`函数用长方形的每个维度来计算出面积。不过我们可以做的更好。长度和宽度是相关联的，因为他们在一起才能定义一个长方形。

这个做法的问题突显在`area`的签名上：

```rust,ignore
fn area(length: u32, width: u32) -> u32 {
```

函数`area`本应该计算一个长方形的面积，不过函数却有两个参数。这两个参数是相关联的，不过程序自身却哪里也没有表现出这一点。将长度和宽度组合在一起将更易懂也更易处理。

第三章已经讨论过了一种可行的方法：元组。列表 5-3 是一个使用元组的版本：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let rect1 = (50, 30);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

<span class="caption">Listing 5-3: Specifying the length and width of the
rectangle with a tuple</span>

<!-- I will add ghosting & wingdings once we're in libreoffice /Carol -->

在某种程度上说这样好一点了。元组帮助我们增加了一些结构性，现在在调用`area`的时候只用传递一个参数。不过另一方面这个方法却更不明确了：元组并没有给出它元素的名称，所以计算变得更费解了，因为不得不使用索引来获取元组的每一部分：

<!-- I will change this to use wingdings instead of repeating this code once
we're in libreoffice /Carol -->

```rust,ignore
dimensions.0 * dimensions.1
```

在面积计算时混淆长宽并没有什么问题，不过当在屏幕上绘制长方形时就有问题了！我们将不得不记住元组索引`0`是`length`而`1`是`width`。如果其他人要使用这些代码，他们也不得不搞清楚后再记住他们。容易忘记或者混淆这些值而造成错误，因为我们没有表明代码中数据的意义。

### 使用结构体重构：增加更多意义

现在引入结构体的时候了。我们可以将元组转换为一个有整体名称而且每个部分也有对应名字的数据类型，如列表 5-4 所示：

<span class="filename">Filename: src/main.rs</span>

```rust
struct Rectangle {
    length: u32,
    width: u32,
}

fn main() {
    let rect1 = Rectangle { length: 50, width: 30 };

    println!(
        "The area of the rectangle is {} square pixels.",
        area(&rect1)
    );
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.length * rectangle.width
}
```

<span class="caption">Listing 5-4: Defining a `Rectangle` struct</span>

<!-- Will add ghosting & wingdings once we're in libreoffice /Carol -->

这里我们定义了一个结构体并称其为`Rectangle`。在`{}`中定义了字段`length`和`width`，都是`u32`类型的。接着在`main`中，我们创建了一个长度为 50 和宽度为 30 的`Rectangle`的具体实例。

函数`area`现在被定义为接收一个名叫`rectangle`的参数，它的类型是一个结构体`Rectangle`实例的不可变借用。第四章讲到过，我们希望借用结构体而不是获取它的所有权这样`main`函数就可以保持`rect1`的所有权并继续使用它，所以这就是为什么在函数签名和调用的地方会有`&`。

`area`函数访问`Rectangle`的`length`和`width`字段。`area`的签名现在明确的表明了我们的意图：通过其`length`和`width`字段，计算一个`Rectangle`的面积，。这表明了长度和宽度是相互联系的，并为这些值提供了描述性的名称而不是使用元组的索引值`0`和`1`。结构体胜在更清晰明了。

### 通过衍生 trait 增加实用功能

如果能够在调试程序时打印出`Rectangle`实例来查看其所有字段的值就更好了。列表 5-5 尝试像往常一样使用`println!`宏：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
struct Rectangle {
    length: u32,
    width: u32,
}

fn main() {
    let rect1 = Rectangle { length: 50, width: 30 };

    println!("rect1 is {}", rect1);
}
```

<span class="caption">Listing 5-5: Attempting to print a `Rectangle`
instance</span>

如果运行代码，会出现带有如下核心信息的错误：

```
error[E0277]: the trait bound `Rectangle: std::fmt::Display` is not satisfied
```

`println!`宏能处理很多类型的格式，不过，`{}`，默认告诉`println!`使用称为`Display`的格式：直接提供给终端用户查看的输出。目前为止见过的基本类型都默认实现了`Display`，所以它就是向用户展示`1`或其他任何基本类型的唯一方式。不过对于结构体，`println!`应该用来输出的格式是不明确的，因为这有更多显示的可能性：是否需要逗号？需要打印出结构体的`{}`吗？所有字段都应该显示吗？因为这种不确定性，Rust 不尝试猜测我们的意图所以结构体并没有提供一个`Display`的实现。

但是如果我们继续阅读错误，将会发现这个有帮助的信息：

```
note: `Rectangle` cannot be formatted with the default formatter; try using
`:?` instead if you are using a format string
```

让我们来试试！现在`println!`看起来像`println!("rect1 is {:?}", rect1);`这样。在`{}`中加入`:?`指示符告诉`println!`我们想要使用叫做`Debug`的输出格式。`Debug`是一个 trait，它允许我们在调试代码时以一种对开发者有帮助的方式打印出结构体。

让我们试试运行这个变化...见鬼了。仍然能看到一个错误：

```
error: the trait bound `Rectangle: std::fmt::Debug` is not satisfied
```

虽然编译器又一次给出了一个有帮助的信息！

```
note: `Rectangle` cannot be formatted using `:?`; if it is defined in your
crate, add `#[derive(Debug)]` or manually implement it
```

Rust **确实**包含了打印出调试信息的功能，不过我们必须为结构体显式选择这个功能。为此，在结构体定义之前加上`#[derive(Debug)]`注解，如列表 5-6 所示：

```rust
#[derive(Debug)]
struct Rectangle {
    length: u32,
    width: u32,
}

fn main() {
    let rect1 = Rectangle { length: 50, width: 30 };

    println!("rect1 is {:?}", rect1);
}
```

<span class="caption">Listing 5-6: Adding the annotation to derive the `Debug`
trait and printing the `Rectangle` instance using debug formatting</span>

此时此刻运行程序，运行这个程序，不会有任何错误并会出现如下输出：

```
rect1 is Rectangle { length: 50, width: 30 }
```

好极了！这不是最漂亮的输出，不过它显示这个实例的所有字段，毫无疑问这对调试有帮助。如果想要输出再好看和易读一点，这对更大的结构体会有帮助，可以将`println!`的字符串中的`{:?}`替换为`{:#?}`。如果在这个例子中使用了美化的调试风格的话，输出会看起来像这样：

```
rect1 is Rectangle {
    length: 50,
    width: 30
}
```

Rust 为我们提供了很多可以通过`derive`注解来使用的 trait，他们可以为我们的自定义类型增加有益的行为。这些 trait 和行为在附录 C 中列出。第十章会涉及到如何通过自定义行为来实现这些 trait，同时还有如何创建你自己的 trait。

我们的`area`函数是非常明确的————它只是计算了长方形的面积。如果这个行为与`Rectangle`结构体再结合得更紧密一些就更好了，因为这明显就是`Rectangle`类型的行为。现在让我们看看如何继续重构这些代码，来将`area`函数协调进`Rectangle`类型定义的`area`**方法**中。
