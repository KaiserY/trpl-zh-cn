## `Drop` Trait 运行清理代码

> [ch15-03-drop.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-03-drop.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

对于智能指针模式来说另一个重要的 trait 是`Drop`。`Drop`运行我们在值要离开作用域时执行一些代码。智能指针在被丢弃时会执行一些重要的清理工作，比如释放内存或减少引用计数。更一般的来讲，数据类型可以管理多于内存的资源，比如文件或网络连接，而使用`Drop`在代码处理完他们之后释放这些资源。我们在智能指针上下文中讨论`Drop`是因为其功能几乎总是用于实现智能指针。

在其他一些语言中，必须每次总是必须记住在使用完智能指针实例后调用清理内存或资源的代码。如果忘记的话，运行代码的系统可能会因为负荷过重而崩溃。在 Rust 中，可以指定一些代码应该在值离开作用域时被执行，而编译器会自动插入这些代码。这意味着无需记住在所有处理完这些类型实例后调用清理代码，而仍然不会泄露资源！

指定在值离开作用域时应该执行的代码的方式是实现`Drop` trait。`Drop` trait 要求我们实现一个叫做`drop`的方法，它获取一个`self`的可变引用。

列表 15-8 展示了并没有实际功能的结构体`CustomSmartPointer`，不过我们会在创建实例之后打印出`CustomSmartPointer created.`，而在实例离开作用域时打印出`Dropping CustomSmartPointer!`，这样就能看出哪些代码被执行了。不同于`println!`语句，我们在智能指针需要执行清理代码时使用`drop`：

<span class="filename">Filename: src/main.rs</span>

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer!");
    }
}

fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    println!("Wait for it...");
}
```

<span class="caption">Listing 15-8: A `CustomSmartPointer` struct that
implements the `Drop` trait, where we could put code that would clean up after
the `CustomSmartPointer`.</span>

`Drop` trait 位于 prelude 中，所以无需导入它。`drop`方法的实现调用了`println!`；这里是你需要实际需要放入关闭套接字代码的地方。在`main`函数中，我们创建一个`CustomSmartPointer`的新实例并打印出`CustomSmartPointer created.`以便在运行时知道代码运行到此出。在`main`的结尾，`CustomSmartPointer`的实例会离开作用域。注意我们没有显式调用`drop`方法：

当运行这个程序，我们会看到：

```
CustomSmartPointer created.
Wait for it...
Dropping CustomSmartPointer!
```

被打印到屏幕上，它展示了 Rust 在实例离开作用域时自动调用了`drop`。

可以使用`std::mem::drop`函数来在值离开作用域之前丢弃它。这通常是不必要的；整个`Drop` trait 的要点在于它自动的帮我们处理清理工作。在第十六章讲到并发时我们会看到一个需要在离开作用域之前丢弃值的例子。现在知道这是可能的即可，`std::mem::drop`位于 prelude 中所以可以如列表 15-9 所示直接调用`drop`：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    drop(c);
    println!("Wait for it...");
}
```

<span class="caption">Listing 15-9: Calling `std::mem::drop` to explicitly drop
a value before it goes out of scope</span>

运行这段代码会打印出如下内容，因为`Dropping CustomSmartPointer!`在`CustomSmartPointer created.`和`Wait for it...`之间被打印出来，表明析构代码被执行了：

```
CustomSmartPointer created.
Dropping CustomSmartPointer!
Wait for it...
```

注意不允许直接调用我们定义的`drop`方法：如果将列表 15-9 中的`drop(c)`替换为`c.drop()`，会得到一个编译错误表明`explicit destructor calls not allowed`。不允许直接调用`Drop::drop`的原因是 Rust 在值离开作用域时会自动插入`Drop::drop`，这样就会丢弃值两次。丢弃一个值两次可能会造成错误或破坏内存，所以 Rust 就不允许这么做。相应的可以调用`std::mem::drop`，它的定义是：

```rust
pub mod std {
    pub mod mem {
        pub fn drop<T>(x: T) { }
    }
}
```

这个函数对于`T`是泛型的，所以可以传递任何值。这个函数的函数体并没有任何实际内容，所以它也不会利用其参数。这个空函数的作用在于`drop`获取其参数的所有权，它意味着在这个函数结尾`x`离开作用域时`x`会被丢弃。

使用`Drop` trait 实现指定的代码在很多方面都使得清理值变得方便和安全：比如可以使用它来创建我们自己的内存分配器！通过`Drop` trait 和 Rust 所有权系统，就无需担心之后清理代码，因为 Rust 会自动考虑这些问题。如果代码在值仍被使用时就清理它会出现编译错误，因为所有权系统确保了引用总是有效的，这也就保证了`drop`只会在值不再被使用时被调用一次。

现在我们学习了`Box<T>`和一些智能指针的特性，让我们聊聊一些其他标准库中定义的拥有各种实用功能的智能指针。