## 引用循环和内存泄漏是安全的

> [ch15-06-reference-cycles.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-06-reference-cycles.md)
> <br>
> commit c49e5ee8859f8eb8f8867cbeafbdf5b802aa5894

我们讨论过 Rust 做出的一些保证，例如永远也不会遇到一个空值，而且数据竞争也会在编译时被阻止。Rust 的内存安全保证也使其更难以制造从不被清理的内存，这被称为**内存泄露**。然而 Rust 并不是**不可能**出现内存泄漏，避免内存泄露**并**不是 Rust 的保证之一。换句话说，内存泄露是安全的。

在使用`Rc<T>`和`RefCell<T>`时，有可能创建循环引用，这时各个项相互引用并形成环。这是不好的因为每一项的引用计数将永远也到不了 0，其值也永远也不会被丢弃。让我们看看这是如何发生的以及如何避免它。

在列表 15-16 中，我们将使用列表 15-5 中`List`定义的另一个变体。我们将回到储存`i32`值作为`Cons`成员的第一个元素。现在`Cons`成员的第二个元素是`RefCell<Rc<List>>`：这时就不能修改`i32`值了，但是能够修改`Cons`成员指向的哪个`List`。还需要增加一个`tail`方法来方便我们在拥有一个`Cons`成员时访问第二个项：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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

<span class="caption">Listing 15-16: A cons list definition that holds a
`RefCell` so that we can modify what a `Cons` variant is referring to</span>

接下来，在列表 15-17 中，我们将在变量`a`中创建一个`List`值，其内部是一个`5, Nil`的列表。接着在变量`b`创建一个值 10 和指向`a`中列表的`List`值。最后修改`a`指向`b`而不是`Nil`，这会创建一个循环：

<span class="filename">Filename: src/main.rs</span>

```rust
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
use List::{Cons, Nil};
use std::rc::Rc;
use std::cell::RefCell;

fn main() {

    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    let b = Rc::new(Cons(10, RefCell::new(a.clone())));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    if let Some(ref link) = a.tail() {
        *link.borrow_mut() = b.clone();
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    // Uncomment the next line to see that we have a cycle; it will
    // overflow the stack
    // println!("a next item = {:?}", a.tail());
}
```

<span class="caption">Listing 15-17: Creating a reference cycle of two `List`
values pointing to each other</span>

使用`tail`方法来获取`a`中`RefCell`的引用，并将其放入变量`link`中。接着对`RefCell`使用`borrow_mut`方法将其中的值从存放`Nil`值的`Rc`改为`b`中的`Rc`。这创建了一个看起来像图 15-18 所示的引用循环：

<img alt="Reference cycle of lists" src="img/trpl15-04.svg" class="center" style="width: 50%;" />

<span class="caption">Figure 15-18: A reference cycle of lists `a` and `b`
pointing to each other</span>

如果你注释掉最后的`println!`，Rust 会尝试打印出`a`指向`b`指向`a`这样的循环直到栈溢出。

观察最后一个`println!`之前的打印结果，就会发现在将`a`改变为指向`b`之后`a`和`b`的引用计数都是 2。在`main`的结尾，Rust 首先会尝试丢弃`b`，这会使`Rc`的引用计数减一，但是这个计数是 1 而不是 0，所以`Rc`在堆上的内存不会被丢弃。它只是会永远的停留在 1 上。这个特定例子中，程序立马就结束了，所以并不是一个问题，不过如果是一个更加复杂的程序，它在这个循环中分配了很多内存并占有很长时间，这就是个问题了。这个程序会使用多于它所需要的内存，并有可能压垮系统并造成没有内存可供使用。

现在，如你所见，在 Rust 中创建引用循环是困难和繁琐的。但并不是不可能：避免引用循环这种形式的内存泄漏并不是 Rust 的保证之一。如果你有包含`Rc<T>`的`RefCell<T>`值或类似的嵌套结合了内部可变性和引用计数的类型，请务必小心确保你没有形成一个引用循环。在列表 15-14 的例子中，可能解决方式就是不要编写像这样可能造成引用循环的代码，因为我们希望`Cons`成员拥有他们指向的列表。

举例来说，对于像图这样的数据结构，为了创建父节点指向子节点的边和以相反方向从子节点指向父节点的边，有时需要创建这样的引用循环。如果一个方向拥有所有权而另一个方向没有，对于模拟这种数据关系的一种不会创建引用循环和内存泄露的方式是使用`Weak<T>`。接下来让我们探索一下！

### 避免引用循环：将`Rc<T>`变为`Weak<T>`

Rust 标准库中提供了`Weak<T>`，一个用于存在引用循环但只有一个方向有所有权的智能指针。我们已经展示过如何克隆`Rc<T>`来增加引用的`strong_count`；`Weak<T>`是一种引用`Rc<T>`但不增加`strong_count`的方式：相反它增加`Rc`引用的`weak_count`。当`Rc`离开作用域，其内部值会在`strong_count`为 0 的时候被丢弃，即便`weak_count`不为 0 。为了能够从`Weak<T>`中获取值，首先需要使用`upgrade`方法将其升级为`Option<Rc<T>>`。升级`Weak<T>`的结果在`Rc`还未被丢弃时是`Some`，而在`Rc`被丢弃时是`None`。因为`upgrade`返回一个`Option`，我们知道 Rust 会确保`Some`和`None`的情况都被处理并不会尝试使用一个无效的指针。

不同于列表 15-17 中每个项只知道它的下一项，加入我们需要一个树，它的项知道它的子项**和**父项。

让我们从一个叫做`Node`的存放拥有所有权的`i32`值和其子`Node`值的引用的结构体开始：

```rust
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct Node {
    value: i32,
    children: RefCell<Vec<Rc<Node>>>,
}
```

我们希望能够`Node`拥有其子节点，同时也希望变量可以拥有每个节点以便可以直接访问他们。这就是为什么`Vec`中的项是`Rc<Node>`值。我们也希望能够修改其他节点的子节点，这就是为什么`children`中`Vec`被放进了`RefCell`的原因。在列表 15-19 中创建了一个叫做`leaf`的带有值 3 并没有子节点的`Node`实例，和另一个带有值 5 和以`leaf`作为子节点的实例`branch`：


<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        children: RefCell::new(vec![leaf.clone()]),
    });
}
```

<span class="caption">Listing 15-19: Creating a `leaf` node and a `branch` node
where `branch` has `leaf` as one of its children but `leaf` has no reference to
`branch`</span>

`leaf`中的`Node`现在有两个所有者：`leaf`和`branch`，因为我们克隆了`leaf`中的`Rc`并储存在了`branch`中。`branch`中的`Node`知道它与`leaf`相关联因为`branch`在`branch.children`中有`leaf`的引用。然而，`leaf`并不知道它与`branch`相关联，而我们希望`leaf`知道`branch`是其父节点。

为了做到这一点，需要在`Node`结构体定义中增加一个`parent`字段，不过`parent`的类型应该是什么呢？我们知道它不能包含`Rc<T>`，因为这样`leaf.parent`将会指向`branch`而`branch.children`会包含`leaf`的指针，这会形成引用循环。`leaf`和`branch`不会被丢弃因为他们总是引用对方且引用计数永远也不会是零。

所以在`parent`的类型中是使用`Weak<T>`而不是`Rc`，具体来说是`RefCell<Weak<Node>>`：

<span class="filename">Filename: src/main.rs</span>

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

这样，一个节点就能够在拥有父节点时指向它，而并不拥有其父节点。一个父节点哪怕在拥有指向它的子节点也会被丢弃，只要是其自身也没有一个父节点就行。现在将`main`函数更新为如列表 15-20 所示：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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
        children: RefCell::new(vec![leaf.clone()]),
    });

    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    println!("leaf parent = {:?}", leaf.parent.borrow().upgrade());
}
```

<span class="caption">Listing 15-20: A `leaf` node and a `branch` node where
`leaf` has a `Weak` reference to its parent, `branch`</span>

创建`leaf`节点是类似的；因为它作为开始并没有父节点，这里创建了一个新的`Weak`引用实例。当尝试通过`upgrade`方法获取`leaf`父节点的引用时，会得到一个`None`值，如第一个`println!`输出所示：

```=
leaf parent = None
```

类似的，`branch`也有一个新的`Weak`引用，因为也没有父节点。`leaf`仍然作为`branch`的一个子节点。一旦在`branch`中有了一个新的`Node`实例，就可以修改`leaf`将一个`branch`的`Weak`引用作为其父节点。这里使用了`leaf`中`parent`字段里的`RefCell`的`borrow_mut`方法，接着使用了`Rc::downgrade`函数来从`branch`中的`Rc`值创建了一个指向`branch`的`Weak`引用。

当再次打印出`leaf`的父节点时，这一次将会得到存放了`branch`的`Some`值。另外需要注意到这里并没有打印出类似列表 15-14 中那样最终导致栈溢出的循环：`Weak`引用仅仅打印出`(Weak)`：

```
leaf parent = Some(Node { value: 5, parent: RefCell { value: (Weak) },
children: RefCell { value: [Node { value: 3, parent: RefCell { value: (Weak) },
children: RefCell { value: [] } }] } })
```

没有无限的输出（或直到栈溢出）的事实表明这里并没有引用循环。另一种证明的方式时观察调用`Rc::strong_count`和`Rc::weak_count`的值。在列表 15-21 中，创建了一个新的内部作用域并将`branch`的创建放入其中，这样可以观察`branch`被创建时和离开作用域被丢弃时发生了什么：

<span class="filename">Filename: src/main.rs</span>

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
            children: RefCell::new(vec![leaf.clone()]),
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

<span class="caption">Listing 15-21: Creating `branch` in an inner scope and
examining strong and weak reference counts of `leaf` and `branch`</span>

创建`leaf`之后，强引用计数是 1 （用于`leaf`自身）而弱引用计数是 0。在内部作用域中，在创建`branch`和关联`leaf`和`branch`之后，`branch`的强引用计数为 1（用于`branch`自身）而弱引用计数为 1（因为`leaf.parent`通过一个`Weak<T>`指向`branch`）。`leaf`的强引用计数为 2，因为`branch`现在有一个`leaf`克隆的`Rc`储存在`branch.children`中。`leaf`的弱引用计数仍然为 0。

当内部作用域结束，`branch`离开作用域，其强引用计数减少为 0，所以其`Node`被丢弃。来自`leaf.parent`的弱引用计数 1 与`Node`是否被丢弃无关，所以并没有产生内存泄露！

如果在内部作用域结束后尝试访问`leaf`的父节点，会像`leaf`拥有父节点之前一样得到`None`值。在程序的末尾，`leaf`的强引用计数为 1 而弱引用计数为 0，因为现在`leaf`又是唯一指向其自己的值了。

所有这些管理计数和值是否应该被丢弃的逻辑都通过`Rc`和`Weak`和他们的`Drop` trait 实现来控制。通过在定义中指定从子节点到父节点的关系为一个`Weak<T>`引用，就能够拥有父节点和子节点之间的双向引用而不会造成引用循环和内存泄露。

## 总结

现在我们学习了如何选择不同类型的智能指针来选择不同的保证并与 Rust 的常规引用向取舍。`Box<T>`有一个已知的大小并指向分配在堆上的数据。`Rc<T>`记录了堆上数据的引用数量这样就可以拥有多个所有者。`RefCell<T>`和其内部可变性使其可以用于需要不可变类型，但希望在运行时而不是编译时检查借用规则的场景。

我们还介绍了提供了很多智能指针功能的 trait `Deref`和`Drop`。同时探索了形成引用循环和造成内存泄漏的可能性，以及如何使用`Weak<T>`避免引用循环。

如果本章内容引起了你的兴趣并希望现在就实现你自己的智能指针的话，请阅读 [The Nomicon] 来获取更多有用的信息。

[The Nomicon]: https://doc.rust-lang.org/stable/nomicon/vec.html

接下来，让我们谈谈 Rust 的并发。我们还会学习到一些新的堆并发有帮助的智能指针。