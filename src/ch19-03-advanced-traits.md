## 高级 trait

> [ch19-03-advanced-traits.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-03-advanced-traits.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

第十章讲到了 trait，不过就像生命周期，我们并没有涉及所有的细节。现在我们更加了解 Rust 了，可以深入理解本质了。

### 关联类型

**关联类型**（*associated types*）是一个将类型占位符与 trait 相关联的方法，如此 trait 的方法定义的签名中就可以使用这些占位符类型。实现 trait 的类型将会在特定实现中指定所用的具体类型。

本章描述的大部分内容都非常少见。关联类型则比较适中；他们比本书其他的内容要少见，不过比本章很多的内容要更常见。

一个带有关联类型的 trait 的例子是标准库提供的 `Iterator` trait。