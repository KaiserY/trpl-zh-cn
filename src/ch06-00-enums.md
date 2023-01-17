# 枚举和模式匹配

> [ch06-00-enums.md](https://github.com/rust-lang/book/blob/main/src/ch06-00-enums.md)
> <br>
> commit c76f1b4d011fe59fc4f5e6f258070fc40d9921e4

本章介绍 **枚举**（*enumerations*），也被称作 *enums*。枚举允许你通过列举可能的 **成员**（*variants*）来定义一个类型。首先，我们会定义并使用一个枚举来展示它是如何连同数据一起编码信息的。接下来，我们会探索一个特别有用的枚举，叫做 `Option`，它代表一个值要么是某个值要么什么都不是。然后会讲到在 `match` 表达式中用模式匹配，针对不同的枚举值编写相应要执行的代码。最后会介绍 `if let`，另一个简洁方便处理代码中枚举的结构。
