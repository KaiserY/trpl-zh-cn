# 最后的项目: 构建多线程 web server

> [ch20-00-final-project-a-web-server.md](https://github.com/rust-lang/book/blob/master/src/ch20-00-final-project-a-web-server.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

这是一次漫长的旅途，不过我们到达了本书的结束。在本章中，我们将一同构建另一个项目，来展示最后几章所学，同时复习更早的章节。

作为最后的项目，我们将要实现一个返回 “hello” 的 web server，它在浏览器中看起来就如图例 20-1 所示：

![hello from rust](img/trpl20-01.png)

<span class="caption">图例 20-1: 我们最后将一起分享的项目</span>

如下是我们将怎样构建此 web server 的计划：

1. 学习一些 TCP 与 HTTP 知识
2. 在套接字（socket）上监听 TCP 请求
3. 解析少量的 HTTP 请求
4. 创建一个合适的 HTTP 响应
5. 通过线程池改善 server 的吞吐量

不过在开始之前，需要提到一点细节：这里使用的方法并不是使用 Rust 构建 web server 最好的方法。*https://crates.io* 上有很多可用于生产环境的 crate，它们提供了比我们所要编写的更为完整的 web server 和线程池实现。

然而，本章的目的在于学习，而不是走捷径。因为 Rust 是一个系统编程语言，我们能够选择处理什么层次的抽象，并能够选择比其他语言可能或可用的层次更低的层次。因此我们将自己编写一个基础的 HTTP server 和线程池，以便学习将来可能用到的 crate 背后的通用理念和技术。
