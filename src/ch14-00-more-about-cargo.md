# 进一步认识 Cargo 和 Crates.io

> [ch14-00-more-about-cargo.md](https://github.com/rust-lang/book/blob/master/src/ch14-00-more-about-cargo.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

目前为止我们只使用过 Cargo 构建、运行和测试代码这些最基本的功能，不过它还可以做到更多。本章会讨论 Cargo 其他一些更为高级的功能，我们将展示如何：

* 使用发布配置来自定义构建
* 将库发布到 [crates.io](https://crates.io)<!-- ignore -->
* 使用工作空间来组织更大的项目
* 从 [crates.io](https://crates.io)<!-- ignore --> 安装二进制文件
* 使用自定义的命令来扩展 Cargo

Cargo 的功能不止本章所介绍的，关于其功能的全部解释，请查看 [文档](http://doc.rust-lang.org/cargo/)