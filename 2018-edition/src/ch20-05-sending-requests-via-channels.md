## 使用通道向线程发送请求

> [ch20-05-sending-requests-via-channels.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-05-sending-requests-via-channels.md)
> <br>
> commit 2e269ff82193fd65df8a87c06561d74b51ac02f7

下一个需要解决的问题是（线程中的）闭包完全没有做任何工作。我们一直在绕过获取 `execute` 方法中实际期望执行的闭包的问题，不过看起来在创建 `ThreadPool` 时就需要知道实际的闭包。

不过考虑一下真正需要做的：我们希望刚创建的 `Worker` 结构体能够从 `ThreadPool` 的队列中获取任务，并在线程中执行他们。

在第十六章中，我们学习了通道。通道是一个沟通两个线程的良好手段，对于这个例子来说则是绝佳的。通道将充当任务队列的作用，`execute` 将通过 `ThreadPool` 向其中线程正在寻找工作的 `Worker` 实例发送任务。如下是这个计划：

1. `ThreadPool` 会创建一个通道并充当发送端。
2. 每个 `Worker` 将会充当通道的接收端。
3. 新建一个 `Job` 结构体来存放用于向通道中发送的闭包。
4. `ThreadPool` 的 `execute` 方法会在发送端发出期望执行的任务。
5. 在线程中，`Worker` 会遍历通道的接收端并执行任何接收到的任务。

让我们以在 `ThreadPool::new` 中创建通道并让 `ThreadPool` 实例充当发送端开始，如列表 20-16 所示。`Job` 是将在通道中发出的类型；目前它是一个没有任何内容的结构体：

<span class="filename">文件名: src/lib.rs</span>

```rust
# use std::thread;
// ...snip...
use std::sync::mpsc;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

struct Job;

impl ThreadPool {
    // ...snip...
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id));
        }

        ThreadPool {
            workers,
            sender,
        }
    }
    // ...snip...
}
#
# struct Worker {
#     id: usize,
#     thread: thread::JoinHandle<()>,
# }
#
# impl Worker {
#     fn new(id: usize) -> Worker {
#         let thread = thread::spawn(|| {});
#
#         Worker {
#             id,
#             thread,
#         }
#     }
# }
```

<span class="caption">列表 20-16：修改 `ThreadPool` 来储存一个发送 `Job` 实例的通道发送端</span>

在 `ThreadPool::new` 中，新建了一个通道，并接着让线程池在接收端等待。这段代码能够编译，不过仍有警告。

在线程池创建每个 worker 时将通道的接收端传递给他们。须知我们希望在 worker 所分配的线程中使用通道的接收端，所以将在闭包中引用 `receiver` 参数。列表 20-17 中展示的代码还不能编译：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
impl ThreadPool {
    // ...snip...
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, receiver));
        }

        ThreadPool {
            workers,
            sender,
        }
    }
    // ...snip...
}

// ...snip...

impl Worker {
    fn new(id: usize, receiver: mpsc::Receiver<Job>) -> Worker {
        let thread = thread::spawn(|| {
            receiver;
        });

        Worker {
            id,
            thread,
        }
    }
}
```

<span class="caption">列表 20-17：将通道的接收端传递给 worker</span>

这是一些小而直观的修改：将通道的接收端传递进了 `Worker::new`，并接着在闭包中使用他们。

如果尝试检查代码，会得到这个错误：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0382]: use of moved value: `receiver`
  --> src/lib.rs:27:42
   |
27 |             workers.push(Worker::new(id, receiver));
   |                                          ^^^^^^^^ value moved here in
   previous iteration of loop
   |
   = note: move occurs because `receiver` has type
   `std::sync::mpsc::Receiver<Job>`, which does not implement the `Copy` trait
```

这些代码还不能编译的原因如上因为它尝试将 `receiver` 传递给多个 `Worker` 实例。回忆第十六章，Rust 所提供的通道实现是多**生产者**，单**消费者**的，所以不能简单的克隆通道的消费端来解决问题。即便可以我们也不希望克隆消费端；在所有的 worker 中共享单一 `receiver` 才是我们希望的在线程间分发任务的机制。

另外，从通道队列中取出任务涉及到修改 `receiver`，所以这些线程需要一个能安全的共享和修改 `receiver` 的方式。如果修改不是线程安全的，则可能遇到竞争状态，例如两个线程因同时在队列中取出相同的任务并执行了相同的工作。

所以回忆一下第十六章讨论的线程安全智能指针，为了在多个线程间共享所有权并允许线程修改其值，需要使用 `Arc<Mutex<T>>`。`Arc` 使得多个 worker 拥有接收端，而 `Mutex` 则确保一次只有一个 worker 能从接收端得到任务。列表 20-18 展示了所做的修改：

<span class="filename">文件名: src/lib.rs</span>

```rust
# use std::thread;
# use std::sync::mpsc;
use std::sync::Arc;
use std::sync::Mutex;

// ...snip...

# pub struct ThreadPool {
#     workers: Vec<Worker>,
#     sender: mpsc::Sender<Job>,
# }
# struct Job;
#
impl ThreadPool {
    // ...snip...
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, receiver.clone()));
        }

        ThreadPool {
            workers,
            sender,
        }
    }

    // ...snip...
}
# struct Worker {
#     id: usize,
#     thread: thread::JoinHandle<()>,
# }
#
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // ...snip...
#         let thread = thread::spawn(|| {
#            receiver;
#         });
#
#         Worker {
#             id,
#             thread,
#         }
    }
}
```

<span class="caption">列表 20-18：使用 `Arc` 和 `Mutex` 在 worker 间共享通道的接收端</span>

在 `ThreadPool::new` 中，将通道的接收端放入一个 `Arc` 和一个 `Mutex` 中。对于每一个新 worker，则克隆 `Arc` 来增加引用计数，如此这些 worker 就可以共享接收端的所有权了。

通过这些修改，代码可以编译了！我们做到了！

最好让我们实现 `ThreadPool` 上的 `execute` 方法。同时也要修改 `Job` 结构体：它将不再是结构体，`Job` 将是一个有着 `execute` 接收到的闭包类型的 trait 对象的类型别名。我们讨论过类型别名如何将长的类型变短，现在就这种情况！看一看列表 20-19：

<span class="filename">文件名: src/lib.rs</span>

```rust
// ...snip...
# pub struct ThreadPool {
#     workers: Vec<Worker>,
#     sender: mpsc::Sender<Job>,
# }
# use std::sync::mpsc;
# struct Worker {}

type Job = Box<FnOnce() + Send + 'static>;

impl ThreadPool {
    // ...snip...

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(job).unwrap();
    }
}

// ...snip...
```

<span class="caption">列表 20-19：为存放每一个闭包的 `Box` 创建一个 `Job` 类型别名，接着在通道中发出</span>

在使用 `execute` 得到的闭包新建 `Job` 实例之后，将这些任务从通道的发送端发出。这里调用 `send` 上的 `unwrap`，因为如果接收端停止接收新消息则发送可能会失败，这可能发生于我们停止了所有的执行线程。不过目前这是不可能的，因为只要线程池存在他们就会一直执行。使用 `unwrap` 是因为我们知道失败不可能发生，即便编译器不这么认为，正如第九章讨论的这是 `unwrap` 的一个恰当用法。

那我们结束了吗？不完全是！在 worker 中，传递给 `thread::spawn` 的闭包仍然还只是**引用**了通道的接收端。但是我们需要闭包一直循环，向通道的接收端请求任务，并在得到任务时执行他们。如列表 20-20 对 `Worker::new` 做出修改：

<span class="filename">文件名: src/lib.rs</span>

```rust
// ...snip...

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {} got a job; executing.", id);

                (*job)();
            }
        });

        Worker {
            id,
            thread,
        }
    }
}
```

<span class="caption">列表 20-20： 在 worker 线程中接收并执行任务</span>

这里，首先在 `receiver` 上调用了 `lock` 来获取互斥器，接着 `unwrap` 在出现任何错误时 panic。如果互斥器处于一种叫做**被污染**（*poisoned*）的状态时获取锁肯能会失败，这可能发生于其他线程在持有锁时 panic 了并没有释放锁。如果当前线程因为这个原因不能得到所，调用 `unwrap` 使其 panic 也是正确的行为。如果你觉得有意义的话请随意将 `unwrap` 改为带有错误信息的 `expect`。

如果锁定了互斥器，接着调用 `recv` 从通道中接收 `Job`。最后的 `unwrap` 也绕过了一些错误，`recv` 在通道的发送端关闭时会返回 `Err`，类似于 `send` 在接收端关闭时返回 `Err` 一样。

调用 `recv` 的代码块；也就是说，它还没有任务，这个线程会等待直到有可用的任务。`Mutex<T>` 确保一次只有一个 `Worker` 线程尝试请求任务。

理论上这段代码应该能够编译。不幸的是，Rust 编译器仍不够完美，会给出如下错误：

```
error[E0161]: cannot move a value of type std::ops::FnOnce() +
std::marker::Send: the size of std::ops::FnOnce() + std::marker::Send cannot be
statically determined
  --> src/lib.rs:63:17
   |
63 |                 (*job)();
   |                 ^^^^^^
```

这个错误非常的神秘，因为这个问题本身就很神秘。为了调用储存在 `Box<T>` （这正是 `Job` 别名的类型）中的 `FnOnce` 闭包，该闭包需要能将自己移动出 `Box<T>`，因为当调用这个闭包时，它获取 `self` 的所有权。通常来说，将值移动出 `Box<T>` 是不被允许的，因为 Rust 不知道 `Box<T>` 中的值将会有多大；回忆第十五章能够正常使用 `Box<T>` 是因为我们将未知大小的值储存进 `Box<T>` 从而得到已知大小的值。

第十七章曾见过，列表 17-15 中有使用了 `self: Box<Self>` 语法的方法，它获取了储存在 `Box<T>` 中的 `Self` 值的所有权。这正是我们希望做的，然而不幸的是 Rust 调用闭包的那部分实现并没有使用 `self: Box<Self>`。所以这里 Rust 也不知道它可以使用 `self: Box<Self>` 来获取闭包的所有权并将闭包移动出 `Box<T>`。

将来列表 20-20 中的代码应该能够正常工作。Rust 仍在努力改进提升编译器。有很多像你一样的人正在修复这个以及其他问题！当你结束了本书的阅读，我们希望看到你也成为他们中的一员。

不过目前让我们绕过这个问题。所幸有一个技巧可以显式的告诉 Rust 我们处于可以获取使用 `self: Box<Self>` 的 `Box<T>` 中值的所有权的状态，而一旦获取了闭包的所有权就可以调用它了。这涉及到定义一个新 trait，它带有一个在签名中使用 `self: Box<Self>` 的方法 `call_box`，为任何实现了 `FnOnce()` 的类型定义这个 trait，修改类型别名来使用这个新 trait，并修改 `Worker` 使用 `call_box` 方法。这些修改如列表 20-21 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
trait FnBox {
    fn call_box(self: Box<Self>);
}

impl<F: FnOnce()> FnBox for F {
    fn call_box(self: Box<F>) {
        (*self)()
    }
}

type Job = Box<FnBox + Send + 'static>;

// ...snip...

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv().unwrap();

                println!("Worker {} got a job; executing.", id);

                job.call_box();
            }
        });

        Worker {
            id,
            thread,
        }
    }
}
```

<span class="caption">列表 20-21：新增一个 trait `FnBox` 来绕过当前 `Box<FnOnce()>` 的限制</span>

首先，新建了一个叫做 `FnBox` 的 trait。这个 trait 有一个方法 `call_box`，它类似于其他 `Fn*` trait 中的 `call` 方法，除了它获取 `self: Box<Self>` 以便获取 `self` 的所有权并将值从 `Box<T>` 中移动出来。

现在我们希望 `Job` 类型别名是任何实现了新 trait `FnBox` 的 `Box`，而不是 `FnOnce()`。这允许我们在得到 `Job` 值时使用 `Worker` 中的 `call_box`。因为我们为任何 `FnOnce()` 闭包都实现了 `FnBox` trait，无需对实际在通道中发出的值做任何修改。

最后，对于 `Worker::new` 的线程中所运行的闭包，调用 `call_box` 而不是直接执行闭包。现在 Rust 就能够理解我们的行为是正确的了。

这是非常狡猾且复杂的手段。无需过分担心他们并不是非常有道理；总有一天，这一切将是毫无必要的。

通过这些技巧，线程池处于可以运行的状态了！执行 `cargo run` 并发起一些请求：

```
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
warning: field is never used: `workers`
 --> src/lib.rs:7:5
  |
7 |     workers: Vec<Worker>,
  |     ^^^^^^^^^^^^^^^^^^^^
  |
  = note: #[warn(dead_code)] on by default

warning: field is never used: `id`
  --> src/lib.rs:61:5
   |
61 |     id: usize,
   |     ^^^^^^^^^
   |
   = note: #[warn(dead_code)] on by default

warning: field is never used: `thread`
  --> src/lib.rs:62:5
   |
62 |     thread: thread::JoinHandle<()>,
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = note: #[warn(dead_code)] on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.99 secs
     Running `target/debug/hello`
     Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
Worker 1 got a job; executing.
Worker 3 got a job; executing.
Worker 0 got a job; executing.
Worker 2 got a job; executing.
```

成功了！现在我们有了一个可以异步执行连接的线程池！它绝不会创建超过四个线程，所以当 server 收到大量请求时系统也不会负担过重。如果请求 `/sleep`，server 也能够通过另外一个线程处理其他请求。

那么这些警告怎么办呢？难道我们没有使用 `workers`、`id` 和 `thread` 字段吗？好吧，目前我们用了所有这些字段存放了一些数据，不过当设置线程池并开始执行代码在通道中向线程发送任务时，我们并没有对数据**进行**任何实际的操作。但是如果不存放这些值，他们将会离开作用域：比如，如果不将 `Vec<Worker>` 值作为 `ThreadPool` 的一部分返回，这个 vector 在 `ThreadPool::new` 的结尾就会被清理。

那么这些警告有错吗？从某种角度上讲是的，这些警告是错误的，因为我们使用这些字段储存一直需要的数据。从另一种角度来说也不对：使用过后我们也没有做任何操作清理线程池，仅仅通过 <span class="keystroke">ctrl-C</span> 来停止程序并让操作系统为我们清理。下面让我们实现 graceful shutdown 来清理所创建的一切。