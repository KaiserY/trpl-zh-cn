## `Box<T>`用于已知大小的堆上数据

> [ch15-01-box.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-01-box.md)
> <br>
> commit 85b2c9ac704c9dc4bbedb97209d336afb9809dc1

最简单直接的智能指针是 *box*，它的类型是`Box<T>`。 box 允许你将一个单独的值放在堆上（第四章介绍或栈与堆）。列表 15-1 展示了如何使用 box 在堆上储存一个`i32`：

<span class="filename">Filename: src/main.rs</span>

```rust
fn main() {
    let b = Box::new(5);
    println!("b = {}", b);
}
```

<span class="caption">Listing 15-1: Storing an `i32` value on the heap using a
box</span>

这会打印出`b = 5`。在这个例子中，我们可以像数据是储存在栈上的那样访问 box 中的数据。正如任何拥有数据所有权的值那样，当像`b`这样的 box 在`main`的末尾离开作用域时，它将被释放。这个释放过程作用于 box 本身（位于栈上）和它所指向的数据（位于堆上）。

将一个单独的值存放在堆上并不是很有意义，所以像列表 15-1 这样单独使用 box 并不常见。一个 box 的实用场景是当你希望确保类型有一个已知大小的时候。例如，考虑一下列表 15-2，它是一个用于 *cons list* 的枚举定义，这是一个来源于函数式编程的数据结构类型。注意它还不能编译：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
enum List {
    Cons(i32, List),
    Nil,
}
```

<span class="caption">Listing 15-2: The first attempt of defining an enum to
represent a cons list data structure of `i32` values</span>

我们实现了一个只存放`i32`值的 cons list。也可以选择使用第十章介绍的泛型来实现一个类型无关的 cons list。

> #### cons list 的更多内容
>
> *cons list* 是一个来源于 Lisp 编程语言及其方言的数据结构。在 Lisp 中，`cons`函数（"construct function"的缩写）利用两个参数来构造一个新的列表，他们通常是一个单独的值和另一个列表。
>
> cons 函数的概念涉及到更通用的函数式编程术语；“将 x 与 y 连接”通常意味着构建一个新的容器而将 x 的元素放在新容器的开头，其后则是容器 y 的元素。
>
> cons list 通过递归调用`cons`函数产生。代表递归的 base case 的规范名称是`Nil`，它宣布列表的终止。注意这不同于第六章中的"null"或"nil"的概念，他们代表无效或缺失的值。

cons list 是一个每个元素和之后的其余部分都只包含一个值的列表。列表的其余部分由嵌套的 cons list 定义。其结尾由值`Nil`表示。cons list 在 Rust 中并不常见；通常`Vec<T>`是一个更好的选择。实现这个数据结构是`Box<T>`实用性的一个好的例子。让我们看看为什么！

使用 cons list 来储存列表`1, 2, 3`将看起来像这样：

```rust,ignore
use List::{Cons, Nil};

fn main() {
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}
```

第一个`Cons`储存了`1`和另一个`List`值。这个`List`是另一个包含`2`的`Cons`值和下一个`List`值。这又是另一个存放了`3`的`Cons`值和最后一个值为`Nil`的`List`，非递归成员代表了列表的结尾。

如果尝试编译上面的代码，会得到如列表 15-3 所示的错误：

```
error[E0072]: recursive type `List` has infinite size
 -->
  |
1 |   enum List {
  |  _^ starting here...
2 | |     Cons(i32, List),
3 | |     Nil,
4 | | }
  | |_^ ...ending here: recursive type has infinite size
  |
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
  make `List` representable
```

<span class="caption">Listing 15-3: The error we get when attempting to define
a recursive enum</span>

错误表明这个类型“有无限的大小”。为什么呢？因为`List`的一个成员被定义为递归的：它存放了另一个相同类型的值。这意味着 Rust 无法计算为了存放`List`值到底需要多少空间。让我们一点一点的看：首先了解一下 Rust 如何决定需要多少空间来存放一个非递归类型。回忆一下第六章讨论枚举定义时的列表 6-2 中定义的`Message`枚举：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

当 Rust 需要知道需要为`Message`值分配多少空间时，它可以检查每一个成员并发现`Message::Quit`并不需要任何空间，`Message::Move`需要足够储存两个`i32`值的空间，依此类推。因此，`Message`值所需的最大空间等于储存其最大成员的空间大小。

与此相对当 Rust 编译器检查像列表 15-2 中的`List`这样的递归类型时会发生什么呢。编译器尝试计算出储存一个`List`枚举需要多少内存，并开始检查`Cons`成员，那么`Cons`需要的空间等于`i32`的大小加上`List`的大小。为了计算`List`需要多少内存，它检查其成员，从`Cons`成员开始。`Cons`成员储存了一个`i32`值和一个`List`值，这样的计算将无限进行下去，如图 15-4 所示：

<img alt="An infinite Cons list" src="img/trpl15-01.svg" class="center" style="width: 50%;" />

<span class="caption">Figure 15-4: An infinite `List` consisting of infinite
`Cons` variants</span>

Rust 无法计算出要为定义为递归的类型分配多少空间，所以编译器给出了列表 15-3 中的错误。这个错误也包括了有用的建议：

```text
= help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
        make `List` representable
```

因为`Box<T>`是一个指针，我们总是知道它需要多少空间：指针需要一个`usize`大小的空间。这个`usize`的值将是堆数据的地址。而堆数据可以是任意大小，不过开始这个堆数据的地址总是能放进一个`usize`中。所以如果将列表 15-2 的定义修改为像这里列表 15-5 中的定义，并修改`main`函数为`Cons`成员中的值使用`Box::new`：

<span class="filename">Filename: src/main.rs</span>

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    let list = Cons(1,
        Box::new(Cons(2,
            Box::new(Cons(3,
                Box::new(Nil))))));
}
```

<span class="caption">Listing 15-5: Definition of `List` that uses `Box<T>` in
order to have a known size</span>

这样编译器就能够计算出储存一个`List`值需要的大小了。Rust 将会检查`List`，同样的从`Cons`成员开始检查。`Cons`成员需要`i32`的大小加上一个`usize`的大小，因为 box 总是`usize`大小的，不管它指向的是什么。接着 Rust 检查`Nil`成员，它并不储存一个值，所以`Nil`并不需要任何空间。我们通过 box 打破了这无限递归的连锁。图 15-6 展示了现在`Cons`成员看起来像什么：

<img alt="A finite Cons list" src="img/trpl15-02.svg" class="center" />

<span class="caption">Figure 15-6: A `List` that is not infinitely sized since
`Cons` holds a `Box`</span>

这就是 box 主要应用场景：打破无限循环的数据结构以便编译器可以知道其大小。第十七章讨论 trait 对象时我们将了解另一个 Rust 中会出现未知大小数据的情况。

虽然我们并不经常使用 box，他们也是一个了解智能指针模式的好的方式。`Box<T>`作为智能指针经常被使用的两个方面是他们`Deref`和`Drop` trait 的实现。让我们研究这些 trait 如何工作以及智能指针如何利用他们。