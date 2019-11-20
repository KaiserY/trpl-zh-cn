# 枚举和模式匹配

> [ch06-00-enums.md](https://github.com/rust-lang/book/blob/master/src/ch06-00-enums.md)
> <br>
> commit a5a03d8f61a5b2c2111b21031a3f526ef60844dd

本章介绍 **枚举**（*enumerations*），也被称作 *enums*。枚举允许你通过列举可能的 **成员**（*variants*） 来定义一个类型。首先，我们会定义并使用一个枚举来展示它是如何连同数据一起编码信息的。接下来，我们会探索一个特别有用的枚举，叫做 `Option`，它代表一个值要么是某个值要么什么都不是。然后会讲到在 `match` 表达式中用模式匹配，针对不同的枚举值编写相应要执行的代码。最后会介绍 `if let`，另一个简洁方便处理代码中枚举的结构。

枚举是一个很多语言都有的功能，不过不同语言中其功能各不相同。Rust 的枚举与 F#、OCaml 和 Haskell 这样的函数式编程语言中的 **代数数据类型**（*algebraic data types*）最为相似。
