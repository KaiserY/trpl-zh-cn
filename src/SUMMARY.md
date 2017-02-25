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