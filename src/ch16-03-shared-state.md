## 共享状态并发

> [ch16-03-shared-state.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-03-shared-state.md)
> <br>
> commit 9df612e93e038b05fc959db393c15a5402033f47

虽然消息传递是一个很好的处理并发的方式，但并不是唯一的一个。再次考虑一下它的口号：

> Do not communicate by sharing memory; instead, share memory by
> communicating.
>
> 不要共享内存来通讯；而是要通讯来共享内存。

那么“共享内存来通讯”看起来是怎样的呢？共享内存并发有点像多所有权：多个线程可以同时访问相同的内存位置。正如第十五章中智能指针使得多所有权成为可能时我们所看到的，这会增加额外的复杂性，因为需要以某种方式管理这些不同的所有者。

但是 Rust 的类型系统和所有权可以很好的帮助我们正确的进行管理。例如，让我们看看一个共享内存中更常见的并发原语：互斥器（mutexes）。

### 互斥器一次只允许一个线程访问数据

**互斥器**（*mutex*）是一个用于共享内存的并发原语。它是“mutual exclusion”的缩写，也就是说，任何给定时间它只允许一个线程访问某些数据。互斥器以难以使用著称，因为你不得不记住：

1. 必须记住在使用数据之前尝试获取锁。
2. 一旦处理完被互斥器所保护的数据之后，必须记得解锁数据这样其他线程才能够获取锁。

对于一个现实中的互斥器的例子，想象一下在一个会议中的专门小组讨论会上，不过只有一个麦克风。在一个小组成员可能发言之前，他们必须请求或示意他们需要使用麦克风。一旦得到了麦克风，他们可以发言任意长的时间，接着将麦克风交给下一个希望讲话的小组成员。如果小组成员在没有麦克风的时候就开始叫喊或者在其他成员发言结束之前就取得麦克风将是很无理的。如果对这个共享的麦克风的管理因为任何这些原因而出现问题，讨论会将无法如期进行。

正确的管理互斥器是异常复杂的，这也就是为什么这么多人都热衷于通道。然而，在 Rust 中，得益于类型系统和所有权，我们不可能会在锁和解锁上出错。

### `Mutex<T>`的 API

让我们看看列表 16-12 中使用互斥器的例子，现在并不涉及到多线程：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::sync::Mutex;

fn main() {
    let m = Mutex::new(5);

    {
        let mut num = m.lock().unwrap();
        *num = 6;
    }

    println!("m = {:?}", m);
}
```

<span class="caption">Listing 16-12: Exploring the API of `Mutex<T>` in a
single threaded context for simplicity</span>

与很多类型一样，我们通过叫做`new`的关联函数来创建一个`Mutex<T>`。为了访问互斥器中的数据，使用`lock`方法来获取锁。这个调用会阻塞到直到轮到我们拥有锁为止。如果另一个线程拥有锁接着那个线程 panic 了则这个调用会失败。类似于上一部分列表 16-6 那样，我们暂时使用`unwrap()`，至于更好的错误处理，请查看第九章中提供的更好的工具。

一旦获取了锁，就可以将返回值（在这里是`num`）作为一个数据的可变引用使用了。类型系统是 Rust 如何保证使用值之前必须获取锁的：`Mutex<i32>`并不是一个`i32`，所以**必须**获取锁才能使用这个`i32`值。我们是不会忘记这么做的；因为类型系统是不会允许的。

与你可能怀疑的一样，`Mutex<T>`是一个智能指针。好吧，更准确的说，`lock`调用返回一个叫做`MutexGuard`的智能指针。类似我们在第十五章见过的智能指针，它实现了`Deref`来指向其内部数据。另外`MutexGuard`有一个用来释放锁的`Drop`实现。这样就不会忘记释放锁了。这在`MutexGuard`离开作用域时会自动发生，例如它发生于列表 16-12 中内部作用域的结尾。接着可以打印出互斥器的值并发现能够将其内部的`i32`改为 6。

#### 在线程间共享`Mutex<T>`

现在让我们尝试使用`Mutex<T>`在多个线程间共享值。我们将启动十个线程，并在每一个线程中对一个计数器值加一，这样计数器将从 0 变为 10。注意接下来的几个例子会有编译错误，而我们将利用这些错误来学习如何使用
`Mutex<T>`以及 Rust 又是怎样帮助我们正确使用它的。列表 16-13 是最开始的例子：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let handle = thread::spawn(|| {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

<span class="caption">Listing 16-13: The start of a program having 10 threads
each increment a counter guarded by a `Mutex<T>`</span>

这里创建了一个`counter`变量来存放内含`i32`的`Mutex<T>`，类似列表 16-12 那样。接下来使用 range 创建了 10 个线程。这里使用了`thread::spawn`并对所有线程使用了相同的闭包：他们每一个都将调用`lock`方法来获取`Mutex<T>`上的锁并对接着互斥器中的值加一。当一个线程结束执行其闭包，`num`会离开作用域并释放锁这样另一个线程就可以获取它了。

在主线程中，我们像列表 16-2 那样收集了所有的 join 句柄，并接着每一个的`join`方法来确保所有线程都会结束。那时，主线程会获取锁并打印出程序的结果。

之前提示过这个例子不能编译，让我们看看为什么！

```
error[E0373]: closure may outlive the current function, but it borrows
`counter`, which is owned by the current function
  -->
   |
9  |         let handle = thread::spawn(|| {
   |                                    ^^ may outlive borrowed value `counter`
10 |             let mut num = counter.lock().unwrap();
   |                           ------- `counter` is borrowed here
   |
help: to force the closure to take ownership of `counter` (and any other
referenced variables), use the `move` keyword, as shown:
   |         let handle = thread::spawn(move || {
```

这类似于列表 16-5 中解决了的问题。考虑到启动了多个线程，Rust 无法知道这些线程会运行多久而`counter`是否在每一个线程尝试借用它时仍然保持有效。帮助信息提醒了我们如何解决它：可以使用`move`来给予每个线程其所有权。试试将这个修改用到闭包上：

```rust,ignore
thread::spawn(move || {
```

再次尝试编译。这会出现了一个不同的错误！

```
error[E0382]: capture of moved value: `counter`
  -->
   |
9  |         let handle = thread::spawn(move || {
   |                                    ------- value moved (into closure) here
10 |             let mut num = counter.lock().unwrap();
   |                           ^^^^^^^ value captured here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error[E0382]: use of moved value: `counter`
  -->
   |
9  |         let handle = thread::spawn(move || {
   |                                    ------- value moved (into closure) here
...
21 |     println!("Result: {}", *counter.lock().unwrap());
   |                             ^^^^^^^ value used here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error: aborting due to 2 previous errors
```

`move`并没有像列表 16-5 中那样解决这个程序中的问题。为什么没有呢？这个错误信息有些难以理解，因为它表明`counter`被移动进了闭包，接着它在调用`lock`时被捕获。这听起来像是我们希望的，不过这是不允许的。

让我们推理一下。现在不再使用`for`循环创建 10 个线程，让我们不用循环而只创建两个线程来看看会发生什么。将列表 16-13 中第一个`for`循环替换为如下代码：

```rust,ignore
let handle = thread::spawn(move || {
    let mut num = counter.lock().unwrap();

    *num += 1;
});
handles.push(handle);

let handle2 = thread::spawn(move || {
    let mut num2 = counter.lock().unwrap();

    *num2 += 1;
});
handles.push(handle2);
```

这里创建了两个线程，并将用于第二个线程的变量名改为`handle2`和`num2`。现在我们简化了例子来看看是否能够理解错误信息。这一次编译给出如下信息：

```text
error[E0382]: capture of moved value: `counter`
  -->
   |
8  |     let handle = thread::spawn(move || {
   |                                ------- value moved (into closure) here
...
16 |         let mut num2 = counter.lock().unwrap();
   |                        ^^^^^^^ value captured here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error[E0382]: use of moved value: `counter`
  -->
   |
8  |     let handle = thread::spawn(move || {
   |                                ------- value moved (into closure) here
...
26 |     println!("Result: {}", *counter.lock().unwrap());
   |                             ^^^^^^^ value used here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error: aborting due to 2 previous errors
```

啊哈！在第一个错误信息中，Rust 表明了`counter`被移动进了`handle`所代表线程的闭包中。这个移动阻止我们在第二个线程中对其调用`lock`并将结果储存在`num2`中时捕获`counter`！所以 Rust 告诉我们不能将`counter`的所有权移动到多个线程中。这在之前很难看出是因为我们在循环中创建多个线程，而 Rust 无法在循环的迭代中指明不同的线程（没有临时变量`num2`）。

#### 多线程和多所有权

在第十五章中，我们可以通过使用智能指针`Rc<T>`来创建引用计数的值来拥有多所有权。同时第十五章提到了`Rc<T>`只能用于单线程上下文，不过还是让我们在这里试用`Rc<T>`来观察会发生什么。列表 16-14 将`Mutex<T>`封装进了`Rc<T>`中，并在移动到线程中之前克隆了`Rc<T>`。切换回循环来创建线程，并保留闭包中的`move`关键字：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Rc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
    	let counter = counter.clone();
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

<span class="caption">Listing 16-14: Attempting to use `Rc<T>` to allow
multiple threads to own the `Mutex<T>`</span>

又一次，编译并...出现了不同的错误！编译器真是教会了我们很多东西！

```
error[E0277]: the trait bound `std::rc::Rc<std::sync::Mutex<i32>>:
std::marker::Send` is not satisfied
  -->
   |
11 |         let handle = thread::spawn(move || {
   |                      ^^^^^^^^^^^^^ the trait `std::marker::Send` is not
   implemented for `std::rc::Rc<std::sync::Mutex<i32>>`
   |
   = note: `std::rc::Rc<std::sync::Mutex<i32>>` cannot be sent between threads
   safely
   = note: required because it appears within the type
   `[closure@src/main.rs:11:36: 15:10
   counter:std::rc::Rc<std::sync::Mutex<i32>>]`
   = note: required by `std::thread::spawn`
```

哇哦，太长不看！需要指出一些重要的部分：第一个提示表明`Rc<Mutex<i32>>`不能安全的在线程间传递。理由也在错误信息中，经过提取之后，表明“不满足`Send` trait bound”（`the trait bound Send is not satisfied`）。下一部分将会讨论`Send`，它是许多确保用在多线程中的类型能够适合并发环境的 trait 之一。

不幸的是，`Rc<T>`并不能安全的在线程间共享。当`Rc<T>`管理引用计数时，它必须在每一个`clone`调用时增加计数并在每一个克隆被丢弃时减少计数。`Rc<T>`并没有使用任何并发原语来确保改变计数的操作不会被其他线程打断。在计数出错时可能会导致诡异的 bug，比如可能会造成内存泄漏或在使用结束之前就丢弃一个值。那么如果有一个正好与`Rc<T>`类似，不过以一种线程安全的方式改变引用计数的类型会怎么样呢？

#### 原子引用计数`Arc<T>`

如果你思考过像之前那样的问题的话，你就是正确的。确实有一个类似`Rc<T>`并可以安全的用于并发环境的类型：`Arc<T>`。字母“a”代表**原子性**（*atomic*），所以这是一个**原子引用计数**（*atomically reference counted*）类型。原子性是另一类这里还未涉及到的并发原语；请查看标准库中`std::sync::atomic`的文档来获取更多细节。其中的要点就是：原子性类型工作起来类似原始类型，不过可以安全的在线程间共享。

那为什么不是所有的原始类型都是原子性的呢，然后为什么不是所有标准库中的类型都默认使用`Arc<T>`实现呢？线程安全伴随一些性能惩罚，我们只希望在需要时才为此付出代价。如果只是在单线程中对值进行操作，因为并不需要原子性提供的保证，所以代码可以运行的更快。

回到之前的例子：`Arc<T>`和`Rc<T>`除了`Arc<T>`内部的原子性之外他们是等价的。其 API 也是一样的，所以可以修改`use`行和`new`调用。列表 16-15 中的代码最终可以编译和运行：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::sync::{Mutex, Arc};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
    	let counter = counter.clone();
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

<span class="caption">Listing 16-15: Using an `Arc<T>` to wrap the `Mutex<T>`
to be able to share ownership across multiple threads</span>

这会打印出：

```
Result: 10
```

成功了！我们从 0 数到了 10，这可能并不是很显眼，不过一路上我们学习了很多关于`Mutex<T>`和线程安全的内容！这个例子中构建的结构可以用于比增加计数更为复杂的操作。能够被分解为独立部分的计算可以像这样被分散到多个线程中，并可以使用`Mutex<T>`来允许每个线程在他们自己的部分更新最终的结果。

你可能注意到了，因为`counter`是不可变的，不过可以获取其内部值的可变引用，这意味着`Mutex<T>`提供了内部可变性，就像`Cell`系列类型那样。正如第十五章中使用`RefCell<T>`可以改变`Rc<T>`中的内容那样，同样的可以使用`Mutex<T>`来改变`Arc<T>`中的内容。

回忆一下`Rc<T>`并没有避免所有可能的问题：我们也讨论了当两个`Rc<T>`相互引用时的引用循环的可能性，这可能造成内存泄露。`Mutex<T>`有一个类似的 Rust 同样也不能避免的问题：死锁。**死锁**（*deadlock*）是一个场景中操作需要锁定两个资源，而两个线程分别拥有一个锁并永远相互等待的问题。如果你对这个主题感兴趣，尝试编写一个带有死锁的 Rust 程序，接着研究任何其他语言中使用互斥器的死锁规避策略并尝试在 Rust 中实现他们。标准库中`Mutex<T>`和`MutexGuard`的 API 文档会提供有用的信息。

Rust 的类型系统和所有权（规则）确保了线程在更新共享值时拥有独占的访问权限，所以线程不会以一种不可预测的方式覆盖彼此的操作。虽然为了使一切正确运行而在编译器上花了一些时间，但是我们节省了未来可能需要重现只在线程以特定顺序执行时才会出现的诡异错误场景的时间。

接下来，为了丰富本章的内容，让我们讨论一下`Send`和`Sync` trait 以及如何对自定义类型使用他们。