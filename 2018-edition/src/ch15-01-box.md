## `Box<T>` 在堆上存储数据，并且可确定大小

> [ch15-01-box.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-01-box.md)
> <br>
> commit 0905e41f7387b60865e6eac744e31a7f7b46edf5

最简单直接的智能指针是 *box*，其类型是 `Box<T>`。 box 允许你将一个值放在堆上而不是栈上。留在栈上的则是指向堆数据的指针。如果你想回顾一下栈与堆的区别请参考第四章。

<!-- do we mean, allows you to place a value on the heap rather than the
default behavior of placing it on the stack? Can you quickly recap on what the
advantage to this can be, help them know when they'd use this? -->
<!-- Correct! Recap below: /Carol -->

除了数据被储存在堆上而不是栈上之外，box 没有性能损失，不过也没有很多额外的功能。他们多用于如下场景：

- 当有一个在编译时未知大小的类型，而又想要在需要确切大小的上下文中使用这个类型值的时候
- 当有大量数据并希望在确保数据不被拷贝的情况下转移所有权的时候
- 当希望拥有一个值并只关心它的类型是否实现了特定 trait 而不是其具体类型的时候

我们将在本部分的余下内容中展示第一种应用场景。作为对另外两个情况更详细的说明：在第二种情况中，转移大量数据的所有权可能会花费很长的时间，因为数据在栈上进行了拷贝。为了改善这种情况下的性能，可以通过 box 将这些数据储存在堆上。接着，只有少量的指针数据在栈上被拷贝。第三种情况被称为 **trait 对象**（*trait object*），第十七章刚好有一整个部分专门讲解这个主题。所以这里所学的内容会在第十七章再次用上！

### 使用 `Box<T>` 在堆上储存数据

在开始 `Box<T>` 的用例之前，让我们熟悉一下语法和如何与储存在 `Box<T>` 中的值交互。

示例 15-1 展示了如何使用 box 在堆上储存一个 `i32`：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let b = Box::new(5);
    println!("b = {}", b);
}
```

<span class="caption">示例 15-1：使用 box 在堆上储存一个 `i32` 值</span>

这里定义了变量 `b`，其值是一个指向被分配在堆上的值 `5` 的 `Box`。这个程序会打印出 `b = 5`；在这个例子中，我们可以像数据是储存在栈上的那样访问 box 中的数据。正如任何拥有数据所有权的值那样，当像 `b` 这样的 box 在 `main` 的末尾离开作用域时，它将被释放。这个释放过程作用于 box 本身（位于栈上）和它所指向的数据（位于堆上）。

将一个单独的值存放在堆上并不是很有意义，所以像示例 15-1 这样单独使用 box 并不常见。将像单个 `i32` 这样的值储存在栈上，也就是其默认存放的地方在大部分使用场景中更为合适。让我们看看一个不使用 box 时无法定义的类型的例子。

<!-- is this what we mean, we wouldn't bother with a box for something that can
be done more simply with a variable? -->
<!-- No, this doesn't really have anything to do with variables; this example
is using both a variable and a box. I've tried to clarify. /Carol -->

### box 允许创建递归类型

<!-- (or something that encompasses everything we do with this example) -->

<!-- below: I'm unfamiliar with the cons concept, are we saying each value
except the first is repeated? does an item contain both its own value and the
next **item**, or the next **value**? Is it a continually nesting list? I'm
finding it hard to visualize -->
<!-- Did Figure 15-4 (trpl15-01.svg that I sent) help at all? /Carol-->

Rust 需要在编译时知道类型占用多少空间。一种无法在编译时知道大小的类型是 **递归类型**（*recursive type*），其值的一部分可以是相同类型的另一个值。这种值的嵌套理论上可以无限的进行下去，所以 Rust 不知道递归类型需要多少空间。不过 box 有一个已知的大小，所以通过在循环类型定义中插入 box，就可以创建递归类型了。

让我们探索一下 *cons list*，一个函数式编程语言中的常见类型，来展示这个（递归类型）概念。除了递归之外，我们将要定义的 cons list 类型是很直白的，所以这个例子中的概念在任何遇到更为复杂的涉及到递归类型的场景时都很实用。

<!-- can you also say why we're discussing cons lists in such depth? It seems
like a detour from the smart pointers conversation, is it just another concept
we're covering or is it imperative for learning about smart pointers? Either
way, can you lay that out up front, I think this could throw readers -->
<!-- A cons list is an example that's fairly simple but illustrates the use
case for Box. Readers may find themselves wanting to define a variety of
recursive types more complicated than cons lists in the future, and this
chapter demonstrates why box is the solution they should reach for in those
situations. We've tried to make that clearer in the above two paragraphs.
/Carol -->

cons list 是一个每一项都包含两个部分的列表：当前项的值和下一项。其最后一项值包含一个叫做 `Nil` 的值并没有下一项。

> #### cons list 的更多内容
>
> *cons list* 是一个来源于 Lisp 编程语言及其方言的数据结构。在 Lisp 中，`cons` 函数（“construct function" 的缩写）利用两个参数来构造一个新的列表，他们通常是一个单独的值和另一个列表。
>
> cons 函数的概念涉及到更通用的函数式编程术语；“将 x 与 y 连接” 通常意味着构建一个新的容器而将 x 的元素放在新容器的开头，其后则是容器 y 的元素。
>
> cons list 通过递归调用 `cons` 函数产生。代表递归的终止条件（base case）的规范名称是 `Nil`，它宣布列表的终止。注意这不同于第六章中的 “null” 或 “nil” 的概念，他们代表无效或缺失的值。

注意虽然函数式编程语言经常使用 cons list，但是它并不是一个 Rust 中常见的类型。大部分在 Rust 中需要列表的时候，`Vec<T>` 是一个更好的选择。其他更为复杂的递归数据类型 **确实** 在 Rust 的很多场景中很有用，不过通过以 cons list 作为开始，我们可以探索如何使用 box 毫不费力的定义一个递归数据类型。

<!-- If there isn't a better example for introducing box, I think we need more
justification for using cons lists here. This is supposed to be showing why box
is useful, but we're saying the thing we use box for isn't useful either. What
is it useful for, then? -->
<!-- We've tried to clarify. This is just a simple example to introduce box so
that the reader can use these concepts in more complicated situations. A more
realistic example would be quite a bit more complicated and obscure why a box
is useful even more. /Carol -->

示例 15-2 包含一个 cons list 的枚举定义。注意这还不能编译因为这个类型没有已知的大小，之后我们会展示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
enum List {
    Cons(i32, List),
    Nil,
}
```

<span class="caption">示例 15-2：第一次尝试定义一个代表 `i32` 值的 cons list 数据结构的枚举</span>

> 注意：出于示例的需要我们选择实现一个只存放 `i32` 值的 cons list。也可以用泛型实现它，正如第十章讲到的，来定义一个可以存放任何类型值的 cons list 类型。

<!-- any reason, in that case, that we use i32s here? Does it just provide a
more stable example? -->
<!-- It's a simpler example; the value within each item doesn't matter much for
the example; i32 is the default integer type so we chose that. I'm not sure
what you mean by stable? /Carol-->

使用这个 cons list 来储存列表 `1, 2, 3` 将看起来如示例 15-3 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use List::{Cons, Nil};

fn main() {
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}
```

<span class="caption">示例 15-3：使用 `List` 枚举储存列表 `1, 2, 3`</span>

第一个 `Cons` 储存了 `1` 和另一个 `List` 值。这个 `List` 是另一个包含 `2` 的 `Cons` 值和下一个 `List` 值。接着又有另一个存放了 `3` 的 `Cons` 值和最后一个值为 `Nil` 的 `List`，非递归成员代表了列表的结尾。

如果尝试编译上面的代码，会得到如示例 15-4 所示的错误：

```text
error[E0072]: recursive type `List` has infinite size
 -->
  |
1 | enum List {
  | ^^^^^^^^^ recursive type has infinite size
2 |     Cons(i32, List),
  |               ----- recursive without indirection
  |
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
  make `List` representable
```

<span class="caption">示例 15-4：尝试定义一个递归枚举时得到的错误</span>

<!-- above-- but isn't that the definition of a cons list that we gave earlier,
that is must hold a value of itself? As you can see, I'm struggling with the
cons definition at the moment! -->
<!-- Yes, this type is the most literal translation of the concept of a concept
to a Rust type, but it's not allowed in Rust. We have to use box to make the
variant hold a pointer to the next value, not the actual value itself. We've
tried to clarify throughout this section. /Carol -->

这个错误表明这个类型 “有无限的大小”。其原因是 `List` 的一个成员被定义为是递归的：它直接存放了另一个相同类型的值。这意味着 Rust 无法计算为了存放 `List` 值到底需要多少空间。让我们一点一点来看：首先了解一下 Rust 如何决定需要多少空间来存放一个非递归类型。

### 计算非递归类型的大小

回忆一下第六章讨论枚举定义时示例 6-2 中定义的 `Message` 枚举：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

当 Rust 需要知道要为 `Message` 值分配多少空间时，它可以检查每一个成员并发现 `Message::Quit` 并不需要任何空间，`Message::Move` 需要足够储存两个 `i32` 值的空间，依此类推。因此，`Message` 值所需的空间等于储存其最大成员的空间大小。

与此相对当 Rust 编译器检查像示例 15-2 中的 `List` 这样的递归类型时会发生什么呢。编译器尝试计算出储存一个 `List` 枚举需要多少内存，并开始检查 `Cons` 成员，那么 `Cons` 需要的空间等于 `i32` 的大小加上 `List` 的大小。为了计算 `List` 需要多少内存，它检查其成员，从 `Cons` 成员开始。`Cons`成员储存了一个 `i32` 值和一个`List`值，这样的计算将无限进行下去，如图 15-5 所示：

<img alt="An infinite Cons list" src="img/trpl15-01.svg" class="center" style="width: 50%;" />

<span class="caption">图 15-5：一个包含无限个 `Cons` 成员的无限 `List`</span>

### 使用 `Box<T>` 给递归类型一个已知的大小

Rust 无法计算出要为定义为递归的类型分配多少空间，所以编译器给出了示例 15-4 中的错误。这个错误也包括了有用的建议：

```text
= help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
        make `List` representable
```

在建议中，“indirection” 意味着不同于直接储存一个值，我们将间接的储存一个指向值的指针。

因为 `Box<T>` 是一个指针，我们总是知道它需要多少空间：指针的大小并不会根据其指向的数据量而改变。

所以可以将 `Box` 放入 `Cons` 成员中而不是直接存放另一个 `List` 值。`Box` 会指向另一个位于堆上的 `List` 值，而不是存放在 `Cons` 成员中。从概念上讲，我们仍然有一个通过在其中 “存放” 其他列表创建的列表，不过现在实现这个概念的方式更像是一个项挨着另一项，而不是一项包含另一项。

我们可以修改示例 15-2 中 `List` 枚举的定义和示例 15-3 中对 `List` 的应用，如示例 15-6 所示，这是可以编译的：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 15-6：为了拥有已知大小而使用 `Box<T>` 的 `List` 定义</span>

`Cons` 成员将会需要一个 `i32` 的大小加上储存 box 指针数据的空间。`Nil` 成员不储存值，所以它比 `Cons` 成员需要更少的空间。现在我们知道了任何 `List` 值最多需要一个 `i32` 加上 box 指针数据的大小。通过使用 box ，打破了这无限递归的连锁，这样编译器就能够计算出储存 `List` 值需要的大小了。图 15-7 展示了现在 `Cons` 成员看起来像什么：

<img alt="A finite Cons list" src="img/trpl15-02.svg" class="center" />

<span class="caption">图 15-7：因为 `Cons` 存放一个 `Box` 所以 `List` 不是无限大小的了</span>

box 只提供了间接存储和堆分配；他们并没有任何其他特殊的功能，比如我们将会见到的其他智能指针。他们也没有这些特殊功能带来的性能损失，所以他们可以用于像 cons list 这样间接存储是唯一所需功能的场景。我们还将在第十七章看到 box 的更多应用场景。

`Box<T>` 类型是一个智能指针，因为它实现了 `Deref` trait，它允许 `Box<T>` 值被当作引用对待。当 `Box<T>` 值离开作用域时，由于 `Box<T>` 类型 `Drop` trait 的实现，box 所指向的堆数据也会被清除。让我们更详细的探索一下这两个 trait；这些 trait 在本章余下讨论的其他智能指针所提供的功能中将会更为重要。

<!-- so deref and drop are features of Box and not of smart pointers? Or of
both? I'm not sure it's clear -->
<!-- We've tried to clarify. We wanted to demonstrate one smart pointer before
getting into these traits since they don't make much sense out of context, but
they're more important to understand before explaining the more complicated
smart pointers /Carol -->
