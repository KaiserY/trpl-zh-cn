## Cargo 工作空间

> [ch14-03-cargo-workspaces.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-03-cargo-workspaces.md)
> <br>
> commit 6e53771a409794d9933c2a31310d78149b7e0534

第十二章中，我们构建一个包含二进制 crate 和库 crate 的包。你可能会发现，随着项目开发的深入，库 crate 持续增大，而你希望将其进一步拆分成多个库 crate。对于这种情况，Cargo 提供了一个叫 **工作空间**（*workspaces*）的功能，它可以帮助我们管理多个相关的并行开发的包。

**工作空间** 是一系列共享同样的 *Cargo.lock* 和输出目录的包。让我们使用工作空间创建一个项目，这里采用常见的代码这样就可以关注工作空间的结构了。这里有一个使用了两个库的二进制项目：一个库会提供 `add_one` 方法而第二个会提供 `add_two` 方法。让我们以为这个二进制项目创建一个新 crate 作为开始：

```text
$ cargo new --bin adder
     Created binary (application) `adder` project
$ cd adder
```

我们需要修改二进制包的 *Cargo.toml* 并增加一个 `[workspace]` 部分来告诉 Cargo 包 `adder` 是一个工作空间。在文件末尾增加如下内容：

```toml
[workspace]
```

类似于很多 Cargo 的功能，工作空间支持配置惯例：只要遵循这些惯例就无需在 *Cargo.toml* 中增加更多的配置来定义工作空间了。

### 指定工作空间的依赖

工作空间惯例表明任何顶级 crate 依赖的位于任意子目录的 crate 都是工作空间的一部分。任何 crate，无论是否在工作空间中，可以在 *Cargo.toml* 中使用 `path` 属性来指定它拥有本地目录中的 crate 作为依赖。如果 crate 拥有 `[workspace]` 部分并指定了路径依赖，而这些路径是 crate 的子目录，则这些相关的 crate 被认为是工作空间的一部分。让我们在顶级的 `adder` crate 的 *Cargo.toml* 中为其指定位于 `add-one` 子目录的 `add-one` crate 作为依赖，通过这样修改 *Cargo.toml*：

```toml
[dependencies]
add-one = { path = "add-one" }
```

如果在 *Cargo.toml* 中增加依赖但没有指定对应 `path`，则这些将是不属于工作空间的假设来自于 Crates.io 的常规依赖。

### 在工作空间中创建第二个 crate


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

打开 `adder` 的 *src/main.rs* 并增加一行 `extern crate` 将新的 `add-one` 库引入作用域，并修改 `main` 函数来调用 `add_one` 函数，如列表 14-12 所示：

```rust,ignore
extern crate add_one;

fn main() {
    let num = 10;
    println!("Hello, world! {} plus one is {}!", num, add_one::add_one(num));
}
```

<span class="caption">列表 14-12：使用来自 `adder` crate 的库 crate `add-one`</span>

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

工作空间在顶级目录有一个 *target* 目录；*add-one* 并没有自己的 *target* 目录。即使进入 `add-one` 目录运行 `cargo build`，构建结果也位于 *adder/target* 而不是 *adder/add-one/target*。因为工作空间中的 crate 之间相互依赖。如果每个 crate 有其自己的 *target* 目录，为了在自己的 *target* 目录中生成构建结果，工作空间中的每一个 crate 都不得不相互重新编译其他 crate。通过共享一个 *target* 目录，工作空间可以避免其他 crate 多余的重复构建。

#### 在工作空间中依赖外部 crate

还需注意的是工作空间只有一个 *Cargo.lock*，而不是拥有一个顶级的 *Cargo.lock* 和一个 *add-one/Cargo.lock*。这确保了所有的 crate 都使用完全相同版本的依赖。如果在 *Cargo.toml* 和 *add-one/Cargo.toml* 中都增加 `rand` crate，则 Cargo 会将其都解析为同一版本并记录到唯一的 *Cargo.lock* 中。使得工作空间中的所有 crate 都使用相同的依赖意味着其中的 crate 都是相互减重的。现在就让我们来试一试。

让我们在 *add-one/Cargo.toml* 中的 `[dependencies]` 部分增加 `rand` crate 以便能够在 `add-one` crate 中使用 `rand` crate：

<span class="filename">文件名: add-one/Cargo.toml</span>

```toml
[dependencies]

rand = "0.3.14"
```

现在就可以在 *add-one/src/lib.rs* 中增加 `extern crate rand;` 了，接着在 *adder* 目录运行 `cargo build` 构建整个工作空间就会引入并编译 `rand` crate：

```text
$ cargo build
    Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading rand v0.3.14
   ...snip...
   Compiling rand v0.3.14
   Compiling add-one v0.1.0 (file:///projects/adder/add-one)
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 10.18 secs
```

现在顶级的 *Cargo.lock* 包含了 `add-one` 的 `rand` 依赖的信息。然而，即使 `rand` 被用于工作空间的某处，也不能在其他 crate 中使用它，除非也在他们的 *Cargo.toml* 中加入 `rand`。例如，如果在顶级的 `adder` crate 的 *src/main.rs* 中增加 `extern crate rand;`，则会得到一个错误：

```text
$ cargo build
   Compiling adder v0.1.0 (file:///projects/adder)
error[E0463]: can't find crate for `rand`
 --> src/main.rs:1:1
  |
1 | extern crate rand;
  | ^^^^^^^^^^^^^^^^^^^ can't find crate
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

在顶级 *adder* 目录运行 `cargo test`：

```text
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.27 secs
     Running target/debug/adder-f0253159197f7841

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

等等，零个测试？我们刚刚增加了一个测试！如果我们观察输出，就不难发现在工作空间中的 `cargo test` 只运行顶级 crate 的测试。为了运行工作空间中所有 crate 的测试，需要使用 `--all` 参数：

```text
$ cargo test --all
    Finished dev [unoptimized + debuginfo] target(s) in 0.37 secs
     Running target/debug/deps/add_one-abcabcabc

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/adder-abcabcabc

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

当传递了 `--all` 时，`cargo test` 会运行工作空间中所有 crate 的测试。也可以选择在顶级目录运行工作空间中特定 crate 的测试，通过使用 `-p` 参数并指定希望测试的 crate 的名称：

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

如果你选择向 crates.io 发布工作空间中的 crate，每一个工作空间中的 crate 将会单独发布。`cargo publish` 命令并没有 `--all` 或者 `-p` 参数，所以必须进入每一个 crate 的目录并运行 `cargo publish` 来发布工作空间中的每一个 crate。

现在尝试以类似 `add-one` crate 的方式向工作空间增加 `add-two` crate 来作为更多的练习！

随着项目增长，考虑使用工作空间：每一个更小的组件比一大块代码要容易理解。将 crate 保持在工作空间中易于协调他们的改变，如果他们一起运行并经常需要同时被修改的话。