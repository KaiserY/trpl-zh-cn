## 包和 crate 用来创建库和二进制项目

> [ch07-01-mod-and-the-filesystem.md](https://github.com/rust-lang/book/blob/master/src/ch07-01-packages-and-crates-for-making-libraries-and-executables.md)
> <br>
> commit 1fedfc4b96c2017f64ecfcf41a0a07e2e815f24f

让我们聊聊 **模块** 与 *crate*。下面是一个总结：

* *crate* 是一个二进制或库项目。
* **crate 根**（*crate root*）是一个用来描述如何构建 crate 的文件。
* 带有 *Cargo.toml* 文件的 **包** 用以描述如何构建一个或多个 crate。一个包中至多可以有一个库项目。

所以当运行 `cargo new` 时是在创建一个包：

```text
$ cargo new my-project
     Created binary (application) `my-project` package
$ ls my-project
Cargo.toml
src
$ ls my-project/src
main.rs
```

因为 Cargo 创建了 *Cargo.toml*，这意味着现在我们有了一个包。如果查看 *Cargo.toml* 的内容，会发现并没有提到 *src/main.rs*。然而，Cargo 的约定是如果在代表包的 *Cargo.toml* 的同级目录下包含 *src* 目录且其中包含 *main.rs* 文件的话，Cargo 就知道这个包带有一个与包同名的二进制 crate，且 *src/main.rs* 就是 crate 根。另一个约定如果包目录中包含 *src/lib.rs*，则包带有与其同名的库 crate，且 *src/lib.rs* 是 crate 根。crate 根文件将由 Cargo 传递给 `rustc` 来实际构建库或者二进制项目。

一个包可以带有零个或一个库 crate 和任意多个二进制 crate。一个包中必须带有至少一个（库或者二进制）crate。

如果包同时包含 *src/main.rs* 和 *src/lib.rs*，那么它带有两个 crate：一个库和一个二进制项目，同名。如果只有其中之一，则包将只有一个库或者二进制 crate。包可以带有多个二进制 crate，需将其文件置于 *src/bin* 目录；每个文件将是一个单独的二进制 crate。

接下来让我们讨论模块！