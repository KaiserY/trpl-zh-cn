## Cargo 工作空间

> [ch14-03-cargo-workspaces.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-03-cargo-workspaces.md)
> <br>
> commit a59537604248f2970e0831d5ead9f6fac2cdef84

第十二章中，我们构建一个包含二进制 crate 和库 crate 的包。你可能会发现，随着项目开发的深入，库 crate 持续增大，而你希望将其进一步拆分成多个库 crate。对于这种情况，Cargo 提供了一个叫 **工作空间**（*workspaces*）的功能，它可以帮助我们管理多个相关的协同开发的包。

**工作空间** 是一系列共享同样的 *Cargo.lock* 和输出目录的包。让我们使用工作空间创建一个项目，这里采用常见的代码这样就可以关注工作空间的结构了。有多种组织工作空间的方式；我们将展示一个常用方法。我们的工作空间有一个二进制项目和两个库。二进制项目会提供作为命令行工具的主要功能，它会依赖另两个库。一个库会提供 `add_one` 方法而第二个会提供 `add_two` 方法。这三个 crate 将会是相同工作空间的一部分。让我们以新建工作空间目录开始：

```text
$ mkdir add
$ cd add
```

在 add* 目录中，创建 *Cargo.toml* 文件。这个 *Cargo.toml* 文件配置了整个工作空间。它不会包含 `[package]` 或其他我们在 *Cargo.toml* 中见过的元信息。相反，它以 `[workspace]` 部分作为开始，并通过指定 *adder* 的路径来为工作空间增加成员，如下会加入二进制 crate：

<span class="filename">文件名: Cargo.toml</span>

```toml
[workspace]

members = [
    "adder",
]
```

接下来，在 *add* 目录运行 `cargo new` 新建 `adder` 二进制 crate：

```text
$ cargo new --bin adder
     Created binary (application) `adder` project
```

到此为止，可以运行 `cargo build` 来构建工作空间。*add* 目录中的文件应该看起来像这样：

```text
├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

工作空间在顶级目录有一个 *target* 目录；`adder` 并没有自己的 *target* 目录。即使进入 *adder* 目录运行 `cargo build`，构建结果也位于 *add/target* 而不是 *add/adder/target*。工作空间中的 crate 之间相互依赖。如果每个 crate 有其自己的 *target* 目录，为了在自己的 *target* 目录中生成构建结果，工作空间中的每一个 crate 都不得不相互重新编译其他 crate。通过共享一个 *target* 目录，工作空间可以避免其他 crate 多余的重复构建。

### 在工作空间中创建第二个 crate

接下来，让我们在工作空间中指定另一个成员 crate。这个 crate 位于 *add-one* 目录中，所以修改顶级 *Cargo.toml* 为也包含 *add-one* 路径：

<span class="filename">文件名: Cargo.toml</span>

```toml
[workspace]

members = [
    "adder",
    "add-one",
]
```

接着新生成一个叫做 `add-one` 的库：

```text
$ cargo new add-one
     Created library `add-one` project
```

现在 *add* 目录应该有如下目录和文件：

```text
├── Cargo.lock
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

在 *add-one/src/lib.rs* 文件中，增加一个 `add_one` 函数：

<span class="filename">文件名: add-one/src/lib.rs</span>

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

现在工作空间中有了一个库 crate，让 `adder` 依赖库 crate `add-one`。首先需要在 *adder/Cargo.toml* 文件中增加 `add-one` 作为路径依赖：

<span class="filename">文件名: adder/Cargo.toml</span>

```toml
[dependencies]

add-one = { path = "../add-one" }
```

工作空间中的 crate 不必相互依赖，所以仍需显式地表明工作空间中 crate 的依赖关系。

接下来，在 `adder` crate 中使用 `add-one` crate 的函数 `add_one`。打开 *adder/src/main.rs* 在顶部增加一行 `extern crate` 将新 `add-one` 库 crate 引入作用域。接着修改 `main` 函数来调用 `add_one` 函数，如示例 14-7 所示：

<span class="filename">文件名: adder/src/main.rs</span>

```rust,ignore
extern crate add_one;

fn main() {
    let num = 10;
    println!("Hello, world! {} plus one is {}!", num, add_one::add_one(num));
}
```

<span class="caption">示例 14-7：在 `adder` crate 中使用 `add-one` 库 crate</span>

在 *add* 目录中运行 `cargo build` 来构建工作空间！

```text
$ cargo build
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.68 secs
```

为了在顶层 *add* 目录运行二进制 crate，需要通过 `-p` 参数和包名称来运行 `cargo run` 指定工作空间中我们希望使用的包：

```text
$ cargo run -p adder
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/adder`
Hello, world! 10 plus one is 11!
```

这会运行 *adder/src/main.rs* 中的代码，其依赖 `add-one` crate




接下来，在 `adder` 目录中生成 `add-one` crate：

```text
$ cargo new add-one
     Created library `add-one` project
```

现在 `adder` 目录应该有如下目录和文件：

```text
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
└── src
    └── main.rs
```

在 *add-one/src/lib.rs* 中增加 `add_one` 函数的实现：

<span class="filename">文件名: add-one/src/lib.rs</span>

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

打开 `adder` 的 *src/main.rs* 并增加一行 `extern crate` 将新的 `add-one` 库引入作用域，并修改 `main` 函数来调用 `add_one` 函数，如示例 14-12 所示：

```rust,ignore
extern crate add_one;

fn main() {
    let num = 10;
    println!("Hello, world! {} plus one is {}!", num, add_one::add_one(num));
}
```

<span class="caption">示例 14-12：使用来自 `adder` crate 的库 crate `add-one`</span>

在 *adder* 目录下运行 `cargo build` 来构建 `adder` crate！

```text
$ cargo build
   Compiling add-one v0.1.0 (file:///projects/adder/add-one)
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.68 secs
```

注意这会构建 `adder` crate 和 *adder/add-one* 中的 `add-one` crate。现在 *adder* 目录中应该有这些文件：

```text
├── Cargo.lock
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── src
│   └── main.rs
└── target
```

#### 在工作空间中依赖外部 crate

还需注意的是工作空间只在根目录有一个 *Cargo.lock*，而不是在每一个 crate 目录都有 *Cargo.lock*。这确保了所有的 crate 都使用完全相同版本的依赖。如果在 *Cargo.toml* 和 *add-one/Cargo.toml* 中都增加 `rand` crate，则 Cargo 会将其都解析为同一版本并记录到唯一的 *Cargo.lock* 中。使得工作空间中的所有 crate 都使用相同的依赖意味着其中的 crate 都是相互兼容的。让我们在 *add-one/Cargo.toml* 中的 `[dependencies]` 部分增加 `rand` crate 以便能够在 `add-one` crate 中使用 `rand` crate：

<span class="filename">文件名: add-one/Cargo.toml</span>

```toml
[dependencies]

rand = "0.3.14"
```

现在就可以在 *add-one/src/lib.rs* 中增加 `extern crate rand;` 了，接着在 *add* 目录运行 `cargo build` 构建整个工作空间就会引入并编译 `rand` crate：

```text
$ cargo build
    Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading rand v0.3.14
   --snip--
   Compiling rand v0.3.14
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 10.18 secs
```

现在顶级的 *Cargo.lock* 包含了 `add-one` 的 `rand` 依赖的信息。然而，即使 `rand` 被用于工作空间的某处，也不能在其他 crate 中使用它，除非也在他们的 *Cargo.toml* 中加入 `rand`。例如，如果在顶级的 `adder` crate 的 *adder/src/main.rs* 中增加 `extern crate rand;`，会得到一个错误：

```text
$ cargo build
   Compiling adder v0.1.0 (file:///projects/add/adder)
error: use of unstable library feature 'rand': use `rand` from crates.io (see
issue #27703)
 --> adder/src/main.rs:1:1
  |
1 | extern crate rand;
```

为了修复这个错误，修改顶级 `adder` crate 的 *Cargo.toml* 来表明 `rand` 也是这个 crate 的依赖。构建 `adder` crate 会将 `rand` 加入到 *Cargo.lock* 中 `adder` 的依赖列表中，但是这并不会下载 `rand` 的额外拷贝。Cargo 确保了工作空间中任何使用 `rand` 的 crate 都采用相同的版本。在整个工作空间中使用相同版本的 `rand` 节省了空间，因为这样就无需多个拷贝并确保了工作空间中的 crate 将是相互兼容的。

#### 为工作空间增加测试

作为另一个提升，让我们为 `add_one` crate 中的 `add_one::add_one` 函数增加一个测试：

<span class="filename">文件名: add-one/src/lib.rs</span>

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(3, add_one(2));
    }
}
```

在顶级 *add* 目录运行 `cargo test`：

```text
$ cargo test
   Compiling add-one v0.1.0 (file:///projects/add/add-one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.27 secs
     Running target/debug/deps/add_one-f0253159197f7841

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/adder-f88af9d2cc175a5e

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

输出的第一部分显示 `add-one` crate 的 `it_works` 测试通过了。下一个部分显示 `adder` crate 中找到了 0 个测试，最后一部分显示 `add-one` crate 中有 0 个文档测试。在像这样的工作空间结构中运行 `cargo test` 会运行工作空间中所有 crate 的测试。

也可以选择运行工作空间中特定 crate 的测试，通过在根目录使用 `-p` 参数并指定希望测试的 crate 名称：

```text
$ cargo test -p add-one
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/add_one-b3235fea9a156f74

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

输出显示了 `cargo test` 只运行了 `add-one` crate 的测试而没有运行 `adder` crate 的测试。

如果你选择向 *https://crates.io/* 发布工作空间中的 crate，每一个工作空间中的 crate 将会单独发布。`cargo publish` 命令并没有 `--all` 或者 `-p` 参数，所以必须进入每一个 crate 的目录并运行 `cargo publish` 来发布工作空间中的每一个 crate。

现在尝试以类似 `add-one` crate 的方式向工作空间增加 `add-two` crate 来作为更多的练习！

随着项目增长，考虑使用工作空间：每一个更小的组件比一大块代码要容易理解。将 crate 保持在工作空间中更易于协调他们的改变，如果他们一起运行并经常需要同时被修改的话。
