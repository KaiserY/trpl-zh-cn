## 使用线程同时运行代码

> [ch16-01-threads.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-01-threads.md)
> <br>
> commit 90406bd5a4cd4447b46cd7e03d33f34a651e9bb7

在大部分现代操作系统中，执行中程序的代码运行于一个 **进程**（*process*）中，操作系统则负责管理多个进程。在程序内部，也可以拥有多个同时运行的独立部分。这个运行这些独立部分的功能被称为 **线程**（*threads*）。

将程序中的计算拆分进多个线程可以改善性能，因为程序可以同时进行多个任务，不过这也会增加复杂性。因为线程是同时运行的，所以无法预先保证不同线程中的代码的执行顺序。这会导致诸如此类的问题：

* 竞争状态（Race conditions），多个线程以不一致的顺序访问数据或资源
* 死锁（Deadlocks），两个线程相互等待对方停止使用其所拥有的资源，这会阻止它们继续运行
* 只会发生在特定情况且难以稳定重现和修复的 bug

Rust 尝试缓和使用线程的负面影响。不过在多线程上下文中编程仍需格外小心，同时其所要求的代码结构也不同于运行于单线程的程序。

编程语言有一些不同的方法来实现线程。很多操作系统提供了创建新线程的 API。这种由编程语言调用操作系统 API 创建线程的模模型有时被称为 *1:1*，一个 OS 线程对应一个语言线程。

很多编程语言提供了自己特殊的线程实现。编程语言提供的线程被称为 **绿色**（*green*）线程，使用绿色线程的语言会在不同数量的 OS 线程中执行它们。为此，绿色线程模式被称为 *M:N* 模型：`M` 个绿色线程对应 `N` 个 OS 线程，这里 `M` 和 `N` 不必相同。

每一个模型都有其优势和取舍。对于 Rust 来说最重要的取舍是运行时支持。运行时是一个令人迷惑的概念，其在不同上下文中可能有不同的含义。

在当前上下文中，**运行时** 代表进制文件中包含的由语言自身提供的代码。这些代码根据语言的不同可大可小，不过任何非汇编语言都会有一定数量的运行时代码。为此，通常人们说一个语言 “没有运行时”，一般意味着 “小运行时”。更小的运行时拥有更少的功能不过其优势在于更小的二进制输出，这使其易于在更多上下文中与其他语言向结合。虽然很多语言觉得增加运行时来换取更多功能没有什么问题，但是 Rust 需要做到几乎没有运行时，同时为了保持高性能必需能够调用 C 语言，这点也是不能妥协的。

绿色线程的 M:N 模型更大的语言运行时来管理这些线程。为此，Rust 标准库只提供了 1:1 线程模型实现。因为 Rust 是如此底层的语言，所以有相应的 crate 实现了 M:N 线程模型，如果你宁愿牺牲性能来换取例如更好的线程运行控制和更低的上下文切换成本。

现在我们明白了 Rust 中的线程是如何定义的，让我们开始探索如何使用标准库提供的线程相关的 API 吧。

### 使用 `spawn` 创建新线程

为了创建一个新线程，需要调用 `thread::spawn` 函数并传递一个闭包（第十三章学习了闭包），其包含希望在新线程运行的代码。示例 16-1 中的例子在主线程打印了一些文本而另一些文本则由新线程打印：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

<span class="caption">示例 16-1: 创建一个打印某些内容的新线程，但是主线程打印其它内容</span>

注意这个函数编写的方式，当主线程结束时，新线程也会结束，而不管其是否执行完毕。这个程序的输出可能每次都略有不同，不过它大体上看起来像这样：

```text
hi number 1 from the main thread!
hi number 1 from the spawned thread!
hi number 2 from the main thread!
hi number 2 from the spawned thread!
hi number 3 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the main thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
```

`thread::sleep` 调用强制线程停止执行一小段时间，这会允许其他不同的线程运行。这些线程可能会轮流运行，不过并不保证如此：这依赖操作系统如何调度线程。在这里，主线程首先打印，即便新创建线程的打印语句位于程序的开头。甚至即便我们告诉新建的线程打印直到 `i` 等于 9 ，它在主线程结束之前也只打印到了 5。

如果你只看到了主线程的输出，或没有出现重叠打印的现象，尝试增加 range 的数值来增加操作系统切换线程的机会。

#### 使用 `join` 等待所有线程结束

由于主线程结束，示例 16-1 中的代码大部分时候不光会提早结束新建线程，甚至不能实际保证新建线程会被执行。其原因在于无法保证线程运行的顺序！

可以通过将 `thread::spawn` 的返回值储存在变量中来修复新建线程部分没有执行或者完全没有执行的问题。`thread::spawn` 的返回值类型是 `JoinHandle`。`JoinHandle` 是一个拥有所有权的值，当对其调用 `join` 方法时，它会等待其线程结束。示例 16-2 展示了如何使用示例 16-1 这个中创建的线程的 `JoinHandle` 并调用 `join` 来确保新建线程在 `main` 退出前结束运行：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap();
}
```

<span class="caption">示例 16-2: 从 `thread::spawn` 保存一个 `JoinHandle` 以确保该线程能够运行至结束</span>

通过调用 handle  的 `join` 会阻塞当前线程直到 handle 所代表的线程结束。**阻塞**（*Blocking*） 线程意味着阻止该线程执行工作或退出。因为我们将 `join` 调用放在了主线程的 `for` 循环之后，运行示例 16-2 应该会产生类似这样的输出：

```text
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 1 from the spawned thread!
hi number 3 from the main thread!
hi number 2 from the spawned thread!
hi number 4 from the main thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
```

这两个线程仍然会交替执行，不过主线程会由于 `handle.join()` 调用会等待直到新建线程执行完毕。

不过让我们看看将 `handle.join()` 移动到 `main` 中 `for` 循环之前会发生什么，如下：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    handle.join().unwrap();

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

主线程会等待直到新建线程执行完毕之后才开始执行 `for` 循环，所以输出将不会交替出现，如下所示：

```text
hi number 1 from the spawned thread!
hi number 2 from the spawned thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 3 from the main thread!
hi number 4 from the main thread!
```

稍微考虑一下将 `join` 放置于何处这样一个细节会影响线程是否同时运行。

### 线程与 `move` 闭包

`move` 闭包，我们曾在第十三章简要的提到过，其经常与 `thread::spawn` 一起使用，因为它允许我们在一个线程中使用另一个线程的数据。

第十三章讲到 “如果我们希望强制闭包获取其使用的环境值的所有权，可以在参数列表前使用 `move` 关键字。这个技巧在将闭包传递给新线程以便将数据移动到新线程中时最为实用。”

现在我们正在创建新线程，所以让我们讨论一下在闭包中获取环境值吧。

注意示例 16-1 中传递给 `thread::spawn` 的闭包并没有任何参数：并没有在新建线程代码中使用任何主线程的数据。为了在新建线程中使用来自于主线程的数据，需要新建线程的闭包获取它需要的值。示例 16-3 展示了一个尝试在主线程中创建一个 vector 并用于新建线程的例子，不过这么写还不能工作，如下所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    handle.join().unwrap();
}
```

<span class="caption">示例 16-3: 尝试在另一个线程使用主线程创建的 vector</span>

闭包使用了 `v`，所以闭包会捕获 `v` 并使其成为闭包环境的一部分。因为 `thread::spawn` 在一个新线程中运行这个闭包，所以可以在新线程中访问 `v`。然而当编译这个例子时，会得到如下错误：

```text
error[E0373]: closure may outlive the current function, but it borrows `v`,
which is owned by the current function
 --> src/main.rs:6:32
  |
6 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value `v`
7 |         println!("Here's a vector: {:?}", v);
  |                                           - `v` is borrowed here
  |
help: to force the closure to take ownership of `v` (and any other referenced
variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ^^^^^^^
```

Rust 会 **推断** 如何捕获 `v`，因为 `println!` 只需要 `v` 的引用，闭包尝试借用 `v`。然而这有一个问题：Rust 不知道这个新建线程会执行多久，所以无法知晓 `v` 的引用是否一直有效。

示例 16-4 展示了一个 `v` 的引用很有可能不再有效的场景：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    drop(v); // oh no!

    handle.join().unwrap();
}
```

<span class="caption">示例 16-4: 一个具有闭包的线程，尝试使用一个在主线程中被回收的引用 `v`</span>

这段代码可以运行，而新建线程则可能会立刻被转移到后台并完全没有机会运行。新建线程内部有一个 `v` 的引用，不过主线程立刻就使用第十五章讨论的 `drop` 丢弃了 `v`。接着当新建线程开始执行，`v` 已不再有效，所以其引用也是无效的。噢，这太糟了！


为了修复示例 16-3 的编译错误，我们可以听取错误信息的建议：

```text
help: to force the closure to take ownership of `v` (and any other referenced
variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ^^^^^^^
```

通过在闭包之前增加 `move` 关键字，我们强制闭包获取其使用的值的所有权，而不是任由 Rust 推断它应该借用值。示例 16-5 中展示的对示例 16-3 代码的修改，这可以按照我们的预期编译并运行：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    handle.join().unwrap();
}
```

<span class="caption">示例 16-5: 使用 `move` 关键字强制获取它使用的值的所有权</span>

那么如何使用了 `move` 闭包，示例 16-4 中主线程调用了 `drop` 的代码会发生什么呢？不幸的是，我们会因为示例 16-4 尝试进行由于不同的原因所不允许的操作而得到不同的错误。如果为闭包增加 `move`，将会把 `v` 移动进闭包的环境中，如此将不能在主线程中对其调用 `drop` 了。我们会得到如下不同的编译错误：

```text
error[E0382]: use of moved value: `v`
  --> src/main.rs:10:10
   |
6  |     let handle = thread::spawn(move || {
   |                                ------- value moved (into closure) here
...
10 |     drop(v); // oh no!
   |          ^ value used here after move
   |
   = note: move occurs because `v` has type `std::vec::Vec<i32>`, which does
   not implement the `Copy` trait
```

Rust 的所有权规则又一次帮助了我们！示例 16-3 中的错误是因为 Rust 是保守的并只会为线程借用 `v`，这意味着主线程理论上可能使新建线程的引用无效。通过告诉 Rust 将 `v` 的所有权移动到新建线程，我们向 Rust 保证主线程不会再使用 `v`。如果对示例 16-4 也做出如此修改，那么当在主线程中使用 `v` 时就会违反所有权规则。 `move` 关键字覆盖了 Rust 默认保守的借用：其也不允许我们违反所有权规则。

现在我们有一个线程和线程 API 的基本了解，让我们讨论一下使用线程实际可以 **做** 什么吧。
