## `Drop` Trait 运行清理代码

> [ch15-03-drop.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-03-drop.md)
> <br>
> commit 721553e3a7b5ee9430cb548c8699b67be197b3f6

对于智能指针模式来说另一个重要的 trait 是 `Drop`。`Drop` 允许我们在值要离开作用域时执行一些代码。可以为任何类型提供 `Drop` trait 的实现，同时所指定的代码被用于释放类似于文件或网络连接的资源。我们在智能指针上下文中讨论 `Drop` 是因为其功能几乎总是用于实现智能指针。例如，`Box<T>` 自定义了 `Drop` 用来释放 box 所指向的堆空间。

在其他一些语言中，我们不得不记住在每次使用完智能指针实例后调用清理内存或资源的代码。如果忘记的话，运行代码的系统可能会因为负荷过重而崩溃。在 Rust 中，可以指定一些代码应该在值离开作用域时被执行，而编译器会自动插入这些代码。

<!-- Are we saying that any code can be run, and that we can use that to clean
up, or that this code that can be run is specifically always for clean up? -->
<!-- I don't understand what the difference between those two choices are?
/Carol -->

这意味着无需记住在所有处理完这些类型实例后调用清理代码，而仍然不会泄露资源！

指定在值离开作用域时应该执行的代码的方式是实现 `Drop` trait。`Drop` trait 要求实现一个叫做 `drop` 的方法，它获取一个 `self` 的可变引用。为了能够看出 Rust 何时调用 `drop`，让我们暂时使用 `println!` 语句实现 `drop`。

<!-- Why are we showing this as an example and not an example of it being used
for clean up? -->
<!-- To demonstrate the mechanics of implementing the trait and showing when
this code gets run. It's hard to experience the cleaning up unless we print
something. /Carol -->

示例 15-16 展示了唯一定制功能就是当其实例离开作用域时打印出 `Dropping CustomSmartPointer!` 的结构体 `CustomSmartPointer`。这会演示 Rust 何时运行 `drop` 函数：

<!-- Is this below just telling us how to adapt it for cleaning up instead?
Maybe save it for when we have context for it? Instead of a `println!`
statement, you'd fill in `drop` with whatever cleanup code your smart pointer
needs to run: -->
<!-- This is demonstrating what we need to do to use `Drop`, without getting
into the complexities of what "cleaning up" might mean yet, just to give the
reader an idea of when this code gets called and that it gets called
automatically. We're building up to cleaning up. /Carol -->


<span class="filename">文件名: src/main.rs</span>

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer { data: String::from("my stuff") };
    let d = CustomSmartPointer { data: String::from("other stuff") };
    println!("CustomSmartPointers created.");
}
```

<span class="caption">示例 15-16：结构体 `CustomSmartPointer`，其实现了放置清理代码的 `Drop` trait</span>

`Drop` trait 包含在 prelude 中，所以无需导入它。我们在 `CustomSmartPointer` 上实现了 `Drop` trait，并提供了一个调用 `println!` 的 `drop` 方法实现。`drop` 函数体是放置任何当类型实例离开作用域时期望运行的逻辑的地方。这里选择打印一些文本以展示 Rust 合适调用 `drop`。

<!-- Where you'd put this code, or where this code would be called? It seems
laborious to write this clean up code wherever there's a print call? -->
<!-- I'm not sure how you concluded that from what we had here, could you
elaborate? /Carol -->

在 `main` 中，新建了一个 `CustomSmartPointer` 实例并打印出了 `CustomSmartPointer created.`。在 `main` 的结尾，`CustomSmartPointer` 的实例会离开作用域，而 Rust 会调用放置于 `drop` 方法中的代码，打印出最后的信息。注意无需显示调用 `drop` 方法：

当运行这个程序，会出现如下输出：

```text
CustomSmartPointers created.
Dropping CustomSmartPointer with data `other stuff`!
Dropping CustomSmartPointer with data `my stuff`!
```

当实例离开作用域 Rust 会自动调用 `drop`，并调用我们指定的代码。变量以被创创建时相反的顺序被丢弃，所以 `d` 在 `c` 之前被丢弃。这刚好给了我们一个 drop 方法如何工作的可视化指导，不过通常需要指定类型所需执行的清理代码而不是打印信息。

<!-- Can you wrap this example up by saying what you would actually put in a
drop method and why?-->
<!-- Done /Carol -->

#### 通过 `std::mem::drop` 提早丢弃值

<!-- is this a new method from Drop or the same method? -->
<!-- This is a new function. /Carol -->

Rust 当值离开作用域时自动插入 `drop` 调用，不能直接禁用这个功能。



被打印到屏幕上，它展示了 Rust 在实例离开作用域时自动调用了`drop`。通常也不需要禁用 `drop`；整个 `Drop` trait 存在的意义在于其是自动处理的。有时可能需要提早清理某个值。一个例子是当使用智能指针管理锁时；你可能希望强制运行 `drop` 方法来释放锁以便作用域中的其他代码可以获取锁。首先。让我们看看自己调用 `Drop` trait 的 `drop` 方法会发生什么，如示例 15-17 修改示例 15-16 中的 `main` 函数：

<!-- Above: I'm not following why we are doing this, if it's not necessary and
we aren't going to cover it now anyway -- can you lay out why we're discussing
this here? -->
<!-- Done. /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    c.drop();
    println!("CustomSmartPointer dropped before the end of main.");
}
```

<span class="caption">示例 15-17：尝试手动调用 `Drop` trait 的 `drop` 方法提早清理</span>

如果尝试编译代码会得到如下错误：

```text
error[E0040]: explicit use of destructor method
  --> src/main.rs:15:7
   |
15 |     c.drop();
   |       ^^^^ explicit destructor calls not allowed
```

错误信息表明不允许显式调用 `drop`。错误信息使用了术语 **析构函数**（*destructor*），这是一个清理实例的函数的通用编程概念。**析构函数** 对应创建实例的 **构造函数**。Rust 中的 `drop` 函数就是这么一个析构函数。

Rust 不允许我们显式调用 `drop` 因为 Rust 仍然会在 `main` 的结尾对值自动调用 `drop`，这会导致一个 **double free** 错误，因为 Rust 会尝试清理相同的值两次。

因为不能禁用当值离开作用域时自动插入的 `drop`，并且不能显示调用 `drop`，如果我们需要提早清理值，可以使用 `std::mem::drop` 函数。

`std::mem::drop` 函数不同于 `Drop` trait 中的 `drop` 方法。可以通过传递希望提早强制丢弃的值作为参数。`std::mem::drop` 位于 prelude，所以我们可以修改示例 15-16 中的 `main` 来调用 `drop` 函数如示例 15-18 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# struct CustomSmartPointer {
#     data: String,
# }
#
# impl Drop for CustomSmartPointer {
#     fn drop(&mut self) {
#         println!("Dropping CustomSmartPointer!");
#     }
# }
#
fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    drop(c);
    println!("CustomSmartPointer dropped before the end of main.");
}
```

<span class="caption">示例 15-18: 在值离开作用域之前调用 `std::mem::drop` 显式清理</span>

运行这段代码会打印出如下：

```text
CustomSmartPointer created.
Dropping CustomSmartPointer with data `some data`!
CustomSmartPointer dropped before the end of main.
```

<!-- What's the destructor code, here? We haven't mentioned that before, not in
this chapter in any case -->
<!-- I added a definition for destructor a few paragraphs above, the first time
we see it in an error message. /Carol -->

```Dropping CustomSmartPointer with data `some data`!``` 出现在 `CustomSmartPointer created.` 和 `CustomSmartPointer dropped before the end of main.` 之间，表明了 `drop` 方法被调用了并在此丢弃了 `c`。

<!-- How does this show that the destructor code (is that drop?) is called? Is
this correct, above?-->
<!-- The order of what gets printed shows that the drop code is called.
/Carol-->

`Drop` trait 实现中指定的代码可以用于许多方面来使得清理变得方便和安全：比如可以用其创建我们自己的内存分配器！通过 `Drop` trait 和 Rust 所有权系统，你无需担心之后清理代码，Rust 会自动考虑这些问题。

我们也无需担心意外的清理掉仍在使用的值，这会造成编译器错误：所有权系统确保引用总是有效的，也会确保 `drop` 只会在值不再被使用时被调用一次。



使用`Drop` trait 实现指定的代码在很多方面都使得清理值变得方便和安全：比如可以使用它来创建我们自己的内存分配器！通过`Drop` trait 和 Rust 所有权系统，就无需担心之后清理代码，因为 Rust 会自动考虑这些问题。如果代码在值仍被使用时就清理它会出现编译错误，因为所有权系统确保了引用总是有效的，这也就保证了`drop`只会在值不再被使用时被调用一次。

现在我们学习了 `Box<T>` 和一些智能指针的特性，让我们聊聊一些其他标准库中定义的智能指针。