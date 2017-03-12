## 发布配置

> [ch14-01-release-profiles.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-01-release-profiles.md)
> <br>
> commit 4f2dc564851dc04b271a2260c834643dfd86c724

Cargo 支持一个叫做**发布配置**（*release profiles*）的概念。这些配置控制各种代码编译参数而且彼此相互独立。在构建的输出中你已经见过了这个功能的影子：

```
$ cargo build
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
$ cargo build --release
    Finished release [optimized] target(s) in 0.0 secs
```

这里的 "debug" 和 "release" 提示表明编译器在使用不同的配置。Cargo 支持四种配置：

* `dev`：用于`cargo build`
* `release`：用于`cargo build --release`
* `test`：用于`cargo test`
* `doc`：`cargo doc`

可以通过自定义`Cargo.toml`文件中的`[profile.*]`部分来调整这些配置的编译器参数。例如，这里是`dev`和`release`配置的默认参数：

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

`opt-level`设置控制 Rust 会进行何种程度的优化。这个配置的值从 0 到 3。越高的优化级别需要更多的时间。当开发时经常需要编译，你通常希望能在牺牲一些代码性能的情况下编译得快一些。当准备发布时，一次花费更多时间编译来换取每次都要运行的更快的编译结果将更好一些。

可以在`Cargo.toml`中覆盖这些默认设置。例如，如果你想在开发时开启一级优化：

```toml
[profile.dev]
opt-level = 1
```

这将覆盖默认的设置`0`，而现在开发构建将获得更多的优化。虽然不如发布构建，但也多少有一些。

对于每个配置的设置和其默认值的完整列表，请查看[Cargo 的 文档][cargodoc]。

[cargodoc]: http://doc.crates.io/