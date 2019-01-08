# 包、crate 与 模块

> [ch07-00-packages-crates-and-modules.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch07-00-modules.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

编写程序时一个核心的问题是 **作用域**（*scope*）：在代码的某处编译器知道哪些变量名？允许调用哪些函数？这些变量引用的又是什么？

Rust 有一系列与作用域相关的功能。这有时被称为 “模块系统”（“the module system”），不过又不仅仅是模块：

* **包**（*Packages*）是 Cargo 的一个功能，它允许你构建、测试核分享 crate。
* *Crates* 是一个模块的树形结构，它形成了库或二进制项目。
* **模块**（*Modules*）和 *use* 关键字允许你控制作用域和路径的私有性。
* **路径**（*path*）是一个命名例如结构体、函数或模块等项的方式

本章将会覆盖所有这些概念。很快我们就能像专家一样将命名引入作用域、定义作用域和将命名导出到作用域！
