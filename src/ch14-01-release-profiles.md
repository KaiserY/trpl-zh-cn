## 发布配置

> [ch14-01-release-profiles.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-01-release-profiles.md)
> <br>
> commit db6129a30d7c7baed34dd38dbc56f7ed8a66ae92

在 Rust 中 **发布配置**（*release profiles*）是预定义的、可定制的带有不同选项的配置，他们允许程序员更多的控制代码编译的多种选项。每一个配置都彼此相互独立。

Cargo 定义了四种有着良好默认值的可用于各自使用场景的配置。Cargo 根据运行的命令来选择不同的配置。不同命令所对应的配置如表格 14-1 所示：

| 命令                 | 配置   |
|-------------------------|-----------|
| `cargo build`           | `dev`     |
| `cargo build --release` | `release` |
| `cargo test`            | `test`    |
| `cargo doc`             | `doc`     |

<span class="caption">表格 14-1：运行不同 Cargo 命令所使用的配置</span>

这可能很熟悉，他们出现在构建的输出中，他们展示了构建中所使用的配置：

```text
$ cargo build
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
$ cargo build --release
    Finished release [optimized] target(s) in 0.0 secs
```

这里的 “dev” 和 “release” 提示表明编译器在使用不同的配置。

### 定制发布配置

Cargo 对每一个配置都有默认设置，当项目的 *Cargo.toml* 文件的 `[profile.*]` 部分没有指定时使用。通过增加任何希望定制的配置对应的 `[profile.*]` 部分，我们可以选择覆盖任意默认设置的子集。例如，如下是 `dev` 和 `release` 配置的 `opt-level` 设置的默认值：

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

`opt-level` 设置控制 Rust 会对代码进行何种程度的优化。这个配置的值从 0 到 3。越高的优化级别需要更多的时间编译，所以如果你在进行开发并经常编译，可能会希望在牺牲一些代码性能的情况下编译得快一些。这就是为什么 `dev` 的 `opt-level` 默认为 `0`。当你准备发布时，花费更多时间在编译上则更好。只需要在发布模式编译一次，而编译出来的程序则会运行很多次，所以发布模式用更长的编译时间换取运行更快的代码。这正是为什么 `release` 配置的 `opt-level` 默认为 `3`。

我们可以选择通过在 *Cargo.toml* 增加不同的值来覆盖任何默认设置。比如，如果我们想要在开发配置中使用级别 1 的优化，则可以在 *Cargo.toml* 中增加这两行：

<span class="filename">文件名: Cargo.toml</span>

```toml
[profile.dev]
opt-level = 1
```

这会覆盖默认的设置 `0`。现在运行 `cargo build` 时，Cargo 将会使用 `dev` 的默认配置加上定制的 `opt-level`。因为 `opt-level` 设置为 `1`，Cargo 会比默认进行更多的优化，但是没有发布构建那么多。

对于每个配置的设置和其默认值的完整列表，请查看[Cargo 的文档][cargodoc]。

[cargodoc]: http://doc.crates.io/