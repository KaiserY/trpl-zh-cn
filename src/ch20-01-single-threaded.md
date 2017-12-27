## 单线程 web server

> [ch20-01-single-threaded.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-01-single-threaded.md)
> <br>
> commit 2e269ff82193fd65df8a87c06561d74b51ac02f7

首先让我们创建一个可运行的单线程 web server。我们将处理 TCP 和 HTTP 请求和响应的原始字节来从 server 向浏览器发送 HTML。首先先快速了解一下涉及到的协议。

**超文本传输协议**（*Hypertext Transfer Protocol*，*HTTP*）驱动着现在的互联网，它构建于 **传输控制协议**（*Transmission Control Protocol*，*TCP*）的基础上。这里并不会过多的涉及细节，只做简单的概括：TCP 是一个底层协议，HTTP 是 TCP 之上的高级协议。这两个都是一种被称为 **请求-响应协议**（*request-response protocol*）的协议，也就是说，有 **客户端**（*client*）来初始化请求，并有 **服务端**（*server*）监听请求并向客户端提供响应。请求与响应的内容由协议本身定义。

TCP 描述了信息如何从一个 server 到另一个的底层细节，不过它并不指定信息是什么；它仅仅是一堆 0 和 1。HTTP 构建于 TCP 之上，它定义了请求和响应的内容。为此，技术上讲可将 HTTP 用于其他协议之上，不过对于绝大部分情况，HTTP 通过 TCP 传输。

所以我们的 web server 所需做的第一件事便是能够监听 TCP 连接。标准库有 `std::net` 模块处理这些功能。现在创建一个新项目：

```
$ cargo new hello --bin
     Created binary (application) `hello` project
$ cd hello
```

并在 `src/main.rs` 放入列表 20-1 中的代码作为开始。这段代码会在地址 `127.0.0.1:8080` 上监听传入的 TCP 流。当获取到传入的流，它会打印出 `Connection established!`：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        println!("Connection established!");
    }
}
```

<span class="caption">列表 20-1：监听传入的流并在接收到流时打印信息</span>

`TcpListener` 用于监听 TCP 连接。我们选择监听地址 `127.0.0.1:8080`。冒号之前的部分是一个代表本机的 IP 地址，而 `8080` 是端口。选择这个端口是因为通常 HTTP 监听 80 端口，不过连接 80 端口需要管理员权限。普通用户可以监听大于 1024 的端口；8080 端口易于记忆因为它重复了 HTTP 的 80 端口两次。

`bind` 函数类似于 `new` 因为它返回一个新的 `TcpListener` 实例，不过 `bind` 是一个符合这个领域术语的描述性名称。在网络领域，人们通常说“绑定到一个端口”（“binding to a port”），所以标准库中将创建新 `TcpListener` 的函数定义为 `bind`。

`bind` 函数返回 `Result<T, E>`。绑定可能会失败，例如，如果不是管理员尝试连接 80 端口。另一个绑定会失败的情况是两个程序监听相同的端口，这可能发生于运行两个本程序的实例时。因为我们编写的是一个基础的 server，将不会担心处理这类错误，`unwrap` 使得出现这些情况时直接停止程序。

`TcpListener` 的 `incoming` 方法返回一个迭代器，它提供了一系列的流（更准确的说是 `TcpStream` 类型的流）。**流**（*stream*）代表一个客户端和服务端之间打开的连接。**连接**（*connection*）代表客户端连接服务端、服务端生成响应以及服务端关闭连接的全部请求 / 响应过程。为此，`TcpStream` 允许我们读取它来查看客户端发送了什么，并可以编写响应。所以这个 `for` 循环会依次处理每个连接并产生一系列的流供我们处理。

目前为止，处理流意味着调用 `unwrap` 在出现任何错误时终止程序，接着打印信息。因为我们实际上没有遍历连接，而是遍历 **连接尝试**（*connection attempts*），所以可能出现错误。连接可能会因为很多原因不能成功，大部分是操作系统相关的。例如，很多系统限制同时打开的连接数；新连接尝试产生错误，直到一些打开的连接关闭为止。

让我们试试这段代码！首先在终端执行 `cargo run`，接着在浏览器中加载 `127.0.0.1:8080`。浏览器会显示出看起来类似于“连接重置”（“Connection reset”）的错误信息，因为目前并没响应任何数据。但是如果我们观察终端，会发现当浏览器连接 server 时会打印出一系列的信息！

```
     Running `target/debug/hello`
Connection established!
Connection established!
Connection established!
```

对于一次浏览器请求会打印出多条信息；这些连接可能是浏览器请求页面和请求出现在浏览器 tab 页中的 `favicon.ico`，或者浏览器可能重试了连接。浏览器期望使用 HTTP 交互，不过我们并未回复任何内容。当 `stream` 在循环的结尾离开作用域并被丢弃，其连接将被关闭，作为 `TcpStream` 的 `drop` 实现的一部分。浏览器有时通过重连来处理关闭的连接，因为这些问题可能是暂时的。现在重要的是我们成功的处理了 TCP 连接！

记得当运行完特定版本的代码后使用 <span class="keystroke">ctrl-C</span> 来停止程序，并在做出最新的代码修改之后执行 `cargo run` 重启服务。

### 读取请求

下面读取浏览器的请求！因为我们增加了出于处理连接目的的功能。开始一个新函数来将设置 server 和连接，与处理每个请求分离，践行关注分离原则。在这个新的 `handle_connection` 函数中，从 `stream` 中读取数据并打印出来以便观察浏览器发送过来的数据。将代码修改为如列表 20-2 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,no_run
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];

    stream.read(&mut buffer).unwrap();

    println!("Request: {}", String::from_utf8_lossy(&buffer[..]));
}
```

<span class="caption">列表 20-2：读取 `TcpStream` 并打印数据</span>

在开头增加 `std::io::prelude` 以便将读写流所需的 trait 引入作用域。相比在 `main` 的 `for` 中在获取到连接时打印信息，现在调用新的 `handle_connection` 函数并向其传递 `stream`。

在 `handle_connection` 中，通过 `mut` 关键字将 `stream` 参数变为可变。我们将从流中读取数据，所以它需要是可修改的。

接下来，需要实际读取流。这里分两步进行：首先，在栈上声明一个 `buffer` 来存放读取到的数据。这里创建了一个 512 字节的缓冲区，它足以存放基本请求的数据。这对于本章的目的来说是足够的。如果希望处理任意大小的请求，管理所需的缓冲区将更复杂，不过现在一切从简。接着将缓冲区传递给 `stream.read` ，它会从 `TcpStream` 中读取字节并放入缓冲区中。

接下来将缓冲区中的字节转换为字符串并打印出来。`String::from_utf8_lossy` 函数获取一个 `&[u8]` 并产生一个 `String`。函数名的 “lossy” 部分来源于当其遇到无效的 UTF-8 序列时的行为：它使用  �，`U+FFFD REPLACEMENT CHARACTER`，来代替无效序列。你可能会在缓冲区的剩余部分看到这些替代字符，因为他们没有被请求数据填满。

让我们试一试！启动程序并再次在浏览器中发起请求。注意浏览器中仍然会出现错误页面，不过终端中程序的输出现在看起来像这样：

```
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42 secs
     Running `target/debug/hello`
Request: GET / HTTP/1.1
Host: 127.0.0.1:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101
Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
������������������������������������
```

根据使用的浏览器不同可能会出现稍微不同的数据。也可能会看到请求重复出现。现在我们打印出了请求数据，可以通过观察 `Request: GET` 之后的路径来解释为何会从浏览器得到多个连接。如果重复的连接都是请求 `/`，就知道了浏览器尝试重复获取 `/` 因为它没有得到响应。

拆开请求数据来理解浏览器向我们请求了什么。HTTP 是一个基于文本的协议，而一个请求有如下格式：

```
Method Request-URI HTTP-Version CRLF
headers CRLF
message-body
```

第一行叫做 **请求行**（*request line*），它存放了客户端请求了什么的信息。请求行的第一部分是 *method*，比如 `GET` 或 `POST`，这描述了客户端如何进行请求。

接着是请求的 *URI*，它代表 **统一资源标识符**（*Uniform Resource Identifier*），URI 大体上类似，但也不完全类似于 URL（**统一资源定位符**，*Uniform Resource Locators*），我们通常将其称为输入到浏览器中的地址。HTTP 规范使用术语 URI，而 URI 和 URL 之间的区别对于本章的目的来说并不重要，所以心理上将 URL 替换为 URI 即可。

接下来，是客户端使用的 HTTP 版本，接着请求行以一个 CRLF 序列结尾。CRLF 序列也可以写作 `\r\n`：`\r` 是 **回车**（*carriage return*）而 `\n` 是 **换行**（*line feed*）。这些术语来自打字机时代！CRLF 序列将请求行与其他请求数据分开。

看看代码打印出的请求行的数据：

```text
GET / HTTP/1.1
```

`GET` 是 method，`/` 是请求 URI，而 `HTTP/1.1` 是版本。

从 `Host:` 开始的其余的行是 headers；`GET` 请求没有 body。

如果你希望的话，尝试用不同的浏览器发送请求，或请求不同的地址，比如 `127.0.0.1:8080/test`，来观察请求数据如何变化。

现在我们知道了浏览器请求了什么。让我们返回一些数据！

### 编写响应

现在向浏览器返回数据以响应请求。响应有如下格式：

```
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

第一行叫做 **状态行**（*status line*），它包含响应的 HTTP 版本、一个数字状态码用以总结请求的结果和一个描述之前状态码的文本原因。CRLF 序列之后是任意 header，另一个 CRLF 序列，和响应的 body。

这里是一个使用 HTTP 1.1 版本的响应例子，其状态码为 `200`，原因描述为 `OK`，没有 header，也没有 body：

```
HTTP/1.1 200 OK\r\n\r\n
```

这些文本是一个微型的成功 HTTP 响应。让我们把这些写入流！去掉打印请求信息的 `println!` 行，并在这里增加如列表 20-3 所示的代码：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];

    stream.read(&mut buffer).unwrap();

    let response = "HTTP/1.1 200 OK\r\n\r\n";

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

<span class="caption">列表 20-3：将一个微型成功 HTTP 响应写入流</span>

新代码中的第一行定义了变量 `response` 来存放将要返回的成功响应的数据。接着，在 `response` 上调用 `as_bytes`，因为 `stream` 的 `write` 方法获取一个 `&[u8]` 并直接将这些字节发送给连接。

`write` 可能会失败，所以 `write` 返回 `Result<T, E>`；我们继续使用 `unwrap` 以继续本章的核心内容而不是处理错误。最后，`flush` 会等待直到所有字节都被写入连接中；`TcpStream` 包含一个内部缓冲区来最小化对底层操作系统的调用。

有了这些修改，运行我们的代码并进行请求！我们不再向终端打印任何数据，所以不会再看到除了 Cargo 以外的任何输出。不过当在浏览器中加载 `127.0.0.1:8080` 时，会得到一个空页面而不是错误。太棒了！我们刚刚手写了一个 HTTP 请求与响应。

### 返回真正的 HTML

让我们不只是返回空页面。在项目根目录创建一个新文件，*hello.html*，也就是说，不是在 `src` 目录。在此可以放入任何你期望的 HTML；列表 20-4 展示了本书作者所采用的：

<span class="filename">文件名: hello.html</span>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Hello!</h1>
    <p>Hi from Rust</p>
  </body>
</html>
```

<span class="caption">列表 20-4：一个简单的 HTML 文件用来作为响应</span>

这是一个极小化的 HTML 5 文档，它有一个标题和一小段文本。如列表 20-5 所示修改 `handle_connection` 来读取 HTML 文件，将其加入到响应的 body 中，并发送：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
use std::fs::File;

// ...snip...

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    stream.read(&mut buffer).unwrap();

    let mut file = File::open("hello.html").unwrap();

    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();

    let response = format!("HTTP/1.1 200 OK\r\n\r\n{}", contents);

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
```

<span class="caption">列表 20-5：将 *hello.html* 的内容作为响应 body 发送</span>

在开头增加了一行来将标准库中的 `File` 引入作用域，打开和读取文件的代码应该看起来很熟悉，因为第十二章 I/O 项目的列表 12-4 中读取文件内容时出现过类似的代码。

接下来，使用 `format!` 将文件内容加入到将要写入流的成功响应的 body 中。

使用 `cargo run` 运行程序，在浏览器加载 `127.0.0.1:8080`，你应该会看到渲染出来的 HTML 文件！

注意目前忽略了 `buffer` 中的请求数据并无条件的发送了 HTML 文件的内容。尝试在浏览器中请求 `127.0.0.1:8080/something-else` 也会得到同样的 HTML。对于所有请求都发送相同的响应其作用是非常有限的，也不是大部分 server 所做的；让我们检查请求并只对格式良好（well-formed）的请求 `/` 发送 HTML 文件。

### 验证请求并有选择的响应

目前我们的 server 不管客户端请求什么都会返回相同的 HTML 文件。让我们检查浏览器是否请求 `/`， 并在其请求其他内容时返回错误。如列表 20-6 所示修改 `handle_connection` ，它增加了所需的那部分代码。这一部分将接收到的请求的内容与已知的 `/` 请求的一部分做比较，并增加了 `if` 和 `else` 块来加入处理不同请求的代码：

<span class="filename">Filename: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
// ...snip...

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    stream.read(&mut buffer).unwrap();

    let get = b"GET / HTTP/1.1\r\n";

    if buffer.starts_with(get) {
        let mut file = File::open("hello.html").unwrap();

        let mut contents = String::new();
        file.read_to_string(&mut contents).unwrap();

        let response = format!("HTTP/1.1 200 OK\r\n\r\n{}", contents);

        stream.write(response.as_bytes()).unwrap();
        stream.flush().unwrap();
    } else {
        // some other request
    };
}
```

<span class="caption">列表 20-6：将请求与期望的 `/` 请求内容做匹配，并设置对 `/` 和其他请求的条件化处理</span>

这里在变量 `get` 中硬编码了所需的请求相关的数据。因为我们从缓冲区中读取原始字节，所以使用了字节字符串，使用 `b""` 使得 `get` 也是一个字节字符串。接着检查 `buffer` 是否以 `get` 中的字节开头。如果是，这就是一个格式良好的 `/` 请求，也就是 `if` 块中期望处理的成功情况。`if` 块中包含列表 20-5 中增加的返回 HTML 文件内容的代码。

如果 `buffer` 不以 `get` 中的字节开头，就说明是其他请求。对于所有其他请求都将使用 `else` 块中增加的代码来响应。

如果运行代码并请求 `127.0.0.1:8080`，就会得到 *hello.html* 中的 HTML。如果进行其他请求，比如 `127.0.0.1:8080/something-else`，则会得到像运行列表 20-1 和 20-2 中代码那样的连接错误。

如列表 20-7 所示向 `else` 块增加代码来返回一个带有 `404` 状态码的响应，这代表了所请求的内容没有找到。接着也会返回一个 HTML 向浏览器终端用户表明此意：

<span class="filename">Filename: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
# fn handle_connection(mut stream: TcpStream) {
# if true {
// ...snip...

} else {
    let header = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
    let mut file = File::open("404.html").unwrap();
    let mut contents = String::new();

    file.read_to_string(&mut contents).unwrap();

    let response = format!("{}{}", header, contents);

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
# }
```

<span class="caption">列表 20-7：对于任何不是 `/` 的请求返回 `404` 状态码的响应和错误页面</span>

这里，响应头有状态码 `404` 和原因短语 `NOT FOUND`。仍然没有任何 header，而其 body 将是 *404.html* 文件中的 HTML。也在 *hello.html* 同级目录创建 *404.html* 文件作为错误页面；这一次也可以随意使用任何 HTML 或使用列表 20-8 中的示例 HTML：

<span class="filename">文件名: 404.html</span>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hello!</title>
  </head>
  <body>
    <h1>Oops!</h1>
    <p>Sorry, I don't know what you're asking for.</p>
  </body>
</html>
```

<span class="caption">列表 20-8：任何 `404` 响应所返回错误页面内容样例</span>

有了这些修改，再次运行 server。请求 `127.0.0.1:8080` 应该会返回 *hello.html*，而对于任何其他请求，比如 `127.0.0.1:8080/foo`，应该会返回 *404.html* 中的错误 HTML！

`if` 和 `else` 块中的代码有很多的重复：他们都读取文件并将其内容写入流。这两个情况唯一的区别是状态行和文件名。将这些区别分别提取到一行 `if` 和 `else` 中，对状态行和文件名变量赋值；然后在读取文件和写入响应的代码中无条件的使用这些变量。重构后代码后的结果如列表 20-9 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
// ...snip...

fn handle_connection(mut stream: TcpStream) {
#     let mut buffer = [0; 512];
#     stream.read(&mut buffer).unwrap();
#
#     let get = b"GET / HTTP/1.1\r\n";
    // ...snip...

   let (status_line, filename) = if buffer.starts_with(get) {
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

<span class="caption">列表 20-9：重构代码使得 `if` 和 `else` 块中只包含两个情况所不同的代码</span>

这里，`if` 和 `else` 块所做的唯一的事就是在一个元组中返回合适的状态行和文件名的值；接着使用第十八章讲到的使用模式的 `let` 语句通过解构元组的两部分给 `filename` 和 `header` 赋值。

读取文件和写入响应的冗余代码现在位于 `if` 和 `else` 块之外，并会使用变量 `status_line` 和 `filename`。这样更易于观察这两种情况真正有何不同，并且如果需要改变如何读取文件或写入响应时只需要更新一处的代码。列表 20-9 中代码的行为与列表 20-8 完全一样。

好极了！我们有了一个 40 行左右 Rust 代码的小而简单的 server，它对一个请求返回页面内容而对所有其他请求返回 `404` 响应。

不过因为 server 运行于单线程中，它一次只能处理一个请求。让我们模拟一些慢请求来看看这如何会称为一个问题。
