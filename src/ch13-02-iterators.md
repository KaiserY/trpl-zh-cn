## 迭代器

> [ch13-02-iterators.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-02-iterators.md)
> <br>
> commit b9459971e4bc6f37b4d18b38c6fe9221317fd985

迭代器模式允许你对一个项的序列进行某些处理。**迭代器**（*iterator*）负责遍历序列中的每一项和决定序列何时结束的逻辑。当使用迭代器时，我们无需重新实现这些逻辑。

在 Rust 中，迭代器是 **惰性的**（*lazy*），这意味着直到调用方法消费迭代器之前它都不会有效果。例如，列表 13-13 中的代码创建