## 慢请求如何影响吞吐率

> [ch20-02-slow-requests.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-02-slow-requests.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

目前 server 会依次处理每一个请求。这对于向我们这样并不期望有非常大量请求的服务来说是可行的，不过随着程序变得更复杂，这样的串行处理并不是最优的。

因为当前的程序顺序处理处理连接，在完成第一个连接的处理之前不会处理第二个连接。如果一个请求花费很长时间来处理，这段时间接收的请求则不得不等待这个长请求结束，即便这些新请求可以很快就处理完。让我们实际尝试一下。

### 在当前 server 实现中模拟慢请求

让我们看看一个花费很长时间处理的请求对当前的 server 实现有何影响。列表 20-10 展示了对另一个请求的响应代码，`/sleep`，它会使 server 在响应之前休眠五秒。这将模拟一个慢请求以便体现出 server 在串行的处理请求。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::time::Duration;
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
// ...snip...

fn handle_connection(mut stream: TcpStream) {
#     let mut buffer = [0; 512];
#     stream.read(&mut buffer).unwrap();
    // ...snip...

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

    // ...snip...
}
```

<span class="caption">列表 20-10：通过识别 `/sleep` 并休眠五秒来模拟慢请求</span>

这段代码有些凌乱，不过对于模拟的目的来说已经足够！这里创建了第二个请求 `sleep`，我们会识别其数据。在 `if` 块之后增加了一个 `else if` 来检查 `/sleep` 请求，当发现这个请求时，在渲染欢迎页面之前会先休眠五秒。

现在就可以真切的看出我们的 server 有多么的原始；真实的库将会以更简洁的方式处理多请求识别问题。

使用 `cargo run` 启动 server，并接着打开两个浏览器窗口：一个请求 `http://localhost:8080/` 而另一个请求 `http://localhost:8080/sleep`。如果像之前一样多次请求 `/`，会发现响应的比较快速。不过如果请求`/sleep` 之后在请求 `/`，就会看到 `/` 会等待直到 `sleep` 休眠完五秒之后才出现。

这里有多种办法来改变我们的 web server 使其避免所有请求都排在慢请求之后；其一便是实现一个线程池。

### 使用线程池改善吞吐量

**线程池**（*thread pool*）是一组预先分配的用来处理任务的线程。当程序收到一个新任务，线程池中的一个线程会被分配任务并开始处理。其余的线程则可用于处理在第一个线程处理任务的同时处理其他接收到的任务。当第一个线程处理完任务时，它会返回空闲线程池中等待处理新任务。

线程池允许我们并发处理连接：可以在老连接处理完之前就开始处理新连接。这增加了 server 的吞吐量。

如下是我们将要实现的：不再等待每个请求处理完才开始下一个，我们将每个连接的处理发送给不同的线程。这些线程来此程序启动时分配的四个线程的线程池。限制较少的线程数的原因是如果为每个新来的请求都创建一个新线程，则千万级的请求就造成灾难，他们会用尽服务器的资源并导致所有请求的处理都被终止。

不同于分配无限的线程，线程池中将有固定数量的等待线程。当新进请求时，将请求发送到线程池中做处理。线程池会维护一个接收请求的队列。每一个线程会从队列中取出一个请求，处理请求，接着向对队列索取另一个请求。通过这种设计，则可以并发处理 `N` 个请求，其中 `N` 为线程数。这仍然意味着 `N` 个慢请求会阻塞队列中的请求，不过确实将能够处理的慢请求数量从一增加到了 `N`。

这个设计是多种改善 web server 吞吐量的方法之一。不过本书并不是有关 web server 的，所以这一种方法是我们将要涉及的。其他的方法有 fork/join 模型和单线程异步 I/O 模型。如果你对这个主题感兴趣，则可以阅读更多关于其他解决方案的内容并尝试用 Rust 实现他们；对于一个像 Rust 这样的底层语言，所有这些方法都是可能的。