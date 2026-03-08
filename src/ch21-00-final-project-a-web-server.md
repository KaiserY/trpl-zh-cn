# 最后的项目：构建多线程 web server

[ch21-00-final-project-a-web-server.md](https://github.com/rust-lang/book/blob/8aa0d003e6499d733d639de32d70f590efa48657/src/ch21-00-final-project-a-web-server.md)

这是一次漫长的旅途，不过我们已经抵达了本书的结尾。在本章中，我们将一同构建另一个项目，来展示最后几章所学，同时复习更早的章节。

作为最后一个项目，我们要编写一个会说 “Hello!” 的 web server，它在浏览器中看起来会像图 21-1 那样：

<img alt="浏览器访问 127.0.0.1:8080 时显示一个网页，页面文字内容为“Hello! Hi from Rust”" src="img/trpl21-01.png" class="center" style="width: 50%;" />

<span class="caption">图 21-1：我们最后一个共同完成的项目</span>

下面是构建这个 web server 的计划：

1. 学一点 TCP 和 HTTP 相关知识。
2. 在套接字（socket）上监听 TCP 连接。
3. 解析少量 HTTP 请求。
4. 创建正确的 HTTP 响应。
5. 用线程池改善 server 的吞吐量。

在开始之前，我们先提两点说明。首先，这里使用的方法并不是使用 Rust 构建 web server 的最佳方式。[crates.io](https://crates.io/) 上有很多可用于生产环境的 crate，它们提供了比我们所要编写的更为完整的 web server 和线程池实现。然而，本章的目的在于学习，而不是走捷径。因为 Rust 是一个系统编程语言，我们能够选择处理什么层次的抽象，并能够选择比其他语言可能或可用的层次更低的层次。

其次，这里不会使用 async 和 await。仅仅构建一个线程池本身就已经足够有挑战性了，无需再把构建异步运行时的复杂度加进来！不过，我们会指出 async 和 await 可能如何适用于本章中遇到的一些相同问题。归根结底，正如我们在第十七章提到的那样，许多异步运行时本身也是借助线程池来管理工作的。

因此，我们将手动编写一个基础的 HTTP server 和线程池，这样你就能学到未来可能会用到的那些 crate 背后的通用思想和技术。
