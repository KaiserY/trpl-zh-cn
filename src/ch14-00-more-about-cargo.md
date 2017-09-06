# 进一步认识 Cargo 和 Crates.io

> [ch14-00-more-about-cargo.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-00-more-about-cargo.md)
> <br>
> commit db6129a30d7c7baed34dd38dbc56f7ed8a66ae92

目前为止我们只使用过 Cargo 构建、运行和测试代码的最基本功能，不过它还可以做到更多。这里我们将了解一些 Cargo 其他更高级的功能，他们将展示如何：

* 使用发布配置来自定义构建
* 将库发布到 crates.io
* 使用工作空间来组织更大的项目
* 从 crates.io 安装二进制文件
* 使用自定义的命令来扩展 Cargo

相比本章能够涉及的工作 Cargo 甚至还可以做到更多，关于其功能的全部解释，请查看[文档](http://doc.rust-lang.org/cargo/)