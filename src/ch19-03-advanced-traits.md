## 高级 trait

> [ch19-03-advanced-traits.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-03-advanced-traits.md)
> <br>
> commit f8727711388b28eb2f5c852dd83fdbe6d22ab9bb

第十章讲到了 trait，不过就像生命周期，我们并没有涉及所有的细节。现在我们更加了解 Rust 了，可以深入理解本质了。

### 关联类型

**关联类型**（*associated types*）是一个将类型占位符与 trait 相关联的方式，这样 trait 的方法签名中就可以使用这些占位符类型。实现一个 trait 的人只需要针对专门的实现在这个类型的位置指定相应的类型即可。

本章描述的大部分内容都非常少见。关联类型则比较适中；他们比本书其他的内容要少见，不过比本章中的很多内容要更常见。

一个带有关联类型的 trait 的例子是标准库提供的 `Iterator` trait。它有一个叫做 `Item` 的关联类型来替代遍历的值的类型。第十三章曾提到过 `Iterator` trait 的定义如列表 19-20 所示：

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

<span class="caption">列表 19-20：`Iterator` trait 的定义中带有关联类型 `Item`</span>

这就是说 `Iterator` trait 有一个关联类型 `Item`。`Item` 是一个占位类型，同时 `next` 方法会返回 `Option<Self::Item>` 类型的值。这个 trait 的实现者会指定 `Item` 的具体类型，而不管实现者指定何种类型, `next` 方法都会返回一个包含了这种类型值的 `Option`。

#### 关联类型 vs 泛型

当在列表 13-6 中在 `Counter` 结构体上实现 `Iterator` trait 时，将 `Item` 的类型指定为 `u32`：

```rust
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
```

这感觉类似于泛型。那么为什么 `Iterator` trait 不定义为如列表 19-21 所示这样呢？

```rust
pub trait Iterator<T> {
    fn next(&mut self) -> Option<T>;
}
```

<span class="caption">列表 19-21：一个使用泛型的 `Iterator` trait 假象定义</span>

区别是在列表 19-21 的定义中，我们也可以实现 `Iterator<String> for Counter`，或者任何其他类型，这样就可以有多个 `Counter` 的 `Iterator` 的实现。换句话说，当 trait 有泛型参数时，可以多次实现这个 trait，每次需改变泛型参数的具体类型。接着当使用 `Counter` 的 `next` 方法时，必须提供类型注解来表明希望使用 `Iterator` 的哪一个实现。

通过关联类型，不能多次实现 trait。使用列表 19-20 中这个 `Iterator` 的具体定义，只能选择一次 `Item` 会是什么类型，因为只能有一个 `impl Iterator for Counter`。当调用 `Counter` 的 `next` 时不必每次指定我们需要 `u32` 值的迭代器。

当 trait 使用关联类型时不必指定泛型参数的好处也在另外一些方面得到体现。考虑一下列表 19-22 中定义的两个 trait。他们都必须处理一个包含一些节点和边的图结构。`GGraph` 定义为使用泛型，而 `AGraph` 定义为使用关联类型：

```rust
trait GGraph<Node, Edge> {
    // methods would go here
}

trait AGraph {
    type Node;
    type Edge;

    // methods would go here
}
```

<span class="caption">列表 19-22：两个图 trait 定义，`GGraph` 使用泛型而 `AGraph` 使用关联类型代表 `Node` 和 `Edge`</span>

比如说想要是实现一个计算任何实现了图 trait 的类型中两个节点之间距离的函数。对于使用泛型的 `GGraph` trait 来说，`distance` 函数的签名看起来应该如列表 19-23 所示：

```rust
# trait GGraph<Node, Edge> {}
#
fn distance<N, E, G: GGraph<N, E>>(graph: &G, start: &N, end: &N) -> u32 {
#     0
}
```

<span class="caption">列表 19-23：`distance` 函数的签名，它使用 `GGraph` trait 并必须指定所有的泛型参数</span>

函数需要指定泛型参数 `N`、`E` 和 `G`，其中 `G` 拥有以 `N` 类型作为 `Node` 和 `E` 类型作为 `Edge` 的 `GGraph` trait 作为 trait bound。即便 `distance` 函数无需指定边的类型，我们也强制声明了 `E` 参数，因为需要使用 `GGraph` trait 而这样一来需要指定 `Edge` 的类型。

与此相对，列表 19-24 中的 `distance` 定义使用列表 19-22 中带有关联类型的 `AGraph` trait：

```rust
# trait AGraph {
#     type Node;
#     type Edge;
# }
#
fn distance<G: AGraph>(graph: &G, start: &G::Node, end: &G::Node) -> u32 {
#     0
}
```

<span class="caption">列表 19-24：`distance` 函数的签名，它使用 trait `AGraph` 和关联类型 `Node`</span>

这样就清楚多了。只需指定一个泛型参数 `G`，带有 `AGraph` trait bound。因为 `distance` 完全不需要使用 `Edge` 类型，无需每次都指定它。为了使用 `AGraph` 的关联类型 `Node`，可以指定为 `G::Node`。

#### 带有关联类型的 trait 对象

你可能会好奇为什么不在列表 19-23 和 19-24 的 `distance` 函数中使用 trait 对象。当使用 trait 对象时使用泛型 `GGraph` trait 的 `distance` 函数的签名确实跟准确了一些：

```rust
# trait GGraph<Node, Edge> {}
#
fn distance<N, E>(graph: &GGraph<N, E>, start: &N, end: &N) -> u32 {
#     0
}
```

与列表 19-24 相比较可能更显公平。不过依然需要指定 `Edge` 类型，这意味着列表 19-24 仍更为合适，因为无需指定并不需要的类型。

不可能改变列表 19-24 来对图使用 trait 对象，因为这样就无法引用 `AGraph` trait 中的关联类型。

但是一般而言使用带有关联类型的 trait 的 trait 对象是可能；列表 19-25 展示了一个函数 `traverse` ，它无需在其他参数中使用关联类型。然而这种情况必须指定关联类型的具体类型。这里选择接受以 `usize` 作为 `Node` 和以两个 `usize` 值的元组作为  `Edge` 的实现了 `AGraph` trait 的类型：

```rust
# trait AGraph {
#     type Node;
#     type Edge;
# }
#
fn traverse(graph: &AGraph<Node=usize, Edge=(usize, usize)>) {}
```

虽然 trait 对象意味着无需在编译时就知道 `graph` 参数的具体类型，但是我们确实需要在 `traverse` 函数中通过具体的关联类型来限制 `AGraph` trait 的使用。如果不提供这样的限制，Rust 将不能计算出用哪个 `impl` 来匹配这个 trait 对象，因为关联类型可以作为方法签名的一部分，Rust 需要在虚函数表中寻找他们。

### 运算符重载和默认类型参数

`<PlaceholderType=ConcreteType>` 语法也可以以另一种方式使用：用来指定泛型的默认类型。这种情况的一个非常好的例子是用于运算符重载。

Rust 并不允许创建自定义运算符或重载任意运算符，不过 `std::ops` 中所列出的运算符和相应的 trait 可以通过实现运算符相关 trait 来重载。例如，列表 19-25 中展示了如何在 `Point` 结构体上实现 `Add` trait 来重载 `+` 运算符，这样就可以将两个 `Point` 实例相加了：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::ops::Add;

#[derive(Debug,PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
               Point { x: 3, y: 3 });
}
```

<span class="caption">列表 19-25：实现 `Add` 来重载 `Point` 的 `+` 运算符</span>

这里实现了 `add` 方法将两个 `Point` 实例的 `x` 值和 `y` 值分别相加来创建一个新的 `Point`。`Add` trait 有一个叫做 `Output` 的关联类型，它用来决定 `add` 方法的返回值类型。

让我们更仔细的看看 `Add` trait。这里是其定义：

```rust
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}
```

这看来应该很熟悉；这是一个带有一个方法和一个关联类型的 trait。比较陌生的部分是尖括号中的 `RHS=Self`：这个语法叫做**默认类型参数**（*default type parameters*）。`RHS` 是一个泛型参数（“right hand side” 的缩写），它用于 `add` 方法中的 `rhs` 参数。如果实现 `Add` trait 时不指定 `RHS` 的具体类型，`RHS` 的类型将是默认的 `Self` 类型（在其上实现 `Add` 的类型）。

让我们看看另一个实现了 `Add` trait 的例子。想象一下我们拥有两个存放不同的单元值的结构体，`Millimeters` 和 `Meters`。可以如列表 19-26 所示那样用不同的方式为 `Millimeters` 实现 `Add` trait：

```rust
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Millimeters) -> Millimeters {
        Millimeters(self.0 + other.0)
    }
}

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

<span class="caption">列表 19-26：在 `Millimeters` 上实现 `Add`，以能够将`Millimeters` 与 `Millimeters` 相加和将 `Millimeters` 与 `Meters` 相加</span>

如果将 `Millimeters` 与其他 `Millimeters` 相加，则无需为 `Add` 参数化 `RHS` 类型，因为默认的 `Self` 正是我们希望的。如果希望实现 `Millimeters` 与 `Meters` 相加，那么需要声明为 `impl Add<Meters>` 来设定 `RHS` 类型参数的值。

默认参数类型主要用于如下两个方面：

1. 扩展类型而不破坏现有代码。
2. 允许以一种大部分用户都不需要的方法进行自定义。

`Add` trait 就是第二个目的一个例子：大部分时候你会将两个相似的类型相加。在 `Add` trait 定义中使用默认类型参数使得实现 trait 变得更容易，因为大部分时候无需指定这额外的参数。换句话说，这样就去掉了一些实现的样板代码。

第一个目的是相似的，但过程是反过来的：因为现有 trait 实现并没有指定类型参数，如果需要为现有 trait 增加类型参数，为其提供一个默认值将允许我们在不破坏现有实现代码的基础上扩展 trait 的功能。

### 完全限定语法与消歧义

Rust 既不能避免一个 trait 与另一个 trait 拥有相同名称的方法，也不能阻止为同一类型同时实现这两个 trait。甚至也可以直接在类型上实现相同名称的方法！那么为了能使用相同的名称调用每一个方法，需要告诉 Rust 我们希望使用哪个方法。考虑一下列表 19-27 中的代码，trait `Foo` 和 `Bar` 都拥有方法 `f`，并在结构体 `Baz` 上实现了这两个 trait，结构体也有一个叫做 `f` 的方法：

<span class="filename">文件名: src/main.rs</span>

```rust
trait Foo {
    fn f(&self);
}

trait Bar {
    fn f(&self);
}

struct Baz;

impl Foo for Baz {
    fn f(&self) { println!("Baz’s impl of Foo"); }
}

impl Bar for Baz {
    fn f(&self) { println!("Baz’s impl of Bar"); }
}

impl Baz {
    fn f(&self) { println!("Baz's impl"); }
}

fn main() {
    let b = Baz;
    b.f();
}
```

<span class="caption">列表 19-27：实现两个拥有相同名称的方法的 trait，同时还有直接定义于结构体的（同名）方法</span>

对于 `Baz` 的 `Foo` trait 中方法 `f` 的实现，它打印出 `Baz's impl of Foo`。对于 `Baz` 的 `Bar` trait 中方法 `f` 的实现，它打印出 `Baz's impl of Bar`。直接定义于 `Baz` 的 `f` 实现打印出 `Baz's impl`。当调用 `b.f()` 时会发生什么呢？在这个例子中，Rust 总是会使用直接定义于 `Baz` 的实现并打印出 `Baz's impl`。

为了能够调用 `Foo` 和 `Baz` 中的 `f` 方法而不是直接定义于 `Baz` 的 `f` 实现，则需要使用**完全限定语法**（*fully qualified syntax*）来调用方法。它像这样工作：对于任何类似如下的方法调用：

```rust
receiver.method(args);
```

可以像这样使用完全限定的方法调用：

```rust
<Type as Trait>::method(receiver, args);
```

所以为了消歧义并能够调用列表 19-27 中所有的 `f` 方法，需要在尖括号中指定每个希望 `Baz` 作为的 trait，接着使用双冒号，接着传递 `Baz` 实例作为第一个参数并调用 `f` 方法。列表 19-28 展示了如何调用 `Foo` 中的 `f`，和 `Bar` 中与 `b` 中的 `f`：

<span class="filename">文件名: src/main.rs</span>

```rust
# trait Foo {
#     fn f(&self);
# }
# trait Bar {
#     fn f(&self);
# }
# struct Baz;
# impl Foo for Baz {
#     fn f(&self) { println!("Baz’s impl of Foo"); }
# }
# impl Bar for Baz {
#     fn f(&self) { println!("Baz’s impl of Bar"); }
# }
# impl Baz {
#     fn f(&self) { println!("Baz's impl"); }
# }
#
fn main() {
    let b = Baz;
    b.f();
    <Baz as Foo>::f(&b);
    <Baz as Bar>::f(&b);
}
```

<span class="caption">列表 19-28：使用完全限定语法调用作为`Foo` 和 `Bar` trait 一部分的 `f` 方法</span>

这会打印出：

```
Baz's impl
Baz’s impl of Foo
Baz’s impl of Bar
```

只在存在歧义时才需要 `Type as` 部分，只有需要 `Type as` 时才需要 `<>` 部分。所以如果在作用域中只有定义于 `Baz` 和 `Baz` 上实现的 `Foo` trait 的 `f` 方法的话，则可以使用 `Foo::f(&b)` 调用 `Foo` 中的 `f` 方法，因为无需与 `Bar` trait 相区别。

也可以使用 `Baz::f(&b)` 调用直接定义于 `Baz` 上的 `f` 方法，不过因为这个定义是在调用 `b.f()` 时默认使用的，并不要求调用此方法时使用完全限定的名称。

### 父 trait 用于在另一个 trait 中使用某 trait 的功能

有时我们希望当实现某 trait 时依赖另一个 trait 也被实现，如此这个 trait 就可以使用其他 trait 的功能。这个所需的 trait 是我们实现的 trait 的**父（超） trait**（*supertrait*）。

例如，加入我们希望创建一个带有 `outline_print` 方法的 trait `OutlinePrint`，它会打印出带有星号框的值。也就是说，如果 `Point` 实现了 `Display` 并返回 `(x, y)`，调用以 1 作为 `x` 和 3 作为 `y` 的 `Point` 实例的 `outline_print` 会显示如下：

```
**********
*        *
* (1, 3) *
*        *
**********
```

在 `outline_print` 的实现中，因为希望能够使用 `Display` trait 的功能，则需要说明 `OutlinePrint` 只能用于同时也实现了 `Display` 并提供了 `OutlinePrint` 需要的功能的类型。可以在 trait 定义中指定 `OutlinePrint: Display` 来做到这一点。这类似于为 trait 增加 trait bound。列表 19-29 展示了一个 `OutlinePrint` trait 的实现：

```rust
use std::fmt;

trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}
```

<span class="caption">列表 19-29：实现 `OutlinePrint` trait，它要求来自 `Display` 的功能</span>

因为指定了 `OutlinePrint` 需要 `Display` trait，则可以在 `outline_print` 中使用 `to_string`（`to_string` 会为任何实现 `Display` 的类型自动实现）。如果不在 trait 名后增加 `: Display` 并尝试在 `outline_print` 中使用 `to_string`，则会得到一个错误说在当前作用域中没有找到用于 `&Self` 类型的方法 `to_string`。

如果尝试在一个没有实现 `Display` 的类型上实现 `OutlinePrint`，比如 `Point` 结构体：

```rust
# trait OutlinePrint {}
struct Point {
    x: i32,
    y: i32,
}

impl OutlinePrint for Point {}
```

则会得到一个错误说 `Display` 没有被实现而 `Display` 被 `OutlinePrint` 所需要：

```
error[E0277]: the trait bound `Point: std::fmt::Display` is not satisfied
  --> src/main.rs:20:6
   |
20 | impl OutlinePrint for Point {}
   |      ^^^^^^^^^^^^ the trait `std::fmt::Display` is not implemented for
   `Point`
   |
   = note: `Point` cannot be formatted with the default formatter; try using
   `:?` instead if you are using a format string
   = note: required by `OutlinePrint`
```

一旦在 `Point` 上实现 `Display` 并满足 `OutlinePrint` 要求的限制，比如这样：

```rust
# struct Point {
#     x: i32,
#     y: i32,
# }
#
use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}
```

那么在 `Point` 实现 `OutlinePrint` trait 将能成功编译并可以在 `Point` 实例上调用 `outline_print` 来显示位于星号框中的点的值。

### newtype 模式用以在外部类型上实现外部 trait

在第十章中，我们提到了孤儿规则（orphan rule），它说明只要 trait 或类型对于当前 crate 是本地的话就可以在此类型上实现该 trait。一个绕开这个限制的方法是使用**newtype 模式**（*newtype pattern*），它涉及到使用一个元组结构体来创建一个新类型，它带有一个字段作为希望实现 trait 的类型的简单封装。接着这个封装类型对于 crate 是本地的，这样就可以在这个封装上实现 trait。“Newtype” 是一个源自 Haskell 编程语言的概念。使用这个模式没有运行时性能惩罚。这个封装类型在编译时被省略了。

例如，如果想要在 `Vec` 上实现 `Display`，可以创建一个包含 `Vec` 实例的 `Wrapper` 结构体。接着可以如列表 19-30 那样在 `Wrapper` 上实现 `Display` 并使用 `Vec` 的值：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

<span class="caption">列表 19-30：创建 `Wrapper` 类型封装 `Vec<String>` 以便实现 `Display`</span>

`Display` 的实现使用 `self.0` 来访问其内部的 `Vec`，接着就可以使用 `Wrapper` 中 `Display` 的功能了。

此方法的缺点是因为 `Wrapper` 是一个新类型，它没有定义于其值之上的方法；必须直接在 `Wrapper` 上实现 `Vec` 的所有方法，如 `push`、`pop` 等等，并代理到 `self.0` 上以便可以将 `Wrapper` 完全当作 `Vec` 处理。如果希望新类型拥有其内部类型的每一个方法，为封装类型实现第十五章讲到的 `Deref` trait 并返回其内部类型是一种解决方案。如果不希望封装类型拥有所有内部类型的方法，比如为了限制封装类型的行为，则必须自行实现所需的方法。

上面便是 newtype 模式如何与 trait 结合使用的；还有一个不涉及 trait 的实用模式。现在让我们将话题的焦点转移到一些与 Rust 类型系统交互的高级方法上来吧。
