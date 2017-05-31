# Rust 程序设计语言

## 入门指南

- [介绍](ch01-00-introduction.md)
    - [安装](ch01-01-installation.md)
    - [Hello, World!](ch01-02-hello-world.md)

- [猜猜看教程](ch02-00-guessing-game-tutorial.md)

- [通用编程概念](ch03-00-common-programming-concepts.md)
    - [变量和可变性](ch03-01-variables-and-mutability.md)
    - [数据类型](ch03-02-data-types.md)
    - [函数如何工作](ch03-03-how-functions-work.md)
    - [注释](ch03-04-comments.md)
    - [控制流](ch03-05-control-flow.md)

- [认识所有权](ch04-00-understanding-ownership.md)
    - [什么是所有权](ch04-01-what-is-ownership.md)
    - [引用 & 借用](ch04-02-references-and-borrowing.md)
    - [Slices](ch04-03-slices.md)

- [结构体](ch05-00-structs.md)
    - [方法语法](ch05-01-method-syntax.md)

- [枚举和模式匹配](ch06-00-enums.md)
    - [定义枚举](ch06-01-defining-an-enum.md)
    - [`match`控制流运算符](ch06-02-match.md)
    - [`if let`简单控制流](ch06-03-if-let.md)

## 基本 Rust 技能

- [模块](ch07-00-modules.md)
    - [`mod`和文件系统](ch07-01-mod-and-the-filesystem.md)
    - [使用`pub`控制可见性](ch07-02-controlling-visibility-with-pub.md)
    - [使用`use`导入命名](ch07-03-importing-names-with-use.md)

- [通用集合类型](ch08-00-common-collections.md)
    - [vector](ch08-01-vectors.md)
    - [字符串](ch08-02-strings.md)
    - [哈希 map](ch08-03-hash-maps.md)

- [错误处理](ch09-00-error-handling.md)
    - [`panic!`与不可恢复的错误](ch09-01-unrecoverable-errors-with-panic.md)
    - [`Result`与可恢复的错误](ch09-02-recoverable-errors-with-result.md)
    - [`panic!`还是不`panic!`](ch09-03-to-panic-or-not-to-panic.md)

- [泛型、trait 和生命周期](ch10-00-generics.md)
    - [泛型数据类型](ch10-01-syntax.md)
    - [trait：定义共享的行为](ch10-02-traits.md)
    - [生命周期与引用有效性](ch10-03-lifetime-syntax.md)

- [测试](ch11-00-testing.md)
    - [编写测试](ch11-01-writing-tests.md)
    - [运行测试](ch11-02-running-tests.md)
    - [测试的组织结构](ch11-03-test-organization.md)

- [一个 I/O 项目](ch12-00-an-io-project.md)
    - [接受命令行参数](ch12-01-accepting-command-line-arguments.md)
    - [读取文件](ch12-02-reading-a-file.md)
    - [增强错误处理和模块化](ch12-03-improving-error-handling-and-modularity.md)
    - [测试库的功能](ch12-04-testing-the-librarys-functionality.md)
    - [处理环境变量](ch12-05-working-with-environment-variables.md)
    - [输出到`stderr`而不是`stdout`](ch12-06-writing-to-stderr-instead-of-stdout.md)

## Rust 编程思想

- [Rust 中的函数式语言功能](ch13-00-functional-features.md)
    - [闭包](ch13-01-closures.md)
    - [迭代器](ch13-02-iterators.md)
    - [改进 I/O 项目](ch13-03-improving-our-io-project.md)
    - [性能](ch13-04-performance.md)

- [更多关于 Cargo 和 Crates.io](ch14-00-more-about-cargo.md)
    - [发布配置](ch14-01-release-profiles.md)
    - [将 crate 发布到 Crates.io](ch14-02-publishing-to-crates-io.md)
    - [Cargo 工作空间](ch14-03-cargo-workspaces.md)
    - [使用`cargo install`从 Crates.io 安装文件](ch14-04-installing-binaries.md)
    - [Cargo 自定义扩展命令](ch14-05-extending-cargo.md)

- [智能指针](ch15-00-smart-pointers.md)
    - [`Box<T>`用于已知大小的堆上数据](ch15-01-box.md)
    - [`Deref` Trait 允许通过引用访问数据](ch15-02-deref.md)
    - [`Drop` Trait 运行清理代码](ch15-03-drop.md)
    - [`Rc<T>` 引用计数智能指针](ch15-04-rc.md)
    - [`RefCell<T>`和内部可变性模式](ch15-05-interior-mutability.md)
    - [引用循环和内存泄漏是安全的](ch15-06-reference-cycles.md)

- [无畏并发](ch16-00-concurrency.md)
    - [线程](ch16-01-threads.md)
    - [消息传递](ch16-02-message-passing.md)
    - [共享状态](ch16-03-shared-state.md)
    - [可扩展的并发：`Sync`和`Send`](ch16-04-extensible-concurrency-sync-and-send.md)

- [面向对象](ch17-00-oop.md)	
	- [什么是面向对象？](ch17-01-what-is-oo.md)
	- [为使用不同类型的值而设计的 trait 对象](ch17-02-trait-objects.md)
    - [面向对象设计模式的实现](ch17-03-oo-design-patterns.md)
	
## 高级主题

- [模式用来匹配值的结构](ch18-00-patterns.md)
    - [所有可能会用到模式的位置](ch18-01-all-the-places-for-patterns.md)
    - [refutable：何时模式可能会匹配失败](ch18-02-refutability.md)
    - [模式的全部语法](ch18-03-pattern-syntax.md)