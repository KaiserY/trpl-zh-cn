## 引用循环与内存泄漏

> [ch15-06-reference-cycles.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-06-reference-cycles.md)
> <br>
> commit cd7d9bcfb099c224439db0ba3b02956d9843864d

Rust 的内存安全保证使其 **难以** 意外的制造永远也不会被清理的内存（被称为 **内存泄露**（*memory leak*）），但并不是不可能。完全的避免内存泄露并不是同在编译时拒绝数据竞争一样为 Rust 的保证之一，这意味着内存泄露在 Rust 被认为是内存安全的。这一点可以通过 `Rc<T>` 和 `RefCell<T>` 看出：有可能会创建个个项之间相互引用的引用。这会造成内存泄露，因为每一项的引用计数将永远也到不了 0，其值也永远也不会被丢弃。

### 制造引用循环

让我们看看引用循环是如何发生的以及如何避免它。以示例 15-28 中的 `List` 枚举和 `tail` 方法的定义开始：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::rc::Rc;
use std::cell::RefCell;
use List::{Cons, Nil};

#[derive(Debug)]
enum List {
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match *self {
            Cons(_, ref item) => Some(item),
            Nil => None,
        }
    }
}
```

<span class="caption">示例：一个存放 `RefCell` 的 cons list 定义，这样可以修改 `Cons` 成员所引用的数据</span>

这里采用了示例 15-6 中 `List` 定义的另一种变体。现在 `Cons` 成员的第二个元素是 `RefCell<Rc<List>>`，这意味着不同于像示例 15-19 那样能够修改 `i32` 的值，我们希望能够修改 `Cons` 成员所指向的 `List`。这里还增加了一个 `tail` 方法来方便我们在有 `Cons` 成员的时候访问其第二项。

<!-- Can you link this more clearly, what do we have at this point? This change
to a new listing feels unexpected. What are we going to do with this cons list?
Why are we making this next listing, what is it's overall purpose? -->
<!-- I'm not sure if the new listing you're talking about being unexpected is
referring to the listing above or the listing below? The listing above is just
definitions we're going to use, the listing below is the `main` function that
uses the definitions. We just broke these apart to avoid having a lot of code
and then a lot of explanation, I'd be fine having this be one big listing if
you think that would be better /Carol -->

在示例 15-29 中增加了一个 `main` 函数，其使用了示例 15-28 中的定义。这些代码在 `a` 中创建了一个列表，一个指向 `a` 中列表的 `b` 列表，接着修改 `b` 中的列表指向 `a` 中的列表，这会创建一个引用循环。在这个过程的多个位置有 `println!` 语句展示引用计数。

<!-- so are we adding this to the end of the previous listing? It's in the same
file -->
<!-- yes /Carol -->

<span class="filename">Filename: src/main.rs</span>

```rust
# use List::{Cons, Nil};
# use std::rc::Rc;
# use std::cell::RefCell;
# #[derive(Debug)]
# enum List {
#     Cons(i32, RefCell<Rc<List>>),
#     Nil,
# }
#
# impl List {
#     fn tail(&self) -> Option<&RefCell<Rc<List>>> {
#         match *self {
#             Cons(_, ref item) => Some(item),
#             Nil => None,
#         }
#     }
# }
#
fn main() {
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    // Uncomment the next line to see that we have a cycle; it will
    // overflow the stack
    // println!("a next item = {:?}", a.tail());
}
```

<span class="caption">示例 15-29：创建一个引用循环：两个`List` 值互相指向彼此</span>

这里在变量 `a` 中创建了一个 `Rc` 实例来存放初值为 `5, Nil` 的 `List` 值。接着在变量 `b` 中创建了存放包含值 10 和指向列表 `a` 的 `List` 的另一个 `Rc` 实例。

最后，修改 `a` 使其指向 `b` 而不是 `Nil`，这就创建了一个循环。为此需要使用 `tail` 方法获取 `a` 中 `RefCell` 的引用，并放入变量 `link` 中。接着使用 `RefCell` 的 `borrow_mut` 方法将其值从存放 `Nil` 的 `Rc` 修改为 `b` 中的 `Rc`。


如果保持最后的 `println!` 行注释并运行代码，会得到如下输出：

```text
a initial rc count = 1
a next item = Some(RefCell { value: Nil })
a rc count after b creation = 2
b initial rc count = 1
b next item = Some(RefCell { value: Cons(5, RefCell { value: Nil }) })
b rc count after changing a = 2
a rc count after changing a = 2
```

可以看到将 `a` 修改为指向 `b` 之后，`a` 和 `b` 中都有的 `Rc` 实例的引用计数为 2。在 `main` 的结尾，Rust 会尝试首先丢弃 `b`，这会使 `a` 和 `b` 中 `Rc` 实例的引用计数减一。

<!-- Above -- previously `a` and `b` said `Rc`, I wanted to clarify that by Rc
we mean a and b, is that right? -->
<!-- There's lots of stuff in `a` and `b`; we specifically mean the `Rc` values
here which is why we said `Rc`. I've tried to say both `a` & `b` and `Rc` here
instead, to be most precise. What do you think? /Carol -->

<!-- Below--"that Rc" - what are we referring to, a is still referencing b? Can
you clarify that? -->
<!-- Yes, the `Rc` in `b`. /Carol -->

然而，因为 `a` 仍然引用 `b` 中的 `Rc`，`Rc` 的引用计数是 1 而不是 0，所以 `Rc` 在堆上的内存不会被丢弃。其内存会因为引用计数为 1 而永远停留。

为了更形象的展示，我们创建了一个如图 15-30 所示的引用循环：

<img alt="Reference cycle of lists" src="img/trpl15-04.svg" class="center" />

<span class="caption">图 15-30: 列表 `a` 和 `b` 彼此互相指向形成引用循环</span>

如果取消最后 `println!` 的注释并运行程序，Rust 会尝试打印出 `a` 指向 `b` 指向 `a` 这样的循环直到栈溢出。

<!-- Can you show us the output? Also, why are we commenting out the print
statement in the first place?-->
<!-- We have the last println commented out to begin with because otherwise you
get a LOT of output until the stack overflows. We thought that would be
confusing and make it harder to see the reference counts we're printing out
before that point. Did you try the code with and without that line commented
out? Which one would make a better first experience when running this code?
/Carol -->

这个特定的例子中，创建了引用循环之后程序立刻就结束了。这个循环的结果并不可怕。如果在更为复杂的程序中并在循环里分配了很多内存并占有很长时间，这个程序会使用多于它所需要的内存，并有可能压垮系统并造成没有内存可供使用。

创建引用循环并不容易，但也不是不可能。如果你有包含`Rc<T>`的`RefCell<T>`值或类似的嵌套结合了内部可变性和引用计数的类型，请务必小心确保你没有形成一个引用循环；你无法指望 Rust 帮你捕获它们。创建引用循环是一个程序上的逻辑 bug，你应该使用自动化测试、代码评审和其他软件开发最佳实践来使其最小化。

<!-- Above-- this seems like a vague solution, just not writing the code that
creates cycles, can you be more specific about which part they should
exclude/change? -->
<!-- Not really, this example was deliberately creating a reference cycle, so
if you don't want reference cycles, you shouldn't write this code. It's similar
to a logic bug-- if you want your program to add 2 to a number instead of 50,
then you have to type 2 rather than typing 50. I'm not sure how to be more
specific or helpful here; I've referenced writing tests and other things that
can help mitigate logic bugs. /Carol -->

另一个解决方案是重新组织数据结构使得一些引用有所有权而另一些则没有。如此，循环将由一些有所有权的关系和一些没有所有权的关系，而只有所有权关系才影响值是否被丢弃。在示例 15-28 中，我们总是希望 `Cons` 成员拥有其列表，所以重新组织数据结构是不可能的。让我们看看一个由服结点和结点够长的图的例子，观察何时无所有权关系是一个好的避免引用循环的方法。

### 避免引用循环：将 `Rc<T>` 变为 `Weak<T>`

到目前为止，我们已经展示了调用 `Rc::clone` 会增加 `Rc` 实例的 `strong_count`，和 `Rc` 实例只在其 `strong_count` 为 0 时才会被清理。也可以通过调用 `Rc::downgrade` 并传递 `Rc` 实例的引用来创建其值的 **弱引用**（*weak reference*）。调用 `Rc::downgrade` 时会得到 `Weak<T>` 类型的智能指针。不同于将 `Rc` 实例的 `strong_count` 加一，调用 `Rc::downgrade` 会将 `weak_count` 加一。`Rc` 类型使用 `weak_count` 来记录其存在多少个 `Weak<T>` 引用，类似于 `strong_count`。其区别在于 `weak_count` 无需计数为 0 就能使 `Rc` 实例被清理。

<!-- What is a weak_count? I don't think we've defined that, or strong_count,
really. Are we just giving another variable to store the count that has no
input on whether memory is dropped? When is a count stored in strong_count and
when is it stored in weak_count? -->
<!-- We're not giving `Rc` another variable, the standard library has defined
`Rc` to have both the `strong_count` and `weak_count` as fields. I've tried to
clarify the paragraph above to address your questions. /Carol -->

强引用代表如何共享 `Rc` 实例的引用。弱引用并不代表所有权关系。他们不会造成引用循环，因为任何引入了弱引用的循环一旦所涉及的强引用计数为 0 就会被打破。

<!-- Below: I'm struggling to follow here, why do we want to get a value from
Weak<T>? This section is losing me somewhat, can you slow this down, make sure
you define anything new up front and give it’s purpose, what we intend it to
do? -->
<!-- I've tried to clarify /Carol -->

因为 `Weak<T>` 引用的值可能已经被丢弃了，为了使用 `Weak<T>` 所指向的值，我们必须确保其值仍然有效。为此可以调用 `Weak<T>` 实例的 `upgrade` 方法，这会返回 `Option<Rc<T>>`。如果 `Rc` 值还未被丢弃则结果是 `Some`，如果 `Rc` 已经被丢弃则结果是 `None`。因为 `upgrade` 返回一个 `Option`，我们确信 Rust 会处理 `Some` 和 `None`的情况，并且不会有一个无效的指针。

作为一个例子，不同于使用一个某项只知道其下一项的列表，我们会创建一个某项知道其子项 **和** 父项的树形结构。

#### 创建树形数据结构：带有子结点的 `Node`

让我们从一个叫做 `Node` 的存放拥有所有权的 `i32` 值和其子 `Node` 值引用的结构体开始：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}
```

我们希望能够 `Node` 拥有其子结点，同时也希望变量可以拥有每个结点以便可以直接访问他们。为此 `Vec` 的项的类型被定义为 `Rc<Node>`。我们还希望能改其他结点的子结点，所以 `children` 中 `Vec` 被放进了 `RefCell`。

接下来，使用此结构体定义来创建一个叫做 `leaf` 的带有值 3 且没有子结点的 `Node` 实例，和另一个带有值 5 并以 `leaf` 作为子结点的实例 `branch`，如示例 15-31 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::rc::Rc;
# use std::cell::RefCell;
#
# #[derive(Debug)]
# struct Node {
#     value: i32,
#    children: RefCell<Vec<Rc<Node>>>,
# }
#
fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });
}
```

<span class="caption">示例 15-31：创建没有子结点的 `leaf` 结点和以 `leaf` 作为子结点的 `branch` 结点</span>

这里克隆了 `leaf` 中的 `Rc` 并储存在了 `branch` 中，这意味着 `leaf` 中的 `Node` 现在有两个所有者：`leaf`和`branch`。可以通过 `branch.children` 从 `branch` 中获得 `leaf`，不过无法从 `leaf` 到 `branch`。`leaf` 没有到 `branch` 的引用且并不知道他们相互关联。我们希望 `leaf` 知道 `branch` 是其父结点。

#### 增加从子到父的引用

为了使子结点知道其父结点，需要在 `Node` 结构体定义中增加一个 `parent` 字段。问题是 `parent` 的类型应该是什么。我们知道其不能包含 `Rc<T>`，因为这样 `leaf.parent` 将会指向 `branch` 而 `branch.children` 会包含 `leaf` 的指针，这会形成引用循环，会造成其 `strong_count` 永远也不会为 0.

现在换一种方式思考这个关系，父结点应该拥有其子结点：如果父结点被丢弃了，其子结点也应该别丢弃。然而子结点不应该拥有其父结点：如果丢弃子结点，其父结点应该依然存在。这正是弱引用的例子！

所以 `parent` 使用 `Weak<T>` 类型而不是 `Rc`，具体来说是 `RefCell<Weak<Node>>`。现在 `Node` 结构体定义看起来像这样：

<!-- I think because I still don't understand what Weak<T> is, I’m not really
sure what it means for the parent to use Weak<T>, can you make sure that’s
clear at this point -->
<!-- I've tried, I'm not sure though /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust
use std::rc::{Rc, Weak};
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,
    children: RefCell<Vec<Rc<Node>>>,
}
```

<!-- Can you fill out this line, above; talk through the syntax, too? Also,
below, how does this mean a node can refer to a parent without owning it?
What's is actually doing here?-->
<!-- The first line is importing `Weak` from the standard library; the reader
really should be familiar with bringing types into scope by this point, don't
you think? It seems repetitive to explain this every time. /Carol
-->

这样，一个结点就能够引用其父结点，但不拥有其父结点。在示例 15-32 中，我们更新 `main` 来使用新定义以便 `leaf` 结点可以引用其父结点：

<!-- Why are we updating it, what are we doing here? Can you make that clear?
-->
<!-- Done /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::rc::{Rc, Weak};
# use std::cell::RefCell;
#
# #[derive(Debug)]
# struct Node {
#     value: i32,
#     parent: RefCell<Weak<Node>>,
#     children: RefCell<Vec<Rc<Node>>>,
# }
#
fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
}
```

<span class="caption">示例 15-32：一个 `leaf` 结点，其拥有指向其父结点 `branch` 的 `Weak` 引用</span>


<!-- Below: looks similar to what? What are we doing with this listing, can you
talk it through -->

创建 `leaf` 结点类似于示例 15-31 中如何创建 `leaf` 结点的，除了 `parent` 字段有所不同：`leaf` 开始时没有父结点，所以我们新建了一个空的 `Weak` 引用实例。

此时，当尝试使用 `upgrade` 方法获取 `leaf` 的父结点引用时，会得到一个 `None` 值。如第一个 `println!` 输出所示：

```text
leaf parent = None
```

<!-- Is this the explanation of the previous program? If so, can you change the
tone to an active tone, make it clear that it's connected? I'm struggling to
connect things up -->
<!-- I've tried, this will be better with wingdings /Carol -->

当创建 `branch` 结点时，其也会新建一个 `Weak` 引用，因为 `branch` 并没有父结点。`leaf` 仍然作为 `branch` 的一个子结点。一旦在 `branch` 中有了 `Node` 实例，就可以修改 `leaf` 使其拥有指向父结点的 `Weak` 引用。这里使用了 `leaf` 中 `parent` 字段里的 `RefCell` 的 `borrow_mut` 方法，接着使用了 `Rc::downgrade` 函数来从 `branch` 中的 `Rc` 值创建了一个指向 `branch` 的 `Weak` 引用。

<!-- Below: What does this mean for our program, that now leaf recognizes its
parent? -->
<!-- Yes /Carol -->

当再次打印出 `leaf` 的父结点时，这一次将会得到存放了 `branch` 的 `Some` 值：现在 `leaf` 可以访问其父结点了！当打印出 `leaf` 时，我们也避免了如示例 15-29 中最终会导致栈溢出的循环：`Weak` 引用被打印为 `(Weak)`：

```text
leaf parent = Some(Node { value: 5, parent: RefCell { value: (Weak) },
children: RefCell { value: [Node { value: 3, parent: RefCell { value: (Weak) },
children: RefCell { value: [] } }] } })
```

没有无限的输出表明这段代码并没有造成引用循环。这一点也可以从观察 `Rc::strong_count` 和 `Rc::weak_count` 调用的结果看出。

#### 可视化 `strong_count` 和 `weak_count` 的改变

让我们通过创建了一个新的内部作用域并将 `branch` 的创建放入其中，来观察 `Rc` 实例的 `strong_count` 和 `weak_count` 值的变化。这会展示当 `branch` 创建和离开作用域被丢弃时会发生什么。这些修改如示例 15-33 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );

    {
        let branch = Rc::new(Node {
            value: 5,
            parent: RefCell::new(Weak::new()),
            children: RefCell::new(vec![Rc::clone(&leaf)]),
        });
        *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

        println!(
            "branch strong = {}, weak = {}",
            Rc::strong_count(&branch),
            Rc::weak_count(&branch),
        );

        println!(
            "leaf strong = {}, weak = {}",
            Rc::strong_count(&leaf),
            Rc::weak_count(&leaf),
        );
    }

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
    println!(
        "leaf strong = {}, weak = {}",
        Rc::strong_count(&leaf),
        Rc::weak_count(&leaf),
    );
}
```

<span class="caption">示例 15-33：在内部作用域创建 `branch` 并检查其强弱引用计数</span>

一旦创建了 `leaf`，其 `Rc` 的强引用计数为 1，弱引用计数为 0。在内部作用域中创建了 `branch` 并与 `leaf` 相关联，此时 `branch` 中 `Rc` 的强引用计数为 1，弱引用计数为 1（因为 `leaf.parent` 通过 `Weak<T>` 指向 `branch`）。这里 `leaf` 的强引用计数为 2，因为现在 `branch` 的 `branch.children` 中储存了 `leaf` 的 `Rc` 的拷贝，不过弱引用计数仍然为 0。

当内部作用域结束时，`branch` 离开作用域，其强引用计数减少为 0，所以其 `Node` 被丢弃。来自 `leaf.parent` 的弱引用计数 1 与 `Node` 是否被丢弃无关，所以并没有产生任何内存泄露！

如果在内部作用域结束后尝试访问 `leaf` 的父结点，会再次得到 `None`。在程序的结尾，`leaf` 中 `Rc` 的强引用计数为 1，弱引用计数为 0，因为因为现在 `leaf` 又是 `Rc` 唯一的引用了。

<!-- Just to clarify, leaf is pointing to itself? -->
<!-- `leaf` is the variable pointing to the `Rc`, the `Rc` is what has the
strong and weak counts. /Carol -->

所有这些管理计数和值的逻辑都内建于 `Rc` 和 `Weak` 以及它们的 `Drop` trait 实现中。通过在 `Node` 定义中指定从子结点到父结点的关系为一个`Weak<T>`引用，就能够拥有父结点和子结点之间的双向引用而不会造成引用循环和内存泄露。

<!-- Ah! This actually cleared up a lot, we specify in the definition that a
reference should be weak and therefore ignored by the Drop trait, is that
right? It would really help to specify that up front, can you add something
like that to the start of the Weak section? -->
<!-- Done /Carol -->

## 总结

这一章涵盖了如何使用智能指针来做出不同于 Rust 常规引用默认所提供的保证与取舍。`Box<T>` 有一个已知的大小并指向分配在堆上的数据。`Rc<T>` 记录了堆上数据的引用数量以便可以拥有多个所有者。`RefCell<T>` 和其内部可变性提供了一个可以用于当需要不可变类型但是需要改变其内部值能力的类型，并在运行时而不是编译时检查借用规则。

我们还介绍了提供了很多智能指针功能的 trait `Deref` 和 `Drop`。同时探索了会造成内存泄露的引用虚幻，以及如何使用 `Weak<T>` 来避免它们。

如果本章内容引起了你的兴趣并希望现在就实现你自己的智能指针的话，请阅读 [“The Nomicon”] 来获取更多有用的信息。

[“The Nomicon”]: https://doc.rust-lang.org/stable/nomicon/

接下来，让我们谈谈 Rust 的并发。我们还会学习到一些新的对并发有帮助的智能指针。
