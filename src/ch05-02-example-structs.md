## 一个使用结构体的示例程序

> [ch05-02-example-structs.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch05-02-example-structs.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

为了理解何时会需要使用结构体，让我们编写一个计算长方形面积的程序。我们会从单独的变量开始，接着重构程序直到使用结构体替代他们为止。

使用 Cargo 来创建一个叫做 *rectangles* 的新二进制程序，它会获取一个长方形以像素为单位的长度和宽度并计算它的面积。示例 5-2 中是项目的 *src/main.rs* 文件中为此实现的一个小程序：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 5-8：通过指定长方形的长宽变量来计算长方形面积</span>

尝试使用 `cargo run` 运行程序：

```text
The area of the rectangle is 1500 square pixels.
```

### 使用元组重构

虽然示例 5-8 可以运行，并调用 `area` 函数用长方形的每个维度来计算出面积，不过我们可以做的更好。长度和宽度是相关联的，因为他们在一起才能定义一个长方形。

这个做法的问题突显在 `area` 的签名上：

```rust,ignore
fn area(length: u32, width: u32) -> u32 {
```

函数 `area` 本应该计算一个长方形的面积，不过函数却有两个参数。这两个参数是相关联的，不过程序自身却哪里也没有表现出这一点。将长度和宽度组合在一起将更易懂也更易处理。第三章的 “将值组合进元组” 部分已经讨论过了一种可行的方法：元组。示例 5-9 是另一个使用元组的版本：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 5-8：使用元组来指定长方形的长宽</span>

在某种程度上说这样好一点了。元组帮助我们增加了一些结构性，现在在调用 `area` 的时候只用传递一个参数。不过在另一方面这个方法却更不明确了：元组并没有给出它元素的名称，所以计算变得更费解了，因为不得不使用索引来获取元组的每一部分：

在面积计算时混淆长宽并没有什么问题，不过当在屏幕上绘制长方形时就有问题了！我们将不得不记住元组索引 `0` 是 `length` 而 `1` 是 `width`。如果其他人要使用这些代码，他们也不得不搞清楚并记住他们。容易忘记或者混淆这些值而造成错误，因为我们没有表明代码中数据的意义。

### 使用结构体重构：增加更多意义

现在引入结构体的时候了。我们可以将元组转换为一个有整体名称而且每个部分也有对应名字的数据类型，如示例 5-10 所示：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 5-10：定义 `Rectangle` 结构体</span>

这里我们定义了一个结构体并称其为 `Rectangle`。在 `{}` 中定义了字段 `length` 和 `width`，都是 `u32` 类型的。接着在 `main` 中，我们创建了一个长度为 50 和宽度为 30 的 `Rectangle` 的具体实例。

函数 `area` 现在被定义为接收一个名叫 `rectangle` 的参数，它的类型是一个结构体 `Rectangle` 实例的不可变借用。第四章讲到过，我们希望借用结构体而不是获取它的所有权这样 `main` 函数就可以保持 `rect1` 的所有权并继续使用它，所以这就是为什么在函数签名和调用的地方会有 `&`。

`area` 函数访问 `Rectangle` 的 `length` 和 `width` 字段。`area` 的签名现在明确的表明了我们的意图：通过其 `length` 和 `width` 字段，计算一个 `Rectangle` 的面积。这表明了长度和宽度是相互联系的，并为这些值提供了描述性的名称而不是使用元组的索引值 `0` 和 `1` 。结构体胜在更清晰明了。

### 通过衍生 trait 增加实用功能

如果能够在调试程序时打印出 `Rectangle` 实例来查看其所有字段的值就更好了。示例 5-11 像往常一样使用 `println!` 宏：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 5-11：尝试打印出 `Rectangle` 实例</span>

如果运行代码，会出现带有如下核心信息的错误：

```text
error[E0277]: the trait bound `Rectangle: std::fmt::Display` is not satisfied
```

`println!` 宏能处理很多类型的格式，不过，`{}`，默认告诉 `println!` 使用被称为 `Display` 的格式：直接提供给终端用户查看的输出。目前为止见过的基本类型都默认实现了 `Display`，因为它就是向用户展示 `1` 或其他任何基本类型的唯一方式。不过对于结构体，`println!` 应该用来输出的格式是不明确的，因为这有更多显示的可能性：是否需要逗号？需要打印出结构体的 `{}` 吗？所有字段都应该显示吗？因为这种不确定性，Rust 不尝试猜测我们的意图所以结构体并没有提供一个 `Display` 实现。

但是如果我们继续阅读错误，将会发现这个有帮助的信息：

```text
note: `Rectangle` cannot be formatted with the default formatter; try using
`:?` instead if you are using a format string
```

让我们来试试！现在 `println!` 宏调用看起来像 `println!("rect1 is {:?}", rect1);` 这样。在 `{}` 中加入 `:?` 指示符告诉 `println!` 我们想要使用叫做 `Debug` 的输出格式。`Debug` 是一个 trait，它允许我们在调试代码时以一种对开发者有帮助的方式打印出结构体。

让我们试试运行这个变化。见鬼了！仍然能看到一个错误：

```text
error: the trait bound `Rectangle: std::fmt::Debug` is not satisfied
```

不过编译器又一次给出了一个有帮助的信息！

```text
note: `Rectangle` cannot be formatted using `:?`; if it is defined in your
crate, add `#[derive(Debug)]` or manually implement it
```

Rust **确实** 包含了打印出调试信息的功能，不过我们必须为结构体显式选择这个功能。为此，在结构体定义之前加上 `#[derive(Debug)]` 注解，如示例 5-12 所示：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 5-12：增加注解来导出 `Debug` trait </span>

此时此刻运行程序，运行这个程序，不会有任何错误并会出现如下输出：

```text
rect1 is Rectangle { length: 50, width: 30 }
```

好极了！这并不是最漂亮的输出，不过它显示这个实例的所有字段，毫无疑问这对调试有帮助。如果想要输出再好看和易读一点，可以将 `println!` 的字符串中的 `{:?}` 替换为 `{:#?} `，这对更大的结构体会有帮助。如果在这个例子中使用了 `{:#?}` 风格的话，输出会看起来像这样：

```text
rect1 is Rectangle {
    length: 50,
    width: 30
}
```

Rust 为我们提供了很多可以通过 `derive` 注解来使用的 trait，他们可以为我们的自定义类型增加实用的行为。这些 trait 和行为在附录 C 中列出。第十章会涉及到如何通过自定义行为来实现这些 trait，同时还有如何创建你自己的 trait。

我们的 `area` 函数是非常特化的————它只是计算了长方形的面积。如果这个行为与 `Rectangle` 结构体再结合得更紧密一些就更好了，因为它不能用于其他类型。现在让我们看看如何继续重构这些代码，来将 `area` 函数协调进 `Rectangle` 类型定义的`area` **方法** 中。
