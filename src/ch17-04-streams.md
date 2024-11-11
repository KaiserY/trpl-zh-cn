## 流（Streams）

> [ch17-04-streams.md](https://github.com/rust-lang/book/blob/main/src/ch17-04-streams.md)
> <br>
> commit f04d20fe8d1a49c3bffa10a3086c58e527ff0a90

到本章的目前为止，我们大部分时间停留在独立的 future 上。一个大的例外就是我们用过的异步信道。回忆一下在本章之前的 [“消息传递”][17-02-messages] 中我们如何使用的异步信道的。异步 `recv` 方法随着时间的推移产生一个序列的项。这是一个通用的多的模式的实例，通常被称为 *流*（*stream*）。

一个序列的项是我们之前是见过的，回忆一下第十三章的 `Iterator` trait，不过迭代器和异步信道接收端有两个区别。第一个区别是时间元素：迭代器是同步的，而信道接收端是异步的。第二个区别是 API。当直接处理 `Iterator` 时，我们会调用其 `next` 方法。对于这个特定的 `trpl::Receiver` 流，我们调用一个异步的 `recv` 方法，不过这些 API 看起来非常相似。



[17-02-messages]: ch17-02-concurrency-with-async.html#消息传递
