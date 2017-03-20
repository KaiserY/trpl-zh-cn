## 使用消息传递在线程间传送数据

> [ch16-02-message-passing.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch16-02-message-passing.md)
> <br>
> commit da15de39eaabd50100d6fa662c653169254d9175

最近人气正在上升的一个并发方式是**消息传递**（*message passing*），这里线程或 actor 通过发送包含数据的消息来沟通。这个思想来源于口号：

> Do not communicate by sharing memory; instead, share memory by
> communicating.
>
> 不要共享内存来通讯；而是要通讯来共享内存。
>
> --[Effective Go](http://golang.org/doc/effective_go.html)

实现这个目标的主要工具是**通道**（*channel*）。通道有两部分组成，一个发送者（transmitter）和一个接收者（receiver）。代码的一部分可以调用发送者和想要发送的数据，而另一部分代码可以在接收的那一端收取消息。

我们将编写一个例子使用一个线程生成值并向通道发送他们。主线程会接收这些值并打印出来。

首先，如列表 16-6 所示，先创建一个通道但不做任何事：

<span class="filename">Filename: src/main.rs</span>

```rust
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();
#     tx.send(()).unwrap();
}
```

<span class="caption">Listing 16-6: Creating a channel and assigning the two
halves to `tx` and `rx`</span>

`mpsc::channel`函数创建一个新的通道。`mpsc`是**多个生产者，单个消费者**（*multiple producer, single consumer*）的缩写。简而言之，可以有多个产生值的**发送端**，但只能有一个消费这些值的**接收端**。现在我们以一个单独的生产者开始，不过一旦例子可以工作了就会增加多个生产者。

`mpsc::channel`返回一个元组：第一个元素是发送端，而第二个元素是接收端。由于历史原因，很多人使用`tx`和`rx`作为**发送者**和**接收者**的缩写，所以这就是我们将用来绑定这两端变量的名字。这里使用了一个`let`语句和模式来解构了元组。第十八章会讨论`let`语句中的模式和解构。

让我们将发送端移动到一个新建线程中并发送一个字符串，如列表 16-7 所示：

<span class="filename">Filename: src/main.rs</span>

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

<span class="caption">Listing 16-7: Moving `tx` to a spawned thread and sending
"hi"</span>

正如上一部分那样使用`thread::spawn`来创建一个新线程。并使用一个`move`闭包来将`tx`移动进闭包这样新建线程就是其所有者。

通道的发送端有一个`send`方法用来获取需要放入通道的值。`send`方法返回一个`Result<T, E>`类型，因为如果接收端被丢弃了，将没有发送值的目标，所以发送操作会出错。在这个例子中，我们简单的调用`unwrap`来忽略错误，不过对于一个真实程序，需要合理的处理它。第九章是你复习正确错误处理策略的好地方。

在列表 16-8 中，让我们在主线程中从通道的接收端获取值：

<span class="filename">Filename: src/main.rs</span>

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

<span class="caption">Listing 16-8: Receiving the value "hi" in the main thread
and printing it out</span>

通道的接收端有两个有用的方法：`recv`和`try_recv`。这里，我们使用了`recv`，它是 *receive* 的缩写。这个方法会阻塞执行直到从通道中接收一个值。一旦发送了一个值，`recv`会在一个`Result<T, E>`中返回它。当通道发送端关闭，`recv`会返回一个错误。`try_recv`不会阻塞；相反它立刻返回一个`Result<T, E>`。

如果运行列表 16-8 中的代码，我们将会看到主线程打印出这个值：

```
Got: hi
```

### 通道与所有权如何交互

现在让我们做一个试验来看看通道与所有权如何在一起工作：我们将尝试在新建线程中的通道中发送完`val`之后再使用它。尝试编译列表 16-9 中的代码：

<span class="filename">Filename: src/main.rs</span>

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

<span class="caption">Listing 16-9: Attempting to use `val` after we have sent
it down the channel</span>

这里尝试在通过`tx.send`发送`val`到通道中之后将其打印出来。这是一个坏主意：一旦将值发送到另一个线程后，那个线程可能会在我们在此使用它之前就修改或者丢弃它。这会由于不一致或不存在的数据而导致错误或意外的结果。

尝试编译这些代码，Rust 会报错：

```
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

我们的并发错误会造成一个编译时错误！`send`获取其参数的所有权并移动这个值归接收者所有。这个意味着不可能意外的在发送后再次使用这个值；所有权系统检查一切是否合乎规则。

在这一点上，消息传递非常类似于 Rust 的单所有权系统。消息传递的拥护者出于相似的原因支持消息传递，就像 Rustacean 们欣赏 Rust 的所有权一样：单所有权意味着特定类型问题的消失。如果一次只有一个线程可以使用某些内存，就没有出现数据竞争的机会。

### 发送多个值并观察接收者的等待

列表 16-8 中的代码可以编译和运行，不过这并不是很有趣：通过它难以看出两个独立的线程在一个通道上相互通讯。列表 16-10 则有一些改进会证明这些代码是并发执行的：新建线程现在会发送多个消息并在每个消息之间暂定一段时间。

<span class="filename">Filename: src/main.rs</span>

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
            thread::sleep(Duration::new(1, 0));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

<span class="caption">Listing 16-10: Sending multiple messages and pausing
between each one</span>

这一次，在新建线程中有一个字符串 vector 希望发送到主线程。我们遍历他们，单独的发送每一个字符串并通过一个`Duration`值调用`thread::sleep`函数来暂停一秒。

在主线程中，不再显式的调用`recv`函数：而是将`rx`当作一个迭代器。对于每一个接收到的值，我们将其打印出来。当通道被关闭时，迭代器也将结束。

当运行列表 16-10 中的代码时，将看到如下输出，每一行都会暂停一秒：

```
Got: hi
Got: from
Got: the
Got: thread
```

在主线程中并没有任何暂停或位于`for`循环中用于等待的代码，所以可以说主线程是在等待从新建线程中接收值。

### 通过克隆发送者来创建多个生产者

差不多在本部分的开头，我们提到了`mpsc`是 *multiple producer, single consumer* 的缩写。可以扩展列表 16-11 中的代码来创建都向同一接收者发送值的多个线程。这可以通过克隆通道的发送端在来做到，如列表 16-11 所示：

<span class="filename">Filename: src/main.rs</span>

```rust
# use std::thread;
# use std::sync::mpsc;
# use std::time::Duration;
#
# fn main() {
// ...snip...
let (tx, rx) = mpsc::channel();

let tx1 = tx.clone();
thread::spawn(move || {
    let vals = vec![
        String::from("hi"),
        String::from("from"),
        String::from("the"),
        String::from("thread"),
    ];

    for val in vals {
        tx1.send(val).unwrap();
        thread::sleep(Duration::new(1, 0));
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
        thread::sleep(Duration::new(1, 0));
    }
});
// ...snip...
#
#     for received in rx {
#         println!("Got: {}", received);
#     }
# }
```

<span class="caption">Listing 16-11: Sending multiple messages and pausing
between each one</span>

这一次，在创建新线程之前，我们对通道的发送端调用了`clone`方法。这会给我们一个可以传递给第一个新建线程的发送端句柄。我们会将原始的通道发送端传递给第二个新建线程，这样每个线程将向通道的接收端发送不同的消息。

如果运行这些代码，你**可能**会看到这样的输出：

```
Got: hi
Got: more
Got: from
Got: messages
Got: for
Got: the
Got: thread
Got: you
```

虽然你可能会看到这些以不同的顺序出现。这依赖于你的系统！这也就是并发既有趣又困难的原因。如果你拿`thread::sleep`做实验，在不同的线程中提供不同的值，就会发现他们的运行更加不确定并每次都会产生不同的输出。

现在我们见识过了通道如何工作，再看看共享内存并发吧。