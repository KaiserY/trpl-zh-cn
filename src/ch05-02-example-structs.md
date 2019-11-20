## 一个使用结构体的示例程序

> [ch05-02-example-structs.md](https://github.com/rust-lang/book/blob/master/src/ch05-02-example-structs.md)
> <br>
> commit 9cb1d20394f047855a57228dc4cbbabd0a9b395a

为了理解何时会需要使用结构体，让我们编写一个计算长方形面积的程序。我们会从单独的变量开始，接着重构程序直到使用结构体替代他们为止。

使用 Cargo 新建一个叫做 *rectangles* 的二进制程序，它获取以像素为单位的长方形的宽度和高度，并计算出长方形的面积。示例 5-8 显示了位于项目的 *src/main.rs* 中的小程序，它刚刚好实现此功能：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

<span class="caption">示例 5-8：通过分别指定长方形的宽和高的变量来计算长方形面积</span>

现在使用 `cargo run` 运行程序：

```text
The area of the rectangle is 1500 square pixels.
```

虽然示例 5-8 可以运行，并在调用 `area` 函数时传入每个维度来计算出长方形的面积，不过我们可以做的更好。宽度和高度是相关联的，因为他们在一起才能定义一个长方形。

这些代码的问题突显在 `area` 的签名上：

```rust,ignore
fn area(width: u32, height: u32) -> u32 {
```

函数 `area` 本应该计算一个长方形的面积，不过函数却有两个参数。这两个参数是相关联的，不过程序本身却没有表现出这一点。将长度和宽度组合在一起将更易懂也更易处理。第三章的 [“元组类型”][the-tuple-type] 部分已经讨论过了一种可行的方法：元组。

### 使用元组重构

示例 5-9 展示了使用元组的另一个程序版本。

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let rect1 = (30, 50);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

<span class="caption">示例 5-9：使用元组来指定长方形的宽高</span>

在某种程度上说，这个程序更好一点了。元组帮助我们增加了一些结构性，并且现在只需传一个参数。不过在另一方面，这个版本却有一点不明确了：元组并没有给出元素的名称，所以计算变得更费解了，因为不得不使用索引来获取元组的每一部分：

在计算面积时将宽和高弄混倒无关紧要，不过当在屏幕上绘制长方形时就有问题了！我们必须牢记 `width` 的元组索引是 `0`，`height` 的元组索引是 `1`。如果其他人要使用这些代码，他们必须要搞清楚这一点，并也要牢记于心。很容易忘记或者混淆这些值而造成错误，因为我们没有在代码中传达数据的意图。

### 使用结构体重构：赋予更多意义

我们使用结构体为数据命名来为其赋予意义。我们可以将我们正在使用的元组转换成一个有整体名称而且每个部分也有对应名字的数据类型，如示例 5-10 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        area(&rect1)
    );
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.width * rectangle.height
}
```

<span class="caption">示例 5-10：定义 `Rectangle` 结构体</span>

这里我们定义了一个结构体并称其为 `Rectangle`。在大括号中定义了字段 `width` 和 `height`，类型都是 `u32`。接着在 `main` 中，我们创建了一个具体的 `Rectangle` 实例，它的宽是 30，高是 50。

函数 `area` 现在被定义为接收一个名叫 `rectangle` 的参数，其类型是一个结构体 `Rectangle` 实例的不可变借用。第四章讲到过，我们希望借用结构体而不是获取它的所有权，这样 `main` 函数就可以保持 `rect1` 的所有权并继续使用它，所以这就是为什么在函数签名和调用的地方会有 `&`。

`area` 函数访问 `Rectangle` 实例的 `width` 和 `height` 字段。`area` 的函数签名现在明确的阐述了我们的意图：使用 `Rectangle` 的 `width` 和 `height` 字段，计算 `Rectangle` 的面积。这表明宽高是相互联系的，并为这些值提供了描述性的名称而不是使用元组的索引值 `0` 和 `1` 。结构体胜在更清晰明了。

### 通过派生 trait 增加实用功能

如果能够在调试程序时打印出 `Rectangle` 实例来查看其所有字段的值就更好了。示例 5-11 像前面章节那样尝试使用 `println!` 宏。但这并不行。

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!("rect1 is {}", rect1);
}
```

<span class="caption">示例 5-11：尝试打印出 `Rectangle` 实例</span>

当我们运行这个代码时，会出现带有如下核心信息的错误：

```text
error[E0277]: `Rectangle` doesn't implement `std::fmt::Display`
```

`println!` 宏能处理很多类型的格式，不过，`{}` 默认告诉 `println!` 使用被称为 `Display` 的格式：意在提供给直接终端用户查看的输出。目前为止见过的基本类型都默认实现了 `Display`，因为它就是向用户展示 `1` 或其他任何基本类型的唯一方式。不过对于结构体，`println!` 应该用来输出的格式是不明确的，因为这有更多显示的可能性：是否需要逗号？需要打印出大括号吗？所有字段都应该显示吗？由于这种不确定性，Rust 不会尝试猜测我们的意图，所以结构体并没有提供一个 `Display` 实现。

但是如果我们继续阅读错误，将会发现这个有帮助的信息：

```text
= help: the trait `std::fmt::Display` is not implemented for `Rectangle`
= note: in format strings you may be able to use `{:?}` (or {:#?} for pretty-print) instead
```

让我们来试试！现在 `println!` 宏调用看起来像 `println!("rect1 is {:?}", rect1);` 这样。在 `{}` 中加入 `:?` 指示符告诉 `println!` 我们想要使用叫做 `Debug` 的输出格式。`Debug` 是一个 trait，它允许我们以一种对开发者有帮助的方式打印结构体，以便当我们调试代码时能看到它的值。

这样调整后再次运行程序。见鬼了！仍然能看到一个错误：

```text
error[E0277]: `Rectangle` doesn't implement `std::fmt::Debug`
```

不过编译器又一次给出了一个有帮助的信息：

```text
= help: the trait `std::fmt::Debug` is not implemented for `Rectangle`
= note: add `#[derive(Debug)]` or manually implement `std::fmt::Debug`
```

Rust **确实** 包含了打印出调试信息的功能，不过我们必须为结构体显式选择这个功能。为此，在结构体定义之前加上 `#[derive(Debug)]` 注解，如示例 5-12 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!("rect1 is {:?}", rect1);
}
```

<span class="caption">示例 5-12：增加注解来派生 `Debug` trait，并使用调试格式打印 `Rectangle` 实例</span>

现在我们再运行这个程序时，就不会有任何错误，并会出现如下输出：

```text
rect1 is Rectangle { width: 30, height: 50 }
```

好极了！这并不是最漂亮的输出，不过它显示这个实例的所有字段，毫无疑问这对调试有帮助。当我们有一个更大的结构体时，能有更易读一点的输出就好了，为此可以使用 `{:#?}` 替换 `println!` 字符串中的 `{:?}`。如果在这个例子中使用了 `{:#?}` 风格的话，输出会看起来像这样：

```text
rect1 is Rectangle {
    width: 30,
    height: 50
}
```

Rust 为我们提供了很多可以通过 `derive` 注解来使用的 trait，他们可以为我们的自定义类型增加实用的行为。附录 C 中列出了这些 trait 和行为。第十章会介绍如何通过自定义行为来实现这些 trait，同时还有如何创建你自己的 trait。

我们的 `area` 函数是非常特殊的，它只计算长方形的面积。如果这个行为与 `Rectangle` 结构体再结合得更紧密一些就更好了，因为它不能用于其他类型。现在让我们看看如何继续重构这些代码，来将 `area` 函数协调进 `Rectangle` 类型定义的 `area` **方法** 中。

[the-tuple-type]: ch03-02-data-types.html#the-tuple-type