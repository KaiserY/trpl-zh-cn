## 使用自定义命令扩展 Cargo

[ch14-05-extending-cargo.md](https://github.com/rust-lang/book/blob/43b9ad334aaf7353e5708dba49f84f941b50ec4b/src/ch14-05-extending-cargo.md)

Cargo 的设计允许你用新的子命令来扩展它，而不必修改 Cargo 本身。如果你的 `$PATH` 中有一个名为 `cargo-something` 的二进制文件，那么你就可以像运行 Cargo 子命令一样，通过 `cargo something` 来运行它。这类自定义命令也会在你运行 `cargo --list` 时显示出来。Cargo 这种设计带来了一个非常方便的好处：你可以用 `cargo install` 安装扩展，然后像使用 Cargo 内建工具一样运行它们。

## 总结

通过 Cargo 和 [crates.io](https://crates.io/)<!-- ignore --> 分享代码，是 Rust 生态系统之所以能适用于众多不同任务的重要原因之一。Rust 的标准库小而稳定，但 crate 很容易被分享、使用和改进，而且它们的演进节奏也可以不同于语言本身。不要犹豫，把那些对你有用的代码分享到 [crates.io](https://crates.io/)<!-- ignore --> 上；它很可能也会对别人有用！
