## `RefCell<T>`和内部可变性模式

> [ch15-05-interior-mutability.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-05-interior-mutability.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

**内部可变性**（*Interior mutability*）是 Rust 中的一个设计模式，它允许你即使在有不可变引用时改变数据，这通常是借用规则所不允许。内部可变性模式涉及到在数据结构中使用`unsafe`代码来模糊 Rust 通常的可变性和借用规则。我们还未讲到不安全代码；第十九章会学习他们。内部可变性模式用于当你可以确保代码在运行时也会遵守借用规则，哪怕编译器也不能保证的情况。引入的`unsafe`代码将被封装进安全的 API 中，而外部类型仍然是不可变的。

让我们通过遵循内部可变性模式的`RefCell<T>`类型来开始探索。

###  `RefCell<T>`拥有内部可变性

不同于`Rc<T>`，`RefCell<T>`代表其数据的唯一的所有权。那么是什么让`RefCell<T>`不同于像`Box<T>`这样的类型呢？回忆一下第四章所学的借用规则：

1. 在任意给定时间，**只能**拥有如下中的一个：
  * 一个可变引用。
  * 任意属性的不可变引用。
2. 引用必须总是有效的。

对于引用和`Box<T>`，借用规则的不可变性作用于编译时。对于`RefCell<T>`，这些不可变性作用于**运行时**。对于引用，如果违反这些规则，会得到一个编译错误。而对于`RefCell<T>`，违反这些规则会`panic!`。

Rust 编译器执行的静态分析天生是保守的。代码的一些属性则不可能通过分析代码发现：其中最著名的就是停机问题（停机问题），这超出了本书的范畴，不过如果你感兴趣的话这是一个值得研究的有趣主题。

因为一些分析是不可能的，Rust 编译器在其不确定的时候甚至都不尝试猜测，所以说它是保守的而且有时会拒绝事实上不会违反 Rust 保证的正确的程序。换句话说，如果 Rust 接受不正确的程序，那么人们也就不会相信 Rust 所做的保证了。如果 Rust 拒绝正确的程序，会给程序员带来不便，但不会带来灾难。`RefCell<T>`正是用于当你知道代码遵守借用规则，而编译器不能理解的时候。

类似于`Rc<T>`，`RefCell<T>`只能用于单线程场景。在并发章节会介绍如何在多线程程序中使用`RefCell<T>`的功能。现在所有你需要知道的就是如果尝试在多线程上下文中使用`RefCell<T>`，会得到一个编译错误。

对于引用，可以使用`&`和`&mut`语法来分别创建不可变和可变的引用。不过对于`RefCell<T>`，我们使用`borrow`和`borrow_mut`方法，它是`RefCell<T>`拥有的安全 API 的一部分。`borrow`返回`Ref`类型的智能指针，而`borrow_mut`返回`RefMut`类型的智能指针。这两个类型实现了`Deref`所以可以被当作常规引用处理。`Ref`和`RefMut`动态的借用所有权，而他们的`Drop`实现也动态的释放借用。

示例 15-14 展示了如何使用`RefCell<T>`来使函数不可变的和可变的借用它的参数。注意`data`变量使用`let data`而不是`let mut data`来声明为不可变的，而`a_fn_that_mutably_borrows`则允许可变的借用数据并修改它！

<span class="filename">Filename: src/main.rs</span>

```rust
use std::cell::RefCell;

fn a_fn_that_immutably_borrows(a: &i32) {
    println!("a is {}", a);
}

fn a_fn_that_mutably_borrows(b: &mut i32) {
    *b += 1;
}

fn demo(r: &RefCell<i32>) {
    a_fn_that_immutably_borrows(&r.borrow());
    a_fn_that_mutably_borrows(&mut r.borrow_mut());
    a_fn_that_immutably_borrows(&r.borrow());
}

fn main() {
    let data = RefCell::new(5);
    demo(&data);
}
```

<span class="caption">Listing 15-14: Using `RefCell<T>`, `borrow`, and
`borrow_mut`</span>

这个例子打印出：

```
a is 5
a is 6
```

在`main`函数中，我们新声明了一个包含值 5 的`RefCell<T>`，并储存在变量`data`中，声明时并没有使用`mut`关键字。接着使用`data`的一个不可变引用来调用`demo`函数：对于`main`函数而言`data`是不可变的！

在`demo`函数中，通过调用`borrow`方法来获取到`RefCell<T>`中值的不可变引用，并使用这个不可变引用调用了`a_fn_that_immutably_borrows`函数。更为有趣的是，可以通过`borrow_mut`方法来获取`RefCell<T>`中值的**可变**引用，而`a_fn_that_mutably_borrows`函数就允许修改这个值。可以看到下一次调用`a_fn_that_immutably_borrows`时打印出的值是 6 而不是 5。

### `RefCell<T>`在运行时检查借用规则

回忆一下第四章因为借用规则，尝试使用常规引用在同一作用域中创建两个可变引用的代码无法编译：

```rust,ignore
let mut s = String::from("hello");

let r1 = &mut s;
let r2 = &mut s;
```

这会得到一个编译错误：

```
error[E0499]: cannot borrow `s` as mutable more than once at a time
 -->
  |
5 |     let r1 = &mut s;
  |                   - first mutable borrow occurs here
6 |     let r2 = &mut s;
  |                   ^ second mutable borrow occurs here
7 | }
  | - first borrow ends here
```

与此相反，使用`RefCell<T>`并在同一作用域调用两次`borrow_mut`的代码是**可以**编译的，不过它会在运行时 panic。如下代码：

```rust,should_panic
use std::cell::RefCell;

fn main() {
    let s = RefCell::new(String::from("hello"));

    let r1 = s.borrow_mut();
    let r2 = s.borrow_mut();
}
```

能够编译不过在`cargo run`运行时会出现如下错误：

```
    Finished dev [unoptimized + debuginfo] target(s) in 0.83 secs
     Running `target/debug/refcell`
thread 'main' panicked at 'already borrowed: BorrowMutError',
/stable-dist-rustc/build/src/libcore/result.rs:868
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

这个运行时`BorrowMutError`类似于编译错误：它表明我们已经可变得借用过一次`s`了，所以不允许再次借用它。我们并没有绕过借用规则，只是选择让 Rust 在运行时而不是编译时执行他们。你可以选择在任何时候任何地方使用`RefCell<T>`，不过除了不得不编写很多`RefCell`之外，最终还是可能会发现其中的问题（可能是在生产环境而不是开发环境）。另外，在运行时检查借用规则有性能惩罚。

### 结合`Rc<T>`和`RefCell<T>`来拥有多个可变数据所有者

那么为什么要权衡考虑选择引入`RefCell<T>`呢？好吧，还记得我们说过`Rc<T>`只能拥有一个`T`的不可变引用吗？考虑到`RefCell<T>`是不可变的，但是拥有内部可变性，可以将`Rc<T>`与`RefCell<T>`结合来创造一个既有引用计数又可变的类型。示例 15-15 展示了一个这么做的例子，再次回到示例 15-5 中的 cons list。在这个例子中，不同于在 cons list 中储存`i32`值，我们储存一个`Rc<RefCell<i32>>`值。希望储存这个类型是因为其可以拥有不属于列表一部分的这个值的所有者（`Rc<T>`提供的多个所有者功能），而且还可以改变内部的`i32`值（`RefCell<T>`提供的内部可变性功能）：

<span class="filename">Filename: src/main.rs</span>

```rust
#[derive(Debug)]
enum List {
    Cons(Rc<RefCell<i32>>, Rc<List>),
    Nil,
}

use List::{Cons, Nil};
use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    let value = Rc::new(RefCell::new(5));

    let a = Cons(value.clone(), Rc::new(Nil));
    let shared_list = Rc::new(a);

    let b = Cons(Rc::new(RefCell::new(6)), shared_list.clone());
    let c = Cons(Rc::new(RefCell::new(10)), shared_list.clone());

    *value.borrow_mut() += 10;

    println!("shared_list after = {:?}", shared_list);
    println!("b after = {:?}", b);
    println!("c after = {:?}", c);
}
```

<span class="caption">Listing 15-15: Using `Rc<RefCell<i32>>` to create a
`List` that we can mutate</span>

我们创建了一个值，它是`Rc<RefCell<i32>>`的实例。将其储存在变量`value`中因为我们希望之后能直接访问它。接着在`a`中创建了一个拥有存放了`value`值的`Cons`成员的`List`，而且`value`需要被克隆因为我们希望除了`a`之外还拥有`value`的所有权。接着将`a`封装进`Rc<T>`中这样就可以创建都引用`a`的有着不同开头的列表`b`和`c`，类似示例 15-12 中所做的那样。

一旦创建了`shared_list`、`b`和`c`，接下来就可以通过解引用`Rc<T>`和对`RefCell`调用`borrow_mut`来将 10 与 5 相加了。

当打印出`shared_list`、`b`和`c`时，可以看到他们都拥有被修改的值 15：

```
shared_list after = Cons(RefCell { value: 15 }, Nil)
b after = Cons(RefCell { value: 6 }, Cons(RefCell { value: 15 }, Nil))
c after = Cons(RefCell { value: 10 }, Cons(RefCell { value: 15 }, Nil))
```

这是非常巧妙的！通过使用`RefCell<T>`，我们可以拥有一个表面上不可变的`List`，不过可以使用`RefCell<T>`中提供内部可变性的方法来在需要时修改数据。`RefCell<T>`的运行时借用规则检查也确实保护我们免于出现数据竞争，而且我们也决定牺牲一些速度来换取数据结构的灵活性。

`RefCell<T>`并不是标准库中唯一提供内部可变性的类型。`Cell<T>`有点类似，不过不同于`RefCell<T>`那样提供内部值的引用，其值被拷贝进和拷贝出`Cell<T>`。`Mutex<T>`提供线程间安全的内部可变性，下一章并发会讨论它的应用。请查看标准库来获取更多细节和不同类型的区别。