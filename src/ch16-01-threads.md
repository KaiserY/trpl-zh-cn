## 使用线程同时运行代码

> [ch16-01-threads.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-01-threads.md)
> <br>
> commit 55b294f20fc846a13a9be623bf322d8b364cee77

在今天使用的大部分操作系统中，当程序执行时，操作系统运行代码的上下文称为**进程**（*process*）。操作系统可以运行很多进程，而操作系统也管理这些进程使得多个程序可以在电脑上同时运行。

我们可以将每个进程运行一个程序的概念再往下抽象一层：程序也可以在其上下文中同时运行独立的部分。这个功能叫做**线程**（*thread*）。

将程序需要执行的计算拆分到多个线程中可以提高性能，因为程序可以在同时进行很多工作。不过使用线程会增加程序复杂性。因为线程是同时运行的，所以无法预先保证不同线程中的代码的执行顺序。这可能会由于线程以不一致的顺序访问数据或资源而导致竞争状态，或由于两个线程相互阻止对方继续运行而造成死锁，以及仅仅出现于特定场景并难以稳定重现的 bug。Rust 减少了这些或那些使用线程的负面影响，不过在多线程上下文中编程，相比只期望在单个线程中运行的程序，仍然要采用不同的思考方式和代码结构。

编程语言有一些不同的方法来实现线程。很多操作系统提供了创建新线程的 API。另外，很多编程语言提供了自己的特殊的线程实现。编程语言提供的线程有时被称作**轻量级**（*lightweight*）或**绿色**（*green*）线程。这些语言将一系列绿色线程放入不同数量的操作系统线程中执行。因为这个原因，语言调用操作系统 API 创建线程的模型有时被称为 *1:1*，一个 OS 线程对应一个语言线程。绿色线程模型被称为 *M:N* 模型，`M`个绿色线程对应`N`个 OS 线程，这里`M`和`N`不必相同。

每一个模型都有其自己的优势和取舍。对于 Rust 来说最重要的取舍是运行时支持。**运行时**是一个令人迷惑的概念；在不同上下文中它可能有不同的含义。这里其代表二进制文件中包含的语言自身的代码。对于一些语言，这些代码是庞大的，另一些则很小。通俗的说，“没有运行时”通常被人们用来指代“小运行时”，因为任何非汇编语言都存在一定数量的运行时。更小的运行时拥有更少的功能不过其优势在于更小的二进制输出。更小的二进制文件更容易在更多上下文中与其他语言结合。虽然很多语言觉得增加运行时来换取更多功能没有什么问题，但是 Rust 需要做到几乎没有运行时，同时为了保持高性能必需能够调用 C 语言，这点也是不能妥协的。

绿色线程模型功能要求更大的运行时来管理这些线程。为此，Rust 标准库只提供了 1:1 线程模型实现。因为 Rust 是这么一个底层语言，所以有相应的 crate 实现了 M:N 线程模型，如果你宁愿牺牲性能来换取例如更好的线程运行控制和更低的上下文切换成本。

现在我们明白了 Rust 中的线程是如何定义的，让我们开始探索如何使用标准库提供的线程相关的 API吧。

### 使用`spawn`创建新线程

为了创建一个新线程，调用`thread::spawn`函数并传递一个闭包（第十三章学习了闭包），它包含希望在新线程运行的代码。示例 16-1 中的例子在新线程中打印了一些文本而其余的文本在主线程中打印：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
    }
}
```

<span class="caption">示例 16-1: 创建一个打印某些内容的新线程，但是主线程打印其它内容</span>


注意这个函数编写的方式，当主线程结束时，它也会停止新线程。这个程序的输出每次可能都略微不同，不过它大体上看起来像这样：

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

这些线程可能会轮流运行，不过并不保证如此。在这里，主线程先行打印，即便新创建线程的打印语句位于程序的开头。甚至即便我们告诉新建的线程打印直到`i`等于 9 ，它在主线程结束之前也只打印到了 5。如果你只看到了一个线程，或没有出现重叠打印的现象，尝试增加 range 的数值来增加线程暂停并切换到其他线程运行的机会。

#### 使用`join`等待所有线程结束

由于主线程先于新建线程结束，不仅示例 16-1 中的代码大部分时候不能保证新建线程执行完毕，甚至不能实际保证新建线程会被执行！可以通过保存`thread::spawn`的返回值来解决这个问题，这是一个`JoinHandle`。这看起来如示例 16-2 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
    }

    handle.join();
}
```

<span class="caption">示例 16-2: 从 `thread::spawn` 保存一个 `JoinHandle`， 
以确保该线程能够运行至结束</span>

`JoinHandle`是一个拥有所有权的值，它可以等待一个线程结束，这也正是`join`方法所做的。通过调用这个句柄的`join`，当前线程会阻塞直到句柄所代表的线程结束。因为我们将`join`调用放在了主线程的`for`循环之后，运行这个例子将产生类似这样的输出：

```
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

这两个线程仍然会交替执行，不过主线程会由于`handle.join()`调用会等待直到新建线程执行完毕。

如果将`handle.join()`放在主线程的`for`循环之前，像这样：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
        }
    });

    handle.join();

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
    }
}
```

主线程会等待直到新建线程执行完毕之后才开始执行`for`循环，所以输出将不会交替出现：

```
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

稍微考虑一下将`join`放置于何处会影响线程是否同时运行。

### 线程和`move`闭包

第十三章有一个我们没有讲到的闭包功能，它经常用于`thread::spawn`：`move`闭包。第十三章中讲到：

> 获取他们环境中值的闭包主要用于开始新线程的场景

现在我们正在创建新线程，所以让我们讨论一下获取环境值的闭包吧！

注意示例 16-1 中传递给`thread::spawn`的闭包并没有任何参数：并没有在新建线程代码中使用任何主线程的数据。为了在新建线程中使用来自于主线程的数据，需要新建线程的闭包获取它需要的值。示例 16-3 展示了一个尝试在主线程中创建一个 vector 并用于新建线程的例子，不过这么写还不能工作：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    handle.join();
}
```

<span class="caption">示例 16-3: 在主线程中创建一个 vector，尝试在其它线程中使用它</span>

闭包使用了`v`，所以闭包会获取`v`并使其成为闭包环境的一部分。因为`thread::spawn`在一个新线程中运行这个闭包，所以可以在新线程中访问`v`。

然而当编译这个例子时，会得到如下错误：

```
error[E0373]: closure may outlive the current function, but it borrows `v`,
which is owned by the current function
 -->
  |
6 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value `v`
7 |         println!("Here's a vector: {:?}", v);
  |                                           - `v` is borrowed here
  |
help: to force the closure to take ownership of `v` (and any other referenced
variables), use the `move` keyword, as shown:
  |     let handle = thread::spawn(move || {
```

当在闭包环境中获取某些值时，Rust 会尝试推断如何获取它。`println!`只需要`v`的一个引用，所以闭包尝试借用`v`。但是这有一个问题：我们并不知道新建线程会运行多久，所以无法知道`v`是否一直时有效的。

考虑一下示例 16-4 中的代码，它展示了一个`v`的引用很有可能不再有效的场景：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    drop(v); // oh no!

    handle.join();
}
```

<span class="caption">示例 16-4: 一个具有闭包的线程，尝试使用一个在主线程中被回收的引用 `v`</span>

这些代码可以运行，而新建线程则可能直接就出错了并完全没有机会运行。新建线程内部有一个`v`的引用，不过主线程仍在执行：它立刻丢弃了`v`，使用了第十五章提到的显式丢弃其参数的`drop`函数。接着，新建线程开始执行，现在`v`是无效的了，所以它的引用也就是无效的。噢，这太糟了！

为了修复这个问题，我们可以听取错误信息的建议：

```
help: to force the closure to take ownership of `v` (and any other referenced
variables), use the `move` keyword, as shown:
  |     let handle = thread::spawn(move || {
```

通过在闭包之前增加`move`关键字，我们强制闭包获取它使用的值的所有权，而不是引用借用。示例 16-5 中展示的对示例 16-3 代码的修改可以按照我们的预期编译并运行：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    handle.join();
}
```

<span class="caption">示例 16-5: 使用 `move` 关键字强制获取它使用的值的所有权</span>

那么示例 16-4 中那个主线程调用了`drop`的代码该怎么办呢？如果在闭包上增加了`move`，就将`v`移动到了闭包的环境中，我们将不能对其调用`drop`了。相反会出现这个编译时错误：

```
error[E0382]: use of moved value: `v`
  -->
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

Rust 的所有权规则又一次帮助了我们！

现在我们有一个线程和线程 API 的基本了解，让我们讨论一下使用线程实际可以**做**什么吧。
