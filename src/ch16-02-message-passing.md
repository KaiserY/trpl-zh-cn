## 使用消息传递在线程间传送数据

> [ch16-02-message-passing.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-02-message-passing.md)
> <br>
> commit 90406bd5a4cd4447b46cd7e03d33f34a651e9bb7

一个人气正在上升的确保安全并发的方式是 **消息传递**（*message passing*），这里线程或 actor 通过发送包含数据的消息来相互沟通。这个思想来源于 Go 编程语言文档中的口号：

> Do not communicate by sharing memory; instead, share memory by
> communicating.
>
> 不要共享内存来通讯；而是要通讯来共享内存。
>
> --[Effective Go](http://golang.org/doc/effective_go.html)

Rust 中一个实现消息传递并发的主要工具是 **通道**（*channel*），一个 Rust 标准库提供了其实现的编程概念。你可以将其想象为一个水流的通道，比如河流或小溪。如果你将诸如橡皮鸭或小船之类的东西放入其中，它们会顺流而下到达下游。


编程中的通道有两部分组成，一个发送者（transmitter）和一个接收者（receiver）。发送者一端位于上游位置，在这里可以将橡皮鸭放入河中，接收者部分则位于下游，橡皮鸭最终会漂流至此。代码中的一部分调用发送者的方法以及希望发送的数据，另一部分则检查接收端收到到达的消息。当发送者或接收者任一被丢弃时可以认为通道被 **关闭**（*closed*）了

这里，我们将开发一个程序，它会在一个线程生成值向通道发送，而在另一个线程会接收值并打印出来。这里会通过通道在线程间发送简单值来演示这个功能。一旦你熟悉了这项技术，就能使用通道来实现聊天系统或利用很多线程进行分布式计算并将部分计算结果发送给一个线程进行聚合。

首先，在示例 16-6 中，创建了一个通道但没有做任何事。注意这还不能编译，因为 Rust 不知道我们想要在通道中发送什么类型：


<span class="filename">文件名: src/main.rs</span>

```rust
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
#     tx.send(()).unwrap();
}
```

<span class="caption">示例 16-6: 创建一个通道，并将其两端赋值给 `tx` 和 `rx`</span>

这里使用 `mpsc::channel` 函数创建一个新的通道；`mpsc` 是 **多个生产者，单个消费者**（*multiple producer, single consumer*）的缩写。简而言之，Rust 标准库实现通道的方式意味着一个通道可以有多个产生值的 **发送**（*sending*）端，但只能有一个消费这些值的 **接收**（*receiving*）端。想象一下多条小河小溪最终汇聚成大河：所有通过这些小河发出的东西最后都会来到大河的下游。目前我们以单个生产者开始，但是当示例可以工作后会增加多个生产者。


<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

`mpsc::channel` 函数返回一个元组：第一个元素是发送端，而第二个元素是接收端。由于历史原因，`tx` 和 `rx` 通常作为 **发送者**（*transmitter*）和 **接收者**（*receiver*）的缩写，所以这就是我们将用来绑定这两端变量的名字。这里使用了一个 `let` 语句和模式来解构了此元组；第十八章会讨论 `let` 语句中的模式和解构。如此使用 `let` 语句是一个方便提取 `mpsc::channel` 返回的元组中一部分的手段。

让我们将发送端移动到一个新建线程中并发送一个字符串，这样新建线程就可以和主线程通讯了，如示例 16-7 所示。这类似与在河的上游扔下一只橡皮鸭或从一个线程向另一个线程发送聊天信息：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });
}
```

<span class="caption">示例 16-7: 将 `tx` 移动到一个新建的线程中并发送 “hi”</span>

这里再次使用 `thread::spawn` 来创建一个新线程并使用 `move` 将 `tx` 移动到闭包中这样新建线程就拥有 `tx` 了。新建线程需要拥有通道的发送端以便能向通道发送消息。

通道的发送端有一个 `send` 方法用来获取需要放入通道的值。`send` 方法返回一个 `Result<T, E>` 类型，所以如果接收端已经被丢弃了，将没有发送值的目标，所以发送操作会返回错误。在这个例子中，出错的时候调用 `unwrap` 产生 panic。过对于一个真实程序，需要合理的处理它：回到第九章复习正确处理错误的策略。

在示例 16-8 中，我们在主线程中从通道的接收端获取值。这类似于在河的下游捞起橡皮鸭或接收聊天信息：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

<span class="caption">示例 16-8: 在主线程中接收并打印内容 “hi”</span>

通道的接收端有两个有用的方法：`recv` 和 `try_recv`。这里，我们使用了 `recv`，它是 *receive* 的缩写。这个方法会阻塞主线程执行直到从通道中接收一个值。一旦发送了一个值，`recv` 会在一个 `Result<T, E>` 中返回它。当通道发送端关闭，`recv` 会返回一个错误表明不会再有新的值到来了。

`try_recv` 不会阻塞，相反它立刻返回一个 `Result<T, E>`：`Ok` 值包含可用的信息，而 `Err` 值代表此时没有任何消息。如果线程在等待消息过程中还有其他工作时使用 `try_recv` 很有用：可以编写一个循环来频繁调用 `try_recv`，再有可用消息时进行处理，其余时候则处理一会其他工作知道再次检查。

处于简单的考虑，这个例子使用了 `recv`；主线程中除了等待消息之外没有任何其他工作，所以阻塞主线程是合适的。

如果运行示例 16-8 中的代码，我们将会看到主线程打印出这个值：

```text
Got: hi
```

完美！

### 通道与所有权转移

所有权规则在消息传递中扮演了重要角色，其有助于我们编写安全的并发代码。在并发编程中避免错误是在整个 Rust 程序中必须思考所有权所换来的一大优势。

现在让我们做一个试验来看看通道与所有权如何一同协作以避免产生问题：我们将尝试在新建线程中的通道中发送完 `val` 值 **之后** 再使用它。尝试编译示例 16-9 中的代码：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
        println!("val is {}", val);
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

<span class="caption">示例 16-9: 在我们已经发送到通道中后，尝试使用 `val` 引用</span>

这里尝试在通过 `tx.send` 发送 `val` 到通道中之后将其打印出来。允许这么做是一个坏主意：一旦将值发送到另一个线程后，那个线程可能会在我们再次使用它之前就将其修改或者丢弃。这会由于不一致或不存在的数据而导致错误或意外的结果。

这是一个坏主意：一旦将值发送到另一个线程后，那个线程可能会在我们再次使用它之前就将其修改或者丢弃。其他线程对值可能的修改会由于不一致或不存在的数据而导致错误或意外的结果。然而，尝试编译示例 16-9 的代码时，Rust 会给出一个错误：

```text
error[E0382]: use of moved value: `val`
  --> src/main.rs:10:31
   |
9  |         tx.send(val).unwrap();
   |                 --- value moved here
10 |         println!("val is {}", val);
   |                               ^^^ value used here after move
   |
   = note: move occurs because `val` has type `std::string::String`, which does
not implement the `Copy` trait
```

我们的并发错误会造成一个编译时错误。`send` 函数获取其参数的所有权并移动这个值归接收者所有。这个意味着不可能意外的在发送后再次使用这个值；所有权系统检查一切是否合乎规则。

### 发送多个值并观察接收者的等待

示例 16-8 中的代码可以编译和运行，不过它并没有明前的告诉我们两个独立的线程通过通道相互通讯。示例 16-10 则有一些改进会证明示例 16-8 中的代码是并发执行的：新建线程现在会发送多个消息并在每个消息之间暂停一秒钟。

<span class="filename">文件名: src/main.rs</span>

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

<span class="caption">示例 16-10: 发送多个消息，并在每次发送后暂停一段时间</span>

这一次，在新建线程中有一个字符串 vector 希望发送到主线程。我们遍历他们，单独的发送每一个字符串并通过一个 `Duration` 值调用 `thread::sleep` 函数来暂停一秒。

在主线程中，不再显式调用 `recv` 函数：而是将 `rx` 当作一个迭代器。对于每一个接收到的值，我们将其打印出来。当通道被关闭时，迭代器也将结束。

当运行示例 16-10 中的代码时，将看到如下输出，每一行都会暂停一秒：

```text
Got: hi
Got: from
Got: the
Got: thread
```

因为在主线程中并没有任何暂停或位于 `for` 循环中用于等待的代码，所以可以说主线程是在等待从新建线程中接收值。

### 通过克隆发送者来创建多个生产者

之前我们提到了`mpsc`是 *multiple producer, single consumer* 的缩写。可以运用 `mpsc` 来扩展示例 16-11 中的代码来以创建都向同一接收者发送值的多个线程。这可以通过克隆通道的发送端在来做到，如示例 16-11 所示：

<span class="filename">文件名: src/main.rs</span>


```rust
# use std::thread;
# use std::sync::mpsc;
# use std::time::Duration;
#
# fn main() {
// --snip--

let (tx, rx) = mpsc::channel();

let tx1 = mpsc::Sender::clone(&tx);
thread::spawn(move || {
    let vals = vec![
        String::from("hi"),
        String::from("from"),
        String::from("the"),
        String::from("thread"),
    ];

    for val in vals {
        tx1.send(val).unwrap();
        thread::sleep(Duration::from_secs(1));
    }
});

thread::spawn(move || {
    let vals = vec![
        String::from("more"),
        String::from("messages"),
        String::from("for"),
        String::from("you"),
    ];

    for val in vals {
        tx.send(val).unwrap();
        thread::sleep(Duration::from_secs(1));
    }
});

for received in rx {
    println!("Got: {}", received);
}

// --snip--
# }
```

<span class="caption">示例 16-11: 从多个生产者发送多个消息</span>

这一次，在创建新线程之前，我们对通道的发送端调用了 `clone` 方法。这会给我们一个可以传递给第一个新建线程的发送端句柄。我们会将原始的通道发送端传递给第二个新建线程。这样就会有两个线程，每个线程将向通道的接收端发送不同的消息。

如果运行这些代码，你 **可能** 会看到这样的输出：

```text
Got: hi
Got: more
Got: from
Got: messages
Got: for
Got: the
Got: thread
Got: you
```

虽然你可能会看到这些值以不同的顺序出现；这依赖于你的系统。这也就是并发既有趣又困难的原因。如果通过 `thread::sleep` 做实验，在不同的线程中提供不同的值，就会发现他们的运行更加不确定并每次都会产生不同的输出。

现在我们见识过了通道如何工作，再看看另一种不同的并发方式吧。
