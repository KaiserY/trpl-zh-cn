## 构建单线程 web server

> [ch20-01-single-threaded.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-01-single-threaded.md)
> <br>
> commit 90e6737d534cb66102674d183d2ef1966b190c2c

首先让我们创建一个可运行的单线程 web server，不过在开始之前，我们将快速了解一下构建 web server 所涉及到的协议。这些协议的细节超出了本书的范畴，不过一个简单的概括会提供你所需的信息。

web server 中涉及到的两个主要协议是 **超文本传输协议**（*Hypertext Transfer Protocol*，*HTTP*）和 **传输控制协议**（*Transmission Control Protocol*，*TCP*）。这两者都是 **请求-响应**（*request-response*）协议，也就是说，有 **客户端**（*client*）来初始化请求，并有 **服务端**（*server*）监听请求并向客户端提供响应。请求与响应的内容由协议本身定义。

TCP 是一个底层协议，它描述了信息如何从一个 server 到另一个的细节，不过其并不指定信息是什么。HTTP 构建于 TCP 之上，它定义了请求和响应的内容。为此，技术上讲可将 HTTP 用于其他协议之上，不过对于绝大部分情况，HTTP 通过 TCP 传输。我们将要做的就是处理 TCP 和 HTTP 请求与响应的原始字节数据。

### 监听 TCP 连接

所以我们的 web server 所需做的第一件事便是能够监听 TCP 连接。标准库提供了 `std::net` 模块处理这些功能。让我们一如既往新建一个项目：

```text
$ cargo new hello --bin
     Created binary (application) `hello` project
$ cd hello
```

并在 `src/main.rs` 输入示例 20-1 中的代码作为开始。这段代码会在地址 `127.0.0.1:7878` 上监听传入的 TCP 流。当获取到传入的流，它会打印出 `Connection established!`：

<span class="filename">文件名: src/main.rs</span>

```rust,no_run
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        println!("Connection established!");
    }
}
```

<span class="caption">示例 20-1: 监听传入的流并在接收到流时打印信息</span>

`TcpListener` 用于监听 TCP 连接。我们选择监听地址 `127.0.0.1:7878`。将这个地址拆开，冒号之前的部分是一个代表本机的 IP 地址（这个地址在每台计算机上都相同，并不特指作者的计算机），而 `7878` 是端口。选择这个端口出于两个原因：通常 HTTP 接受这个端口而且 7878 在电话上打出来就是 "rust"（译者注：九宫格键盘上的英文）。注意连接 80 端口需要管理员权限；非管理员用户只能监听大于 1024 的端口。

在这个场景中 `bind` 函数类似于 `new` 函数，在这里它返回一个新的 `TcpListener` 实例。这个函数叫做 `bind` 是因为，在网络领域，连接到监听端口被称为 “绑定到一个端口”（“binding to a port”）

`bind` 函数返回 `Result<T, E>`，这表明绑定可能会失败，例如，如果不是管理员尝试连接 80 端口，或是如果运行两个此程序的实例这样会有两个程序监听相同的端口，绑定会失败。因为我们是出于学习目的来编写一个基础的 server，将不用关心处理这类错误，使用 `unwrap` 在出现这些情况时直接停止程序。

`TcpListener` 的 `incoming` 方法返回一个迭代器，它提供了一系列的流（更准确的说是 `TcpStream` 类型的流）。**流**（*stream*）代表一个客户端和服务端之间打开的连接。**连接**（*connection*）代表客户端连接服务端、服务端生成响应以及服务端关闭连接的全部请求 / 响应过程。为此，`TcpStream` 允许我们读取它来查看客户端发送了什么，并可以编写响应。总体来说，这个 `for` 循环会依次处理每个连接并产生一系列的流供我们处理。

<!-- Below -- What if there aren't errors, how is the stream handled? Or is
there no functionality for that yet, only functionality for errors?
Also, highlighted below -- can you specify what errors we're talking
about---errors in *producing* the streams or connecting to the port?-->
<!--
There is no functionality for a stream without errors yet; I've clarified.
The errors happen when a client attempts to connect to the server; I've
clarified.
/Carol -->

目前为止，处理流的过程包含 `unwrap` 调用，如果出现任何错误会终止程序，如果没有任何错误，则打印出信息。下一个示例我们将为成功的情况增加更多功能。当客户端连接到服务端时 `incoming` 方法返回错误是可能的，因为我们实际上没有遍历连接，而是遍历 **连接尝试**（*connection attempts*）。连接可能会因为很多原因不能成功，大部分是操作系统相关的。例如，很多系统限制同时打开的连接数；新连接尝试产生错误，直到一些打开的连接关闭为止。



让我们试试这段代码！首先在终端执行 `cargo run`，接着在浏览器中加载 `127.0.0.1:7878`。浏览器会显示出看起来类似于“连接重置”（“Connection reset”）的错误信息，因为 server 目前并没响应任何数据。但是如果我们观察终端，会发现当浏览器连接 server 时会打印出一系列的信息！

```text
     Running `target/debug/hello`
Connection established!
Connection established!
Connection established!
```

有时会看到对于一次浏览器请求会打印出多条信息；这可能是因为浏览器在请求页面的同时还请求了其他资源，比如出现在浏览器 tab 标签中的 `favicon.ico`。

这也可能是因为浏览器尝试多次连接 server，因为 server 没有响应任何数据。当 `stream` 在循环的结尾离开作用域并被丢弃，其连接将被关闭，作为 `drop` 实现的一部分。浏览器有时通过重连来处理关闭的连接，因为这些问题可能是暂时的。现在重要的是我们成功的处理了 TCP 连接！

记得当运行完特定版本的代码后使用 <span class="keystroke">ctrl-C</span> 来停止程序，并在做出最新的代码修改之后执行 `cargo run` 重启服务。

### 读取请求

让我们实现读取来自浏览器请求的功能！为了分离获取连接和接下来对连接的操作的相关内容，我们将开始一个新函数来处理连接。在这个新的 `handle_connection` 函数中，我们从 TCP 流中读取数据并打印出来以便观察浏览器发送过来的数据。将代码修改为如示例 20-2 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,no_run
use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

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

<span class="caption">示例 20-2: 读取 `TcpStream` 并打印数据</span>

这里将 `std::io::prelude` 引入作用域来获取读写流所需的特定 trait。在 `main` 函数的 `for` 循环中，相比获取到连接时打印信息，现在调用新的 `handle_connection` 函数并向其传递 `stream`。

在 `handle_connection` 中，`stream` 参数是可变的。

我们将从流中读取数据，所以它需要是可修改的。这是因为 `TcpStream` 实例在内部记录了所返回的数据。它可能读取了多于我们请求的数据并保存它们以备下一次请求数据。因此它需要是 `mut` 的因为其内部状态可能会改变；通常我们认为 “读取” 不需要可变性，不过在这个例子中则需要 `mut` 关键字。

<!-- Above -- I'm not clear what state will change here, the content of stream
when the program tempers what data it takes? -->
<!-- Yes, which is what we mean by "internally". I've tried to reword a bit,
not sure if it's clearer. /Carol -->

接下来，需要实际读取流。这里分两步进行：首先，在栈上声明一个 `buffer` 来存放读取到的数据。这里创建了一个 512 字节的缓冲区，它足以存放基本请求的数据并满足本章的目的需要。如果希望处理任意大小的请求，缓冲区管理将更为复杂，不过现在一切从简。接着将缓冲区传递给 `stream.read` ，它会从 `TcpStream` 中读取字节并放入缓冲区中。

接下来将缓冲区中的字节转换为字符串并打印出来。`String::from_utf8_lossy` 函数获取一个 `&[u8]` 并产生一个 `String`。函数名的 “lossy” 部分来源于当其遇到无效的 UTF-8 序列时的行为：它使用  �，`U+FFFD REPLACEMENT CHARACTER`，来代替无效序列。你可能会在缓冲区的剩余部分看到这些替代字符，因为他们没有被请求数据填满。

让我们试一试！启动程序并再次在浏览器中发起请求。注意浏览器中仍然会出现错误页面，不过终端中程序的输出现在看起来像这样：

```text
$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 0.42 secs
     Running `target/debug/hello`
Request: GET / HTTP/1.1
Host: 127.0.0.1:7878
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101
Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
������������������������������������
```

根据使用的浏览器不同可能会出现稍微不同的数据。现在我们打印出了请求数据，可以通过观察 `Request: GET` 之后的路径来解释为何会从浏览器得到多个连接。如果重复的连接都是请求 `/`，就知道了浏览器尝试重复获取 `/` 因为它没有从程序得到响应。

拆开请求数据来理解浏览器向程序请求了什么。

#### 仔细观察 hTTP 请求

HTTP 是一个基于文本的协议，同时一个请求有如下格式：

```text
Method Request-URI HTTP-Version CRLF
headers CRLF
message-body
```

第一行叫做 **请求行**（*request line*），它存放了客户端请求了什么的信息。请求行的第一部分是所使用的 *method*，比如 `GET` 或 `POST`，这描述了客户端如何进行请求。这里客户端使用了 `GET` 请求。

<!-- Below, is that right that the / part is the URI *being requested*, and not
the URI of the requester? -->
<!-- Yes /Carol -->

`Request` 行接下来的部分是 `/`，它代表客户端请求的 **统一资源标识符**（*Uniform Resource Identifier*，*URI*） —— URI 大体上类似，但也不完全类似于 URL（**统一资源定位符**，*Uniform Resource Locators*）。URI 和 URL 之间的区别对于本章的目的来说并不重要，不过 HTTP 规范使用术语 URI，所以这里可以简单的将 URL 理解为 URI。

最后，是客户端使用的 HTTP 版本，接着请求行以一个 CRLF 序列结尾。CRLF 序列也可以写作 `\r\n`：`\r` 是 **回车**（*carriage return*）而 `\n` 是 **换行**（*line feed*）（这些术语来自打字机时代！）。注意当 CRLF 被打印时，会看到开始了一个新行而不是 `\r\n`。

<!-- Above, I don't see a CRLF here in the request line in the actual output,
is it just implied because the next line begins on the next line? -->
<!-- Yes, I've clarified. /Carol -->

观察目前运行程序所接收到的数据的请求行，可以看到 `GET` 是 method，`/` 是请求 URI，而 `HTTP/1.1` 是版本。

从 `Host:` 开始的其余的行是 headers；`GET` 请求没有 body。

如果你希望的话，尝试用不同的浏览器发送请求，或请求不同的地址，比如 `127.0.0.1:7878/test`，来观察请求数据如何变化。

现在我们知道了浏览器请求了什么。让我们返回一些数据！

### 编写响应

我们将实现在客户端请求的响应中发送数据的功能。响应有如下格式：

```text
HTTP-Version Status-Code Reason-Phrase CRLF
headers CRLF
message-body
```

第一行叫做 **状态行**（*status line*），它包含响应的 HTTP 版本、一个数字状态码用以总结请求的结果和一个描述之前状态码的文本原因短语。CRLF 序列之后是任意 header，另一个 CRLF 序列，和响应的 body。

这里是一个使用 HTTP 1.1 版本的响应例子，其状态码为 `200`，原因短语为 `OK`，没有 header，也没有 body：

```text
HTTP/1.1 200 OK\r\n\r\n
```

状态码 200 是一个标准的成功响应。这些文本是一个微型的成功 HTTP 响应。让我们将这些文本写入流作为成功请求的响应！

在 `handle_connection` 函数中，我们需要去掉打印请求数据的 `println!`，并替换为示例 20-3 中的代码：

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

<span class="caption">示例 20-3: 将一个微型成功 HTTP 响应写入流</span>

<!-- Flagging for addition of wingdings later -->

新代码中的第一行定义了变量 `response` 来存放将要返回的成功响应的数据。接着，在 `response` 上调用 `as_bytes`，因为 `stream` 的 `write` 方法获取一个 `&[u8]` 并直接将这些字节发送给连接。

<!-- Above--So what does adding as_bytes actually do, *allow* us to send bytes
directly? -->
<!-- It converts the string data to bytes, I've clarified /Carol -->

因为 `write` 操作可能会失败，所以像之前那样对任何错误结果使用 `unwrap`。同理，在真实世界的应用中这里需要添加错误处理。最后，`flush` 会等待并阻塞程序执行直到所有字节都被写入连接中；`TcpStream` 包含一个内部缓冲区来最小化对底层操作系统的调用。

<!-- Above -- Will flush wait until all bytes are written and then do
something? I'm not sure what task it's performing -->
<!-- `flush` just makes sure all the bytes we sent to `write` are actually
written to the stream before the function ends. Because writing to a stream
takes time, the `handle_connection` function could potentially finish and
`stream` could go out of scope before all the bytes given to `write` are sent,
unless we call `flush`. This is how streams work in many languages and is a
small detail I don't think is worth going into in depth. /Carol -->

有了这些修改，运行我们的代码并进行请求！我们不再向终端打印任何数据，所以不会再看到除了 Cargo 以外的任何输出。不过当在浏览器中加载 `127.0.0.1:8080` 时，会得到一个空页面而不是错误。太棒了！我们刚刚手写了一个 HTTP 请求与响应。

### 返回真正的 HTML

让我们实现不只是返回空页面的功能。在项目根目录创建一个新文件，*hello.html* —— 也就是说，不是在 `src` 目录。在此可以放入任何你期望的 HTML；列表 20-4 展示了一个可能的文本：

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

<span class="caption">示例 20-4: 一个简单的 HTML 文件用来作为响应</span>

这是一个极小化的 HTML 5 文档，它有一个标题和一小段文本。为了在 server 接受请求时返回它，需要如示例 20-5 所示修改 `handle_connection` 来读取 HTML 文件，将其加入到响应的 body 中，并发送：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
use std::fs::File;

// --snip--

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

<span class="caption">示例 20-5: 将 *hello.html* 的内容作为响应 body 发送</span>

在开头增加了一行来将标准库中的 `File` 引入作用域。打开和读取文件的代码应该看起来很熟悉，因为第十二章 I/O 项目的示例 12-4 中读取文件内容时出现过类似的代码。

接下来，使用 `format!` 将文件内容加入到将要写入流的成功响应的 body 中。

使用 `cargo run` 运行程序，在浏览器加载 `127.0.0.1:7878`，你应该会看到渲染出来的 HTML 文件！

目前忽略了 `buffer` 中的请求数据并无条件的发送了 HTML 文件的内容。这意味着如果尝试在浏览器中请求 `127.0.0.1:8080/something-else` 也会得到同样的 HTML 响应。如此其作用是非常有限的，也不是大部分 server 所做的；让我们检查请求并只对格式良好（well-formed）的请求 `/` 发送 HTML 文件。

### 验证请求并有选择的进行响应

目前我们的 web server 不管客户端请求什么都会返回相同的 HTML 文件。让我们增加在返回 HTML 文件前检查浏览器是否请求 `/`，并在其请求任何其他内容时返回错误的功能。为此需要如示例 20-6 那样修改 `handle_connection`。新代码接收到的请求的内容与已知的 `/` 请求的一部分做比较，并增加了 `if` 和 `else` 块来区别处理请求：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
// --snip--

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
    }
}
```

<span class="caption">示例 20-6: 匹配请求并区别处理 `/` 请求与其他请求</span>

首先，将与 `/` 请求相关的数据硬编码进变量 `get`。因为我们将原始字节读取进了缓冲区，所以在 `get` 的数据开头增加 `b""` 字节字符串语法将其转换为字节字符串。接着检查 `buffer` 是否以 `get` 中的字节开头。如果是，这就是一个格式良好的 `/` 请求，也就是 `if` 块中期望处理的成功情况，并会返回 HTML 文件内容的代码。


如果 `buffer` **不** 以 `get` 中的字节开头，就说明接收的是其他请求。之后会在  `else` 块中增加代码来响应所有其他请求。

现在如果运行代码并请求 `127.0.0.1:7878`，就会得到 *hello.html* 中的 HTML。如果进行任何其他请求，比如 `127.0.0.1:7878/something-else`，则会得到像运行示例 20-1 和 20-2 中代码那样的连接错误。

现在向示例 20-7 的 `else` 块增加代码来返回一个带有 `404` 状态码的响应，这代表了所请求的内容没有找到。接着也会返回一个 HTML 向浏览器终端用户表明此意：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
# fn handle_connection(mut stream: TcpStream) {
# if true {
// --snip--

} else {
    let status_line = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
    let mut file = File::open("404.html").unwrap();
    let mut contents = String::new();

    file.read_to_string(&mut contents).unwrap();

    let response = format!("{}{}", status_line, contents);

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}
# }
```

<span class="caption">示例 20-7: 对于任何不是 `/` 的请求返回 `404` 状态码的响应和错误页面</span>

这里，响应的状态行有状态码 `404` 和原因短语 `NOT FOUND`。仍然没有返回任何 header，而其 body 将是 *404.html* 文件中的 HTML。需要在 *hello.html* 同级目录创建 *404.html* 文件作为错误页面；这一次也可以随意使用任何 HTML 或使用示例 20-8 中的示例 HTML：

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

<span class="caption">示例 20-8: 任何 `404` 响应所返回错误页面内容样例</span>

有了这些修改，再次运行 server。请求 `127.0.0.1:7878` 应该会返回 *hello.html* 的内容，而对于任何其他请求，比如 `127.0.0.1:7878/foo`，应该会返回 *404.html* 中的错误 HTML！

### 少量代码重构

目前 `if` 和 `else` 块中的代码有很多的重复：他们都读取文件并将其内容写入流。唯一的区别是状态行和文件名。为了使代码更为简明，将这些区别分别提取到一行 `if` 和 `else` 中，对状态行和文件名变量赋值；然后在读取文件和写入响应的代码中无条件的使用这些变量。重构后取代了大段 `if` 和 `else` 块代码后的结果如示例 20-9 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::io::prelude::*;
# use std::net::TcpStream;
# use std::fs::File;
// --snip--

fn handle_connection(mut stream: TcpStream) {
#     let mut buffer = [0; 512];
#     stream.read(&mut buffer).unwrap();
#
#     let get = b"GET / HTTP/1.1\r\n";
    // --snip--

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

<span class="caption">示例 20-9: 重构使得 `if` 和 `else` 块中只包含两个情况所不同的代码</span>

现在 `if` 和 `else` 块所做的唯一的事就是在一个元组中返回合适的状态行和文件名的值；接着使用第十八章讲到的使用模式的 `let` 语句通过解构元组的两部分为 `filename` 和 `header` 赋值。

之前读取文件和写入响应的冗余代码现在位于 `if` 和 `else` 块之外，并会使用变量 `status_line` 和 `filename`。这样更易于观察这两种情况真正有何不同，还意味着如果需要改变如何读取文件或写入响应时只需要更新一处的代码。示例 20-9 中代码的行为与示例 20-8 完全一样。

好极了！我们有了一个 40 行左右 Rust 代码的小而简单的 server，它对一个请求返回页面内容而对所有其他请求返回 `404` 响应。

目前 server 运行于单线程中，它一次只能处理一个请求。让我们模拟一些慢请求来看看这如何会成为一个问题，并进行修复以便 server 可以一次处理多个请求。
