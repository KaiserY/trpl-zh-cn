## 性能：循环 VS 迭代器

[ch13-04-performance.md](https://github.com/rust-lang/book/blob/4b71f17f7daba738a1363862dacb818d9b12fb81/src/ch13-04-performance.md)

为了决定是否使用循环或迭代器，你需要了解哪个实现更快：使用显式 `for` 循环的 `search` 函数版本，还是使用迭代器的版本。

我们进行了一个基准测试，将阿瑟·柯南·道尔的《福尔摩斯探案集》全文加载到一个 `String` 中，并在内容中查找单词 *the*。以下是使用 `for` 循环版本和使用迭代器版本的 `search` 函数的基准测试结果：

```text
test bench_search_for  ... bench:  19,620,300 ns/iter (+/- 915,700)
test bench_search_iter ... bench:  19,234,900 ns/iter (+/- 657,200)
```

两种实现的性能相近！这里我们不会解释性能测试代码，因为重点并不是证明这两个版本完全等价，而是大致感受一下它们在性能上的对比。

对于更全面的基准测试，你应该尝试把不同大小的文本作为 `contents`、把不同的单词和不同长度的单词作为 `query`，再结合其他各种变化一起测试。重点在于：迭代器虽然是高级抽象，但编译出的代码和你手写底层代码时大致相同。迭代器是 Rust 的**零成本抽象**（*zero-cost abstractions*）之一，也就是说使用这种抽象不会带来额外的运行时开销。这和 C++ 的最初设计者与实现者 Bjarne Stroustrup 在 2012 年 ETAPS 主题演讲《Foundations of C++》中对零开销的定义类似：

> In general, C++ implementations obey the zero-overhead principle: What you don't use, you don't pay for. And further: What you do use, you couldn't hand code any better.
>
> 总的来说，C++ 的实现遵循了零开销原则：不使用的功能无需为其付出代价；而已经使用的功能，也不可能通过手写代码做得更好。

在很多情况下，使用迭代器的 Rust 代码会编译成与你手写出来相同的汇编。像循环展开、消除数组访问边界检查这样的优化都会生效，并让最终生成的代码极其高效。现在你已经知道这一点了，就可以放心使用迭代器和闭包：它们让代码看起来更高层，但不会因此带来运行时性能损失。

## 总结

闭包和迭代器是 Rust 受函数式编程语言理念启发而来的特性。它们有助于 Rust 以低层性能清晰地表达高层概念。闭包和迭代器的实现不会影响运行时性能，这正是 Rust 致力于提供零成本抽象这一目标的一部分。

现在我们已经改进了 I/O 项目的表达力，接下来看看 `cargo` 的更多功能，它们会帮助我们把项目分享给全世界。
