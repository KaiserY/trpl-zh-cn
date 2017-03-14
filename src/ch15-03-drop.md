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

