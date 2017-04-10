# 一个 I/O 项目：构建一个小巧的 grep

> [ch12-00-an-io-project.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch12-00-an-io-project.md)
> <br>
> commit 1f432fc231cfbc310433ab2a354d77058444288c

<!-- We might need a more descriptive title, something that captures the new
elements we're introducing -- are we going to cover things like environment
variables more in later chapters, or is this the only place we explain how to
use them? -->

<!-- This is the only place we were planning on explaining both environment
variables and printing to standard error. These are things that people commonly
want to know how to do in Rust, but there's not much more than what we've said
here about them, people just want to know how to do them in Rust. We realize
that those sections make this chapter long, but think it's worth it to include
information that people want. We've gotten really positive feedback from people
who have read this chapter online; people who like learning through projects
have really enjoyed this chapter. /Carol-->

本章既是一个目前所学的很多技能的概括，也是一个更多标准库功能的探索。我们将构建一个与文件和命令行输入/输出交互的命令行工具来练习现在一些你已经掌握的 Rust 技能。

Rust 的运行速度、安全性、“单二进制文件”输出和跨平台支持使其成为创建命令行程序的绝佳选择，所以我们的项目将创建一个我们自己版本的经典命令行工具：`grep`。grep 是“Globally search a Regular Expression and Print.”的首字母缩写。`grep`最简单的使用场景是使用如下步骤在特定文件中搜索指定字符串：

- 获取一个文件和一个字符串作为参数。
- 读取文件
- 寻找文件中包含字符串参数的行
- 打印出这些行

我们还会展示如何使用环境变量和打印到标准错误而不是标准输出；这些功能在命令行工具中是很常用的。

一位 Rust 社区的成员，Andrew Gallant，已经创建了一个功能完整且非常快速的`grep`版本，叫做`ripgrep`。相比之下，我们的`grep`将非常简单，本章将交给你一些帮助你理解像`ripgrep`这样真实项目的背景知识。

这个项目将会结合之前所学的一些内容：

- 代码组织（使用第七章学习的模块）
- vector 和字符串（第八章，集合）
- 错误处理（第九章）
- 合理的使用 trait 和生命周期（第十章）
- 测试（第十一章）

另外，我还会简要的讲到闭包、迭代器和 trait 对象，他们分别会在第十三章和第十七章中详细介绍。

让我们一如既往的使用`cargo new`创建一个新项目。我们称之为`greprs`以便与可能已经安装在系统上的`grep`工具相区别：

```
$ cargo new --bin greprs
     Created binary (application) `greprs` project
$ cd greprs
```