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

