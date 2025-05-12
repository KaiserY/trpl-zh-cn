# 最后的项目：构建多线程 web server

> [ch21-00-final-project-a-web-server.md](https://github.com/rust-lang/book/blob/main/src/ch21-00-final-project-a-web-server.md)
> <br>
> commit 56ec353290429e6547109e88afea4de027b0f1a9

这是一次漫长的旅途，不过我们已经抵达了本书的结尾。在本章中，我们将一同构建另一个项目，来展示最后几章所学，同时复习更早的章节。

作为最后的项目，我们将要实现一个返回 “hello” 的 web server，它在浏览器中看起来就如图 21-1 所示：

![hello from rust](img/trpl21-01.png)

<span class="caption">图 21-1: 我们最后将一起分享的项目</span>

如下是构建 web server 的计划：

1. 学习一些 TCP 与 HTTP 知识
2. 在套接字（socket）上监听 TCP 请求
3. 解析少量的 HTTP 请求
4. 创建一个合适的 HTTP 响应
5. 通过线程池改善 server 的吞吐量

在开始之前，我们先提两点说明。首先，这里使用的方法并不是使用 Rust 构建 web server 的最佳方式。[crates.io](https://crates.io/) 上有很多可用于生产环境的 crate，它们提供了比我们所要编写的更为完整的 web server 和线程池实现。然而，本章的目的在于学习，而不是走捷径。因为 Rust 是一个系统编程语言，我们能够选择处理什么层次的抽象，并能够选择比其他语言可能或可用的层次更低的层次。

其次，我们不会在这里使用 async 和 await。构建线程池本身已经是一个相当大的挑战，无需再加入构建异步运行时的复杂度！不过，我们会指出 async 和 await 在本章中会遇到的一些问题上的可能应用。

因此我们将手动编写一个基础的 HTTP server 和线程池，以便学习将来可能用到的 crate 背后的通用理念和技术。
