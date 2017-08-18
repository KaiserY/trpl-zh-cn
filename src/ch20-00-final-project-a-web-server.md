# 最后的项目: 构建多线程 web server

> [ch20-00-final-project-a-web-server.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch20-00-final-project-a-web-server.md)
> <br>
> commit 08e50d5e147ad290d88efd5c58365000723626df

这是一次漫长的旅途，不过我们做到了！这一章便是本书的结束。离别是如此甜蜜的悲伤。不过在我们结束之前，再来一起构建另一个项目，来展示最后几章所学，同时复习更早的章节。

下面就是我们将要做的：一个简单的 web server：

![hello from rust](img/trpl20-01.png)

为此我们将：

1. 学习一些 TCP 与 HTTP 知识
2. 在套接字（socket）上监听 TCP 请求
3. 解析少量的 HTTP 请求
4. 创建一个合适的 HTTP 响应
5. 通过线程池改善 server 的吞吐量

在开始之前，需要提到一点：如果你曾在生产环境中编写过这样的代码，还有很多更好的做法。特别需要指出的是，crates.io 上提供了很多更完整健壮的 web server 和 线程池实现，要比我们编写的好很多。

然而，本章的目的在于学习，而不是走捷径。因为 Rust 是一个系统编程语言，能够选择处理什么层次的抽象。我们能够选择比其他语言可能或可用的层次更低的层次。所以我们将自己编写一个基础的 HTTP server 和线程池，以便学习将来可能用到的 crate 背后的通用理念和技术。
