## Graceful Shutdown 与清理

> [ch20-06-graceful-shutdown-and-cleanup.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-06-graceful-shutdown-and-cleanup.md)
> <br>
> commit 2e269ff82193fd65df8a87c06561d74b51ac02f7

列表 20-21 中的代码如期通过使用线程池异步的响应请求。这里有一些警告说存在一些字段并没有直接被使用，这提醒了我们并没有清理任何内容。当使用 <span class="keystroke">ctrl-C</span> 终止主线程，所有其他线程也会立刻停止，即便他们正在处理一个请求。

现在我们要为 `ThreadPool` 实现 `Drop` trait 对线程池中的每一个线程调用 `join`，这样这些线程将会执行完他们的请求。接着会为 `ThreadPool` 实现一个方法来告诉线程他们应该停止接收新请求并结束。为了实践这些代码，修改 server 在 graceful Shutdown 之前只接受两个请求。

现在开始为线程池实现 `Drop`。当线程池被丢弃时，应该 join 所有线程以确保他们完成其操作。列表 20-22 展示了 `Drop` 实现的第一次尝试；这些代码还不能够编译：

<span class="filename">文件名: src/lib.rs</span>

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            worker.thread.join().unwrap();
        }
    }
}
```

<span class="caption">列表 20-22：当线程池离开作用域时 join 每个线程</span>

这里遍历线程池中的每个 `workers`，这里使用了 `&mut` 因为 `self` 本身是一个可变引用而且也需要能够修改 `worker`。当特定 worker 关闭时会打印出说明信息，接着在对应 worker 上调用 `join`。如果 `join` 失败了，通过 `unwrap` 将错误变为 panic 从而无法进行 graceful Shutdown。

如下是尝试编译代码时得到的错误：

```
error[E0507]: cannot move out of borrowed content
  --> src/lib.rs:65:13
   |
65 |             worker.thread.join().unwrap();
   |             ^^^^^^ cannot move out of borrowed content
```

因为我们只有每个 `worker` 的可变借用，并不能调用 `join`：`join` 获取其参数的所有权。为了解决这个问题，需要一个方法将 `thread` 移动出拥有其所有权的 `Worker` 实例以便 `join` 可以消费这个线程。列表 17-15 中我们曾见过这么做的方法：如果 `Worker` 存放的是 `Option<thread::JoinHandle<()>`，就可以在 `Option` 上调用 `take` 方法将值从 `Some` 成员中移动出来而对 `None` 成员不做处理。换句话说，正在运行的 `Worker` 的 `thread` 将是 `Some` 成员值，而当需要清理 worker 时，将 `Some` 替换为 `None`，这样 worker 就没有可以运行的线程了。

所以我们知道了需要更新 `Worker` 的定义为如下：

<span class="filename">文件名: src/lib.rs</span>

```rust
# use std::thread;
struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}
```

现在依靠编译器来找出其他需要修改的地方。我们会得到两个错误：

```
error: no method named `join` found for type
`std::option::Option<std::thread::JoinHandle<()>>` in the current scope
  --> src/lib.rs:65:27
   |
65 |             worker.thread.join().unwrap();
   |                           ^^^^

error[E0308]: mismatched types
  --> src/lib.rs:89:21
   |
89 |             thread,
   |             ^^^^^^ expected enum `std::option::Option`, found
   struct `std::thread::JoinHandle`
   |
   = note: expected type `std::option::Option<std::thread::JoinHandle<()>>`
              found type `std::thread::JoinHandle<_>`
```

第二个错误指向 `Worker::new` 结尾的代码；当新建 `Worker` 时需要将 `thread` 值封装进 `Some`：

<span class="filename">文件名: src/lib.rs</span>

```rust
impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        // ...snip...

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

第一个错误有关 `Drop` 实现，而且我们提到过要调用 `Option` 上的 `take` 将 `thread` 移动出 `worker`。如下是代码：

<span class="filename">文件名: src/lib.rs</span>

```rust
impl Drop for ThreadPool {
    fn drop(&mut self) {
        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

如第十七章我们见过的，`Option` 上的 `take` 方法会取出 `Some` 而留下 `None`。使用 `if let` 解构 `Some` 并得到线程，接着在线程上调用 `join`。如果 worker 的线程已然是 `None`，就知道此时这个 worker 已经清理了其线程且无需做任何操作。

有了这些修改，代码就能编译且没有任何警告。不过也有坏消息，这些代码还不能以我们期望的方式运行。问题的关键在于 `Worker` 中分配的线程所运行的闭包中的逻辑：调用 `join` 并不会关闭线程，因为他们一直 `loop` 来寻找任务。如果采用这个实现来尝试丢弃 `ThreadPool` ，则主线程会永远阻塞在等待第一个线程结束上。

为了修复这个问题，修改线程既监听是否有 `Job` 运行也要监听应该停止监听并退出无限循环的信号。所以通道将发送这个枚举的两个成员之一而不再直接使用 `Job` 实例：

<span class="filename">文件名: src/lib.rs</span>

```rust
# struct Job;
enum Message {
    NewJob(Job),
    Terminate,
}
```

`Message` 枚举要么是存放了线程需要运行的 `Job` 的 `NewJob` 成员，要么是会导致线程退出循环并终止的 `Terminate` 成员。

同时需要修改通道来使用 `Message` 类型值而不是 `Job`，如列表 20-23 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

// ...snip...

impl ThreadPool {
    // ...snip...
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();

        // ...snip...
    }

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(Message::NewJob(job)).unwrap();
    }
}

// ...snip...

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) ->
        Worker {

        let thread = thread::spawn(move ||{
            loop {
                let message = receiver.lock().unwrap().recv().unwrap();

                match message {
                    Message::NewJob(job) => {
                        println!("Worker {} got a job; executing.", id);

                        job.call_box();
                    },
                    Message::Terminate => {
                        println!("Worker {} was told to terminate.", id);

                        break;
                    },
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

<span class="caption">列表 20-23：收发 `Message` 值并在 `Worker` 收到 `Message::Terminate` 时退出循环</span>

需要将 `ThreadPool` 定义、创建通道的 `ThreadPool::new` 和 `Worker::new` 签名中的 `Job` 改为 `Message`。`ThreadPool` 的 `execute` 方法需要发送封装进 `Message::NewJob` 成员的任务，当获取到 `NewJob` 时会处理任务而收到 `Terminate` 成员时则会退出循环。

通过这些修改，代码再次能够编译并按照期望的行为运行。不过还是会得到一个警告，因为并没有在任何消息中使用 `Terminate` 成员。如列表 20-14 所示那样修改 `Drop` 实现：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
impl Drop for ThreadPool {
    fn drop(&mut self) {
        println!("Sending terminate message to all workers.");

        for _ in &mut self.workers {
            self.sender.send(Message::Terminate).unwrap();
        }

        println!("Shutting down all workers.");

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}
```

<span class="caption">列表 20-24：在对每个 worker 线程调用 `join` 之前向 worker 发送 `Message::Terminate`</span>

现在遍历了 worker 两次，一次向每个 worker 发送一个 `Terminate` 消息，一个调用每个 worker 线程上的  `join`。如果尝试在同一循环中发送消息并立即 join 线程，则无法保证当前迭代的 worker 是从通道收到终止消息的 worker。

为了更好的理解为什么需要两个分开的循环，想象一下只有两个 worker 的场景。如果在一个循环中遍历每个 worker，在第一次迭代中 `worker` 是第一个 worker，我们向通道发出终止消息并对第一个 worker 线程调用 `join`。如果第一个 worker 当时正忙于处理请求，则第二个 worker 会从通道接收这个终止消息并结束。而我们在等待第一个 worker 结束，不过它永远也不会结束因为第二个线程取走了终止消息。现在我们就阻塞在了等待第一个 worker 结束，而无法发出第二条终止消息。死锁！

为了避免此情况，首先从通道中取出所有的 `Terminate` 消息，接着 join 所有的线程。因为每个 worker 一旦收到终止消息即会停止从通道接收消息，我们就可以确保如果发送同 worker 数相同的终止消息，在 join 之前每个线程都会收到一个终止消息。

为了实践这些代码，如列表 20-25 所示修改 `main` 在 graceful Shutdown server 之前只接受两个请求：

<span class="filename">文件名: src/bin/main.rs</span>

```rust,ignore
fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    let pool = ThreadPool::new(4);

    let mut counter = 0;

    for stream in listener.incoming() {
        if counter == 2 {
            println!("Shutting down.");
            break;
        }

        counter += 1;

        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}
```

<span class="caption">列表 20-25：在处理两个请求之后通过退出循环来停止 server</span>

只处理两次请求并不是生产环境的 web server 所期望的行为，不过这可以让我们看清 graceful shutdown 和清理起作用了，因为不用再通过 <span class="keystroke">ctrl-C</span> 停止 server 了。

这里还增加了一个 `counter` 变量在每次收到 TCP 流时递增。如果计数到达 2，会停止处理请求并退出 `for` 循环。`ThreadPool` 会在 `main` 的结尾离开作用域，而且还会看到 `drop` 实现的运行。

使用 `cargo run` 启动 server，并发起三个请求。第三个请求应该会失败，而终端的输出应该看起来像这样：

```
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 1.0 secs
     Running `target/debug/hello`
Worker 0 got a job; executing.
Worker 3 got a job; executing.
Shutting down.
Sending terminate message to all workers.
Shutting down all workers.
Shutting down worker 0
Worker 1 was told to terminate.
Worker 2 was told to terminate.
Worker 0 was told to terminate.
Worker 3 was told to terminate.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
```

当然，你可能会看到不同顺序的输出。可以从信息中看到服务是如何运行的： worker 0 和 worker 3 获取了头两个请求，接着在第三个请求时，我们停止接收连接。当 `ThreadPool` 在 `main` 的结尾离开作用域时，其 `Drop` 实现开始工作，线程池通知所有线程终止。每个 worker 在收到终止消息时会打印出一个信息，接着线程池调用 `join` 来终止每一个 worker 线程。

这个特定的运行过程中一个有趣的地方在于：注意我们向通道中发出终止消息，而在任何线程收到消息之前，就尝试 join worker 0 了。worker 0 还没有收到终止消息，所以主线程阻塞直到 worker 0 结束。与此同时，每一个线程都收到了终止消息。一旦 worker 0 结束，主线程就等待其他 worker 结束，此时他们都已经收到终止消息并能够停止了。

恭喜！现在我们完成了这个项目，也有了一个使用线程池异步响应请求的基础 web server。我们能对 server 执行 graceful shutdown，它会清理线程池中的所有线程。如下是完整的代码参考：

<span class="filename">Filename: src/bin/main.rs</span>

```rust
extern crate hello;
use hello::ThreadPool;

use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::fs::File;
use std::thread;
use std::time::Duration;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    let pool = ThreadPool::new(4);

    let mut counter = 0;

    for stream in listener.incoming() {
        if counter == 2 {
            println!("Shutting down.");
            break;
        }

        counter += 1;

        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";
    let sleep = b"GET /sleep HTTP/1.1\r\n";

    let (status_line, filename) = if buffer.starts_with(get) {
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else if buffer.starts_with(sleep) {
        thread::sleep(Duration::from_secs(5));
        ("HTTP/1.1 200 OK\r\n\r\n", "hello.html")
    } else {
        ("HTTP/1.1 404 NOT FOUND\r\n\r\n", "404.html")
    };

     let mut file = File::open(filename).unwrap();
     let mut contents = String::new();

     file.read_to_string(&mut contents).unwrap();

     let response = format!("{}{}", status_line, contents);

     stream.write(response.as_bytes()).unwrap();
     stream.flush().unwrap();
}
```

<span class="filename">Filename: src/lib.rs</span>

```rust
use std::thread;
use std::sync::mpsc;
use std::sync::Arc;
use std::sync::Mutex;

enum Message {
    NewJob(Job),
    Terminate,
}

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

trait FnBox {
    fn call_box(self: Box<Self>);
}

impl<F: FnOnce()> FnBox for F {
    fn call_box(self: Box<F>) {
        (*self)()
    }
}

type Job = Box<FnBox + Send + 'static>;

impl ThreadPool {
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
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

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {
        let job = Box::new(f);

        self.sender.send(Message::NewJob(job)).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        println!("Sending terminate message to all workers.");

        for _ in &mut self.workers {
            self.sender.send(Message::Terminate).unwrap();
        }

        println!("Shutting down all workers.");

        for worker in &mut self.workers {
            println!("Shutting down worker {}", worker.id);

            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) ->
        Worker {

        let thread = thread::spawn(move ||{
            loop {
                let message = receiver.lock().unwrap().recv().unwrap();

                match message {
                    Message::NewJob(job) => {
                        println!("Worker {} got a job; executing.", id);

                        job.call_box();
                    },
                    Message::Terminate => {
                        println!("Worker {} was told to terminate.", id);

                        break;
                    },
                }
            }
        });

        Worker {
            id,
            thread: Some(thread),
        }
    }
}
```

这里还有很多可以做的事！如果你希望继续增强这个项目，如下是一些点子：

- 为 `ThreadPool` 和其公有方法增加更多文档
- 为库的功能增加测试
- 将 `unwrap` 调用改为更健壮的错误处理
- 使用 `ThreadPool` 进行其他不同于处理网络请求的任务
- 在 crates.io 寻找一个线程池 crate 并使用它实现一个类似的 web server，将其 API 和鲁棒性与我们的实现做对比

## 总结

好极了！你结束了本书的学习！由衷感谢你与我们一道加入这次 Rust 之旅。现在你已经准备好出发并实现自己的 Rust 项目或帮助他人了。请不要忘记我们的社区，这里有其他 Rustaceans 正乐于帮助你迎接 Rust 之路上的任何挑战。