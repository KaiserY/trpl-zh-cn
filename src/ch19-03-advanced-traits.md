## 高级 trait

> [ch19-03-advanced-traits.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-03-advanced-traits.md)
> <br>
> commit f8727711388b28eb2f5c852dd83fdbe6d22ab9bb

第十章讲到了 trait，不过就像生命周期，我们并没有涉及所有的细节。现在我们更加了解 Rust 了，可以深入理解本质了。

### 关联类型

**关联类型**（*associated types*）是一个将类型占位符与 trait 相关联的方法，如此 trait 的方法定义的签名中就可以使用这些占位符类型。实现 trait 的类型将会在特定实现中指定所用的具体类型。

本章描述的大部分内容都非常少见。关联类型则比较适中；他们比本书其他的内容要少见，不过比本章很多的内容要更常见。

一个带有关联类型的 trait 的例子是标准库提供的 `Iterator` trait。它有一个叫做 `Item` 的关联类型来替代遍历的值的类型。第十三章曾提到过 `Iterator` trait 的定义如列表 19-20 所示：

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

<span class="caption">列表 19-20：`Iterator` trait 的定义中带有关联类型 `Item`</span>

这就是说 `Iterator` trait 有一个关联类型 `Item`。`Item` 是一个占位类型，同时 `next` 方法会返回 `Option<Self::Item>` 类型的值。这个 trait 的实现者会指定 `Item` 的具体类型，而 `next` 方法会返回一个 `Option` 包含无论实现者指定的何种类型的值。

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

<span class="filename">Filename: src/main.rs</span>

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

