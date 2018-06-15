# 进一步认识 Cargo 和 Crates.io

> [ch14-00-more-about-cargo.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-00-more-about-cargo.md)
> <br>
> commit ff93f82ff63ade5a352d9ccc430945d4ec804cdf

目前为止我们只使用过 Cargo 构建、运行和测试代码的最基本功能，不过它还可以做到更多。这里我们将了解一些 Cargo 其他更为高级的功能，他们将展示如何：

* 使用发布配置来自定义构建
* 将库发布到 [crates.io](https://crates.io)<!-- ignore -->
* 使用工作空间来组织更大的项目
* 从 [crates.io](https://crates.io)<!-- ignore --> 安装二进制文件
* 使用自定义的命令来扩展 Cargo

相比本章能够涉及的工作 Cargo 甚至还可以做到更多，关于其功能的全部解释，请查看 [其文档](http://doc.rust-lang.org/cargo/)