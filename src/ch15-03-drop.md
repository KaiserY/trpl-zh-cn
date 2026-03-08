## 使用 `Drop` Trait 运行清理代码

[ch15-03-drop.md](https://github.com/rust-lang/book/blob/ecef81cbc6f0c2d1c8a67409329b0641258c04c2/src/ch15-03-drop.md)

对智能指针模式来说，第二个重要的 trait 是 `Drop`，它允许你自定义一个值即将离开作用域时要发生的事情。你可以为任何类型提供 `Drop` trait 的实现，而其中的代码可以用来释放诸如文件或网络连接之类的资源。

我们在智能指针的上下文中介绍 `Drop`，是因为实现智能指针时几乎总会用到 `Drop` trait。例如，当一个 `Box<T>` 被丢弃时，它会释放 box 所指向的堆空间。

在某些语言里，对于某些类型，程序员每次在使用完这些类型的实例后，都必须调用代码去释放内存或其他资源。常见例子包括文件句柄、套接字和锁。如果程序员忘了这么做，系统就可能因为负担过重而崩溃。在 Rust 中，你可以指定某段代码在值离开作用域时运行，而编译器会自动插入这段代码。这样一来，你就不必小心翼翼地在程序各处都放置清理代码来处理某个类型实例结束使用时的情况，同时也不会泄漏资源！

指定在值离开作用域时应该执行的代码的方式是实现 `Drop` trait。`Drop` trait 要求实现一个叫做 `drop` 的方法，它获取一个 `self` 的可变引用。为了能够看出 Rust 何时调用 `drop`，让我们暂时使用 `println!` 语句实现 `drop`。

示例 15-14 展示了唯一定制功能就是当其实例离开作用域时，打印出 `Dropping CustomSmartPointer!` 的结构体 `CustomSmartPointer`，这会演示 Rust 何时运行 `drop` 方法：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch15-smart-pointers/listing-15-14/src/main.rs}}
```

<span class="caption">示例 15-14：结构体 `CustomSmartPointer`，其实现了放置清理代码的 `Drop` trait</span>

`Drop` trait 包含在 prelude 中，因此无需将其引入作用域。我们在 `CustomSmartPointer` 上实现了 `Drop` trait，并提供了一个调用 `println!` 的 `drop` 方法实现。`drop` 函数体是放置任何当类型实例离开作用域时期望运行的逻辑的地方。这里选择打印一些文本以可视化地展示 Rust 何时调用 `drop`。

在 `main` 中，我们新建了两个 `CustomSmartPointer` 实例并打印出了 `CustomSmartPointer created.`。在 `main` 的结尾，`CustomSmartPointer` 的实例会离开作用域，而 Rust 会调用放置于 `drop` 方法中的代码，打印出最后的信息。注意无需显式调用 `drop` 方法：

当运行这个程序，会出现如下输出：

```console
{{#include ../listings/ch15-smart-pointers/listing-15-14/output.txt}}
```

当实例离开作用域时，Rust 会自动替我们调用 `drop`，并运行我们指定的代码。变量会按照创建顺序的逆序被丢弃，所以 `d` 会先于 `c` 被丢弃。这个例子的目的，是让你直观地看到 `drop` 方法是如何工作的；而通常在真实代码里，你会写的是类型所需的清理逻辑，而不是一条打印消息。

不幸的是，禁用自动 `drop` 功能并不是一件容易的事。通常也不需要禁用 `drop` ；整个 `Drop` trait 存在的意义在于其是自动处理的。然而，有时你可能需要提早清理某个值。一个例子是当使用智能指针管理锁时；你可能希望强制运行 `drop` 方法来释放锁以便作用域中的其他代码可以获取锁。Rust 并不允许我们主动调用 `Drop` trait 的 `drop` 方法；当我们希望在作用域结束之前就强制释放变量的话，我们应该使用的是由标准库提供的 `std::mem::drop` 函数。

如果我们像是示例 15-14 那样尝试调用 `Drop` trait 的 `drop` 方法，就会得到像示例 15-15 那样的编译错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch15-smart-pointers/listing-15-15/src/main.rs:here}}
```

<span class="caption">示例 15-15：尝试手动调用 `Drop` trait 的 `drop` 方法提早清理</span>

如果尝试编译代码会得到如下错误：

```console
{{#include ../listings/ch15-smart-pointers/listing-15-15/output.txt}}
```

错误信息表明，我们不被允许显式调用 `drop`。错误信息中使用了术语**析构函数**（*destructor*），这是编程中对“清理某个实例的函数”的通用称呼。析构函数与**构造函数**（*constructor*）相对应，后者用于创建实例。Rust 中的 `drop` 函数就是一种特定的析构函数。

Rust 不允许我们显式调用 `drop`，因为 Rust 仍然会在 `main` 结束时自动对该值调用 `drop`。这会导致二次释放（*double free*）错误，因为 Rust 会尝试清理同一个值两次。

因为不能禁用当值离开作用域时自动插入的 `drop`，并且不能显式调用 `drop` 方法。如果我们需要强制提早清理值，可以使用 `std::mem::drop` 函数。

`std::mem::drop` 函数与 `Drop` trait 中的 `drop` 方法不同。我们通过把想要强制提前丢弃的值作为参数传给它来调用。这个函数位于 prelude 中，因此我们可以修改示例 15-15 里的 `main`，改为调用 `drop` 函数，如示例 15-16 所示：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch15-smart-pointers/listing-15-16/src/main.rs:here}}
```

<span class="caption">示例 15-16：在值离开作用域之前调用 `std::mem::drop` 显式清理</span>

运行这段代码将打印出如下内容：

```console
{{#include ../listings/ch15-smart-pointers/listing-15-16/output.txt}}
```

文本 ``Dropping CustomSmartPointer with data `some data`!`` 会出现在 `CustomSmartPointer created.` 和 `CustomSmartPointer dropped before the end of main.` 之间，这表明 `drop` 方法的代码在那个时刻被调用，以丢弃 `c`。

你可以以多种方式利用 `Drop` trait 实现里指定的代码，让清理既方便又安全。例如，你可以用它来创建自己的内存分配器！有了 `Drop` trait 和 Rust 的所有权系统，你就不必记住何时进行清理，因为 Rust 会自动替你完成这些工作。

你也不必担心由于不小心清理仍在使用的值而导致的问题：所有权系统确保引用总是有效的，也会确保 `drop` 只会在值不再被使用时被调用一次。

现在我们已经了解了 `Box<T>` 以及智能指针的一些特征，接下来看看标准库中定义的其他几种智能指针。
