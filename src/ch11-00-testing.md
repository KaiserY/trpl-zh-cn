# 测试

> [ch11-00-testing.md](https://github.com/rust-lang/book/blob/master/src/ch11-00-testing.md)
> <br>
> commit c9fd8eb1da7a79deee97020e8ad49af8ded78f9c


> Program testing can be a very effective way to show the presence of bugs, but it is hopelessly inadequate for showing their absence.
>
> Edsger W. Dijkstra, "The Humble Programmer" (1972)
>
> 软件测试是证明 bug 存在的有效方法，而证明它们不存在时则显得令人绝望的不足。
>
> Edsger W. Dijkstra，【谦卑的程序员】（1972）

Rust 是一个非常注重正确性的编程语言，不过正确性是一个难以证明的复杂主题。Rust 在其类型系统上下了很大的功夫，来确保程序像我们希望的那样运行，不过它并不有助于所有情况。为此，Rust 也包含为语言自身编写软件测试的支持。

例如，我们可以编写一个叫做`add_two`的函数，它的签名有一个整型参数并返回一个整型值。我们可以实现并编译这个函数，而 Rust 也会进行所有的类型检查和借用检查，正如我们之前见识过的那样。Rust 所**不能**检查的是，我们实现的这个函数是否返回了参数值加二后的值，而不是加 10 或者减 50！这也就是测试出场的地方。例如可以编写传递`3`给`add_two`函数并检查我们是否得到了`5`。任何时候修改了代码我们都可以运行测试来确保没有改变任何现有测试所指定的行为。

测试是一项技能，而且我们也不能期望在一本书的一个章节中就涉及到编写好的测试的所有内容。然而我们可以讨论的是 Rust 测试功能的机制。我们会讲到编写测试时会用到的注解和宏，Rust 提供用来运行测试的默认行为和选项，以及如何将测试组织成单元测试和集成测试。