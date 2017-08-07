## 单线程 web server

> [ch20-01-single-threaded.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-01-single-threaded.md)
> <br>
> commit 2e269ff82193fd65df8a87c06561d74b51ac02f7

首先让我们创建一个可运行的单线程 web server。我们将处理 TCP 和 HTTP 请求和响应的原始字节来从 server 向浏览器发送 HTML。首先先快速了解一下涉及到的协议。

**超文本传输协议**（*Hypertext Transfer Protocol*，*HTTP*）驱动着现在的互联网，它构建于**传输控制协议**（*Transmission Control Protocol*，*TCP*）的基础上。这里并不会过多的涉及细节，只做简单的概括：TCP 是一个底层协议，HTTP 是 TCP 之上的高级协议。这两个都是一种被称为**请求-响应协议**（*request-response protocol*）的协议，也就是说，有**客户端**（*client*）来初始化请求，并有**服务端**（*server*）监听请求并向客户端提供响应。请求与响应的内容由协议本身定义。

