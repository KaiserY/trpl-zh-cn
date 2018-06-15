## 创建线程池并储存线程

> [ch20-04-storing-threads.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-04-storing-threads.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

之前的警告是因为在 `new` 和 `execute` 中没有对参数做任何操作。让我们用期望的实际行为实现他们。

### 验证池中的线程数

以考虑 `new` 作为开始。之前提到使用无符号类型作为 `size` 参数的类型，因为为负的线程数没有意义。然而，零个线程同样没有意义，不过零是一个完全有效的 `u32` 值。让我们在返回 `ThreadPool` 之前检查 `size`  是否大于零，并使用 `assert!` 宏在得到零时 panic，如列表 20-13 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct ThreadPool;
impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
    pub fn new(size: u32) -> ThreadPool {
        assert!(size > 0);

        ThreadPool
    }

    // ...snip...
}
```

<span class="caption">列表 20-13：实现 `ThreadPool::new` 在 `size` 为零时 panic</span>

趁着这个机会我们用文档注释为 `ThreadPool` 增加了一些文档。注意这里遵循了良好的文档实践并增加了一个部分提示函数会 panic 的情况，正如第十四章所讨论的。尝试运行 `cargo doc --open` 并点击 `ThreadPool` 结构体来查看生成的 `new` 的文档看起来如何！

相比像这里使用 `assert!` 宏，也可以让 `new` 像之前 I/O 项目中列表 12-9 中 `Config::new` 那样返回一个 `Result`，不过在这里我们选择创建一个没有任何线程的线程池应该是要给不可恢复的错误。如果你想做的更好，尝试编写一个采用如下签名的 `new` 版本来感受一下两者的区别：

```rust
fn new(size: u32) -> Result<ThreadPool, PoolCreationError> {
```

### 在线程池中储存线程

现在有了一个有效的线程池线程数，就可以实际创建这些线程并在返回之前将他们储存在 `ThreadPool` 结构体中。

这引出了另一个问题：如何“储存”一个线程？让我们再看看 `thread::spawn` 的签名：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T + Send + 'static,
        T: Send + 'static
```

`spawn` 返回 `JoinHandle<T>`，其中 `T` 是闭包返回的类型。尝试使用 `JoinHandle` 来看看会发生什么。在我们的情况中，传递给线程池的闭包会处理连接并不返回任何值，所以 `T` 将会是单元类型 `()`。

这还不能编译，不过考虑一下列表 20-14 所示的代码。我们改变了 `ThreadPool` 的定义来存放一个 `thread::JoinHandle<()>` 的 vector 实例，使用 `size` 容量来初始化，并设置一个 `for` 循环了来运行创建线程的代码，并返回包含这些线程的 `ThreadPool` 实例：


<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
use std::thread;

pub struct ThreadPool {
    threads: Vec<thread::JoinHandle<()>>,
}

impl ThreadPool {
    // ...snip...
    pub fn new(size: u32) -> ThreadPool {
        assert!(size > 0);

        let mut threads = Vec::with_capacity(size);

        for _ in 0..size {
            // create some threads and store them in the vector
        }

        ThreadPool {
            threads
        }
    }

    // ...snip...
}
```

<span class="caption">列表 20-14：为 `ThreadPool` 创建一个 vector 来存放线程</span>

这里将 `std::thread` 引入库 crate 的作用域，因为使用了 `thread::JoinHandle` 作为 `ThreadPool` 中 vector 元素的类型。

在得到了有效的数量之后，就可以新建一个存放 `size` 个元素的 vector。本书还未使用过 `with_capacity`；它与 `Vec::new` 做了同样的工作，不过有一个重要的区别：它为 vector 预先分配空间。因为已经知道了 vector 中需要 `size` 个元素，预先进行分配比仅仅 `Vec::new` 要稍微有效率一些，因为 `Vec::new` 随着插入元素而重新改变大小。因为一开始就用所需的确定大小来创建 vector，为其增减元素时不会改变底层 vector 的大小。

如果代码能够工作就应是如此效果，不过他们还不能工作！如果检查他们，会得到一个错误：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0308]: mismatched types
  --> src\main.rs:70:46
   |
70 |         let mut threads = Vec::with_capacity(size);
   |                                              ^^^^ expected usize, found u32

error: aborting due to previous error
```

`size` 是 `u32`，不过 `Vec::with_capacity` 需要一个 `usize`。这里有两个选择：可以改变函数签名，或者可以将 `u32` 转换为 `usize`。如果你还记得定义 `new` 时，并没有仔细考虑有意义的数值类型，只是随便选了一个。现在来进行一些思考吧。考虑到 `size` 是 vector 的长度，`usize` 就很有道理了。甚至他们的名字都很类似！改变 `new` 的签名，这会使列表 20-14 的代码能够编译：

```rust
fn new(size: usize) -> ThreadPool {
```

如果再次运行 `cargo check`，会得到一些警告，不过应该能成功编译。

列表 20-14 的 `for` 循环中留下了一个关于创建线程的注释。如何实际创建线程呢？这是一个难题。这些线程应该做什么呢？这里并不知道他们需要做什么，因为 `execute` 方法获取闭包并传递给了线程池。

让我们稍微重构一下：不再储存一个 `JoinHandle<()>` 实例的 vector，将创建一下新的结构体来代表 *worker* 的概念。worker 会接收 `execute` 方法，并会处理实际的闭包调用。另外储存固定 `size` 数量的还不知道将要执行什么闭包的 `Worker` 实例，也可以为每一个 worker 设置一个 `id`，这样就可以在日志和调试中区别线程池中的不同 worker。

让我们做出如下修改：

1. 定义 `Worker` 结构体存放 `id` 和 `JoinHandle<()>`
2. 修改 `ThreadPool` 存放一个 `Worker` 实例的 vector
3. 定义 `Worker::new` 函数，它获取一个 `id` 数字并返回一个带有 `id` 和用空闭包分配的线程的 `Worker` 实例，之后会修复这些
4. 在 `ThreadPool::new` 中，使用 `for` 循环来计数生成 `id`，使用这个 `id` 新建 `Worker`，并储存进 vector 中

如果你渴望挑战，在查看列表 20-15 中的代码之前尝试自己实现这些修改。

准备好了吗？列表 20-15 就是一个做出了这些修改的例子：

<span class="filename">文件名: src/lib.rs</span>

```rust
use std::thread;

pub struct ThreadPool {
    workers: Vec<Worker>,
}

impl ThreadPool {
    // ...snip...
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool {
            workers
        }
    }
    // ...snip...
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize) -> Worker {
        let thread = thread::spawn(|| {});

        Worker {
            id,
            thread,
        }
    }
}
```

<span class="caption">列表 20-15：修改 `ThreadPool` 存放 `Worker` 实例而不是直接存放线程</span>

这里选择将 `ThreadPool` 中字段名从 `threads` 改为 `workers`，因为我们改变了存放内容为 `Worker` 而不是 `JoinHandle<()>`。使用 `for` 循环中的计数作为 `Worker::new` 的参数，并将每一个新建的 `Worker` 储存在叫做 `workers` 的 vector 中。

`Worker` 结构体和其 `new` 函数是私有的，因为外部代码（比如 *src/bin/main.rs* 中的 server）并不需要 `ThreadPool` 中使用 `Worker` 结构体的实现细节。`Worker::new` 函数使用 `id` 参数并储存了使用一个空闭包创建的 `JoinHandle<()>`。

这段代码能够编译并用指定给 `ThreadPool::new` 的参数创建储存了一系列的 `Worker` 实例，不过**仍然**没有处理 `execute` 中得到的闭包。让我们聊聊接下来怎么做。