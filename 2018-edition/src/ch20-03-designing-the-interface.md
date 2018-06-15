## 设计线程池接口

> [ch20-03-designing-the-interface.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-03-designing-the-interface.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

让我们讨论一下线程池看起来怎样。库作者们经常会发现，当尝试设计一些代码时，首先编写客户端接口确实有助于指导代码设计。以期望的调用方式来构建 API 代码的结构，接着在这个结构之内实现功能，而不是先实现功能再设计公有 API。

类似于第十二章项目中使用的测试驱动开发。这里将要使用编译器驱动开发（Compiler Driven Development）。我们将编写调用所期望的函数的代码，接着依靠编译器告诉我们接下来需要修改什么。编译器错误信息会指导我们的实现。

### 如果使用 `thread::spawn` 的代码结构

首先，让我们探索一下为每一个连接都创建一个线程看起来如何。这并不是最终方案，因为正如之前讲到的它会潜在的分配无限的线程，不过这是一个开始。列表 20-11 展示了 `main` 的改变，它在 `for` 循环中为每一个流分配了一个新线程进行处理：

<span class="filename">Filename: src/main.rs</span>

```rust,no_run
# use std::thread;
# use std::io::prelude::*;
# use std::net::TcpListener;
# use std::net::TcpStream;
#
fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        thread::spawn(|| {
            handle_connection(stream);
        });
    }
}
# fn handle_connection(mut stream: TcpStream) {}
```

<span class="caption">列表 20-11：为每一个流新建一个线程</span>

正如第十六章讲到的，`thread::spawn` 会创建一个新线程并运行闭包中的代码。如果运行这段代码并在两个浏览器标签页中加载 `/sleep` 和 `/`，确实会发现 `/` 请求并没有等待 `/sleep` 结束。不过正如之前提到的，这最终会使系统崩溃因为我们无限制的创建新线程。

### 为 `ThreadPool` 创建一个类似的接口

我们期望线程池以类似且熟悉的方式工作，以便从线程切换到线程池并不会对运行于线程池中的代码做出较大的修改。列表 20-12 展示我们希望用来替换 `thread::spawn` 的 `ThreadPool` 结构体的假想接口：

<span class="filename">文件名: src/main.rs</span>

```rust,no_run
# use std::thread;
# use std::io::prelude::*;
# use std::net::TcpListener;
# use std::net::TcpStream;
# struct ThreadPool;
# impl ThreadPool {
#    fn new(size: u32) -> ThreadPool { ThreadPool }
#    fn execute<F>(&self, f: F)
#        where F: FnOnce() + Send + 'static {}
# }
#
fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        pool.execute(|| {
            handle_connection(stream);
        });
    }
}
# fn handle_connection(mut stream: TcpStream) {}
```

<span class="caption">列表 20-12：如何使用我们将要实现的 `ThreadPool`</span>

这里使用 `ThreadPool::new` 来创建一个新的线程池，它有一个可配置的线程数的参数，在这里是四。这样在 `for` 循环中，`pool.execute` 将会以类似 `thread::spawn` 的方式工作。

### 采用编译器驱动开发来驱动 API 的编译

继续并对列表 20-12 中的 *src/main.rs* 做出修改，并利用编译器错误来驱动开发。下面是我们得到的第一个错误：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error[E0433]: failed to resolve. Use of undeclared type or module `ThreadPool`
  --> src\main.rs:10:16
   |
10 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^^^^^^ Use of undeclared type or module
   `ThreadPool`

error: aborting due to previous error
```

好的，我们需要一个 `ThreadPool`。将 `hello` crate 从二进制 crate 转换为库 crate 来存放 `ThreadPool` 实现，因为线程池实现与我们的 web server 的特定工作相独立。一旦写完了线程池库，就可以在任何工作中使用这个功能，而不仅仅是处理网络请求。

创建 *src/lib.rs* 文件，它包含了目前可用的最简单的 `ThreadPool` 定义：

<span class="filename">文件名: src/lib.rs</span>

```rust
pub struct ThreadPool;
```

接着创建一个新目录，*src/bin*，并将二进制 crate 根文件从 *src/main.rs* 移动到 *src/bin/main.rs*。这使得库 crate 成为 *hello* 目录的主要 crate；不过仍然可以使用 `cargo run` 运行 *src/bin/main.rs* 二进制文件。移动了 *main.rs* 文件之后，修改文件开头加入如下代码来引入库 crate 并将 `ThreadPool` 引入作用域：

<span class="filename">文件名: src/bin/main.rs</span>

```rust,ignore
extern crate hello;
use hello::ThreadPool;
```

再次尝试运行来得到下一个需要解决的错误：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
error: no associated item named `new` found for type `hello::ThreadPool` in the
current scope
  --> src\main.rs:13:16
   |
13 |     let pool = ThreadPool::new(4);
   |                ^^^^^^^^^^^^^^^
   |
```

好的，下一步是为 `ThreadPool` 创建一个叫做 `new` 的关联函数。我们还知道 `new` 需要有一个参数可以接受 `4`，而且 `new` 应该返回 `ThreadPool` 实例。让我们实现拥有此特征的最小化 `new` 函数：

<span class="filename">文件夹: src/lib.rs</span>

```rust
pub struct ThreadPool;

impl ThreadPool {
    pub fn new(size: u32) -> ThreadPool {
        ThreadPool
    }
}
```

这里的 `size` 参数是 `u32` 类型，因为我们知道为负的线程数没有意义。`u32` 是一个很好的默认值。一旦真正实现了 `new`，我们将考虑实现需要选择什么类型，目前我们仅仅处理编译器错误。

再次编译检查这段代码：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
warning: unused variable: `size`, #[warn(unused_variables)] on by default
 --> src/lib.rs:4:16
  |
4 |     pub fn new(size: u32) -> ThreadPool {
  |                ^^^^

error: no method named `execute` found for type `hello::ThreadPool` in the
current scope
  --> src/main.rs:18:14
   |
18 |         pool.execute(|| {
   |              ^^^^^^^
```

好的，一个警告和一个错误。暂时先忽略警告，错误是因为并没有 `ThreadPool` 上的 `execute` 方法。让我们来定义一个，它应该能接受一个闭包。如果你还记得第十三章，闭包作为参数时可以使用三个不同的 trait：`Fn`、`FnMut` 和 `FnOnce`。那么应该用哪一种闭包呢？好吧，最终需要实现的类似于 `thread::spawn`；`thread::spawn` 的签名在其参数中使用了何种 bound 呢？查看文档会发现：

```rust
pub fn spawn<F, T>(f: F) -> JoinHandle<T>
    where
        F: FnOnce() -> T + Send + 'static,
        T: Send + 'static
```

`F` 是这里我们关心的参数；`T` 与返回值有关所以我们并不关心。考虑到 `spawn` 使用 `FnOnce` 作为 `F` 的 trait bound，这可能也是我们需要的，因为最终会将传递给 `execute` 的参数传给 `spawn`。因为处理请求的线程只会执行闭包一次，这也进一步确认了 `FnOnce` 是我们需要的 trait。

`F` 还有 trait bound `Send` 和生命周期绑定 `'static`，这对我们的情况也是有意义的：需要 `Send` 来将闭包从一个线程转移到另一个线程，而 `'static` 是因为并不知道线程会执行多久。让我们编写一个使用这些 bound 的泛型参数 `F` 的 `ThreadPool` 的 `execute` 方法：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub struct ThreadPool;
impl ThreadPool {
    // ...snip...

    pub fn execute<F>(&self, f: F)
        where
            F: FnOnce() + Send + 'static
    {

    }
}
```

`FnOnce` trait 仍然需要之后的 `()`，因为这里的 `FnOnce` 代表一个没有参数也没有返回值的闭包。正如函数的定义，返回值类型可以从签名中省略，不过即便没有参数也需要括号。

因为我们仍在努力使接口能够编译，这里增加了 `execute` 方法的最小化实现，它没有做任何工作。再次进行检查：

```
$ cargo check
   Compiling hello v0.1.0 (file:///projects/hello)
warning: unused variable: `size`, #[warn(unused_variables)] on by default
 --> src/lib.rs:4:16
  |
4 |     pub fn new(size: u32) -> ThreadPool {
  |                ^^^^

warning: unused variable: `f`, #[warn(unused_variables)] on by default
 --> src/lib.rs:8:30
  |
8 |     pub fn execute<F>(&self, f: F)
  |                              ^
```

现在就只有警告了！能够编译了！注意如果尝试 `cargo run` 运行程序并在浏览器中发起请求，仍会在浏览器中出现在本章开始时那样的错误。这个库实际上还没有调用传递给 `execute` 的闭包！

> 一个你可能听说过的关于像 Haskell 和 Rust 这样有严格编译器的语言的说法是“如果代码能够编译，它就能工作”。这是一个提醒大家的好时机，这只是一个说法和一种有时存在的感觉，实际上并不是完全正确的。我们的项目可以编译，不过它绝对没有做任何工作！如果构建一个真实且功能完整的项目，则需花费大量的时间来开始编写单元测试来检查代码能否编译**并且**拥有期望的行为。