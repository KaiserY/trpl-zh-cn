# Rust 程序设计语言

[Rust 程序设计语言](title-page.md)
[前言](foreword.md)
[简介](ch00-00-introduction.md)

## 入门指南

- [入门指南](ch01-00-getting-started.md)
    - [安装](ch01-01-installation.md)
    - [Hello, World!](ch01-02-hello-world.md)
    - [Hello, Cargo!](ch01-03-hello-cargo.md)

- [写个猜数字游戏](ch02-00-guessing-game-tutorial.md)

- [常见编程概念](ch03-00-common-programming-concepts.md)
    - [变量与可变性](ch03-01-variables-and-mutability.md)
    - [数据类型](ch03-02-data-types.md)
    - [函数](ch03-03-how-functions-work.md)
    - [注释](ch03-04-comments.md)
    - [控制流](ch03-05-control-flow.md)

- [认识所有权](ch04-00-understanding-ownership.md)
    - [什么是所有权？](ch04-01-what-is-ownership.md)
    - [引用与借用](ch04-02-references-and-borrowing.md)
    - [Slice 类型](ch04-03-slices.md)

- [使用结构体组织相关联的数据](ch05-00-structs.md)
    - [结构体的定义和实例化](ch05-01-defining-structs.md)
    - [结构体示例程序](ch05-02-example-structs.md)
    - [方法语法](ch05-03-method-syntax.md)

- [枚举和模式匹配](ch06-00-enums.md)
    - [枚举的定义](ch06-01-defining-an-enum.md)
    - [`match` 控制流结构](ch06-02-match.md)
    - [`if let` 简洁控制流](ch06-03-if-let.md)

## 基本 Rust 技能

- [使用包、Crate 和模块管理不断增长的项目](ch07-00-managing-growing-projects-with-packages-crates-and-modules.md)
    - [包和 Crate](ch07-01-packages-and-crates.md)
    - [定义模块来控制作用域与私有性](ch07-02-defining-modules-to-control-scope-and-privacy.md)
    - [引用模块项目的路径](ch07-03-paths-for-referring-to-an-item-in-the-module-tree.md)
    - [使用 `use` 关键字将路径引入作用域](ch07-04-bringing-paths-into-scope-with-the-use-keyword.md)
    - [将模块拆分成多个文件](ch07-05-separating-modules-into-different-files.md)

- [常见集合](ch08-00-common-collections.md)
    - [使用 Vector 储存列表](ch08-01-vectors.md)
    - [使用字符串储存 UTF-8 编码的文本](ch08-02-strings.md)
    - [使用 Hash Map 储存键值对](ch08-03-hash-maps.md)

- [错误处理](ch09-00-error-handling.md)
    - [用 `panic!` 处理不可恢复的错误](ch09-01-unrecoverable-errors-with-panic.md)
    - [用 `Result` 处理可恢复的错误](ch09-02-recoverable-errors-with-result.md)
    - [要不要 `panic!`](ch09-03-to-panic-or-not-to-panic.md)

- [泛型、Trait 和生命周期](ch10-00-generics.md)
    - [泛型数据类型](ch10-01-syntax.md)
    - [Trait：定义共同行为](ch10-02-traits.md)
    - [生命周期确保引用有效](ch10-03-lifetime-syntax.md)

- [编写自动化测试](ch11-00-testing.md)
    - [如何编写测试](ch11-01-writing-tests.md)
    - [控制测试如何运行](ch11-02-running-tests.md)
    - [测试的组织结构](ch11-03-test-organization.md)

- [一个 I/O 项目：构建命令行程序](ch12-00-an-io-project.md)
    - [接受命令行参数](ch12-01-accepting-command-line-arguments.md)
    - [读取文件](ch12-02-reading-a-file.md)
    - [重构以改进模块化与错误处理](ch12-03-improving-error-handling-and-modularity.md)
    - [采用测试驱动开发完善库的功能](ch12-04-testing-the-librarys-functionality.md)
    - [处理环境变量](ch12-05-working-with-environment-variables.md)
    - [将错误信息输出到标准错误而不是标准输出](ch12-06-writing-to-stderr-instead-of-stdout.md)

## Rust 编程思想

- [Rust 中的函数式语言功能：迭代器与闭包](ch13-00-functional-features.md)
    - [闭包：可以捕获其环境的匿名函数](ch13-01-closures.md)
    - [使用迭代器处理元素序列](ch13-02-iterators.md)
    - [改进之前的 I/O 项目](ch13-03-improving-our-io-project.md)
    - [性能比较：循环对迭代器](ch13-04-performance.md)

- [更多关于 Cargo 和 Crates.io 的内容](ch14-00-more-about-cargo.md)
    - [采用发布配置自定义构建](ch14-01-release-profiles.md)
    - [将 crate 发布到 Crates.io](ch14-02-publishing-to-crates-io.md)
    - [Cargo 工作空间](ch14-03-cargo-workspaces.md)
    - [使用 `cargo install` 从 Crates.io 安装二进制文件](ch14-04-installing-binaries.md)
    - [Cargo 自定义扩展命令](ch14-05-extending-cargo.md)

- [智能指针](ch15-00-smart-pointers.md)
    - [使用 `Box<T>` 指向堆上数据](ch15-01-box.md)
    - [使用 `Deref` Trait 将智能指针当作常规引用处理](ch15-02-deref.md)
    - [使用 `Drop` Trait 运行清理代码](ch15-03-drop.md)
    - [`Rc<T>` 引用计数智能指针](ch15-04-rc.md)
    - [`RefCell<T>` 与内部可变性模式](ch15-05-interior-mutability.md)
    - [引用循环会导致内存泄漏](ch15-06-reference-cycles.md)

- [无畏并发](ch16-00-concurrency.md)
    - [使用线程同时地运行代码](ch16-01-threads.md)
    - [使用消息传递在线程间通信](ch16-02-message-passing.md)
    - [共享状态并发](ch16-03-shared-state.md)
    - [使用 `Sync` 与 `Send` Traits 的可扩展并发：](ch16-04-extensible-concurrency-sync-and-send.md)

- [Rust 的面向对象编程特性](ch17-00-oop.md)
    - [面向对象语言的特点](ch17-01-what-is-oo.md)
    - [顾及不同类型值的 trait 对象](ch17-02-trait-objects.md)
    - [面向对象设计模式的实现](ch17-03-oo-design-patterns.md)

## 高级主题

- [模式与模式匹配](ch18-00-patterns.md)
    - [所有可能会用到模式的位置](ch18-01-all-the-places-for-patterns.md)
    - [Refutability（可反驳性）: 模式是否会匹配失效](ch18-02-refutability.md)
    - [模式语法](ch18-03-pattern-syntax.md)

- [高级特征](ch19-00-advanced-features.md)
    - [不安全的 Rust](ch19-01-unsafe-rust.md)
    - [高级 trait](ch19-03-advanced-traits.md)
    - [高级类型](ch19-04-advanced-types.md)
    - [高级函数与闭包](ch19-05-advanced-functions-and-closures.md)
    - [宏](ch19-06-macros.md)

- [最后的项目：构建多线程 web server](ch20-00-final-project-a-web-server.md)
    - [建立单线程 web server](ch20-01-single-threaded.md)
    - [将单线程 server 变为多线程 server](ch20-02-multithreaded.md)
    - [优雅停机与清理](ch20-03-graceful-shutdown-and-cleanup.md)

- [附录](appendix-00.md)
    - [A - 关键字](appendix-01-keywords.md)
    - [B - 运算符与符号](appendix-02-operators.md)
    - [C - 可派生的 trait](appendix-03-derivable-traits.md)
    - [D - 实用开发工具](appendix-04-useful-development-tools.md)
    - [E - 版本](appendix-05-editions.md)
    - [F - 本书译本](appendix-06-translation.md)
    - [G - Rust 是如何开发的与 “Nightly Rust”](appendix-07-nightly-rust.md)
