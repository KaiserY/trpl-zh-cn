## Cargo 工作空间

> [ch14-03-cargo-workspaces.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-03-cargo-workspaces.md)
> <br>
> commit 6e53771a409794d9933c2a31310d78149b7e0534

第十二章中，我们构建一个包含二进制 crate 和库 crate 的包。


不过如果库 crate 继续变得更大而我们想要进一步将包拆分为多个库 crate 呢？随着包增长，拆分出其主要组件将是非常有帮助的。对于这种情况，Cargo 提供了一个叫**工作空间**（*workspaces*）的功能，它可以帮助我们管理多个相关的并行开发的包。

**工作空间**是一系列的包都共享同样的 *Cargo.lock* 和输出目录。让我们使用工作空间创建一个项目，这是我们熟悉的所以就可以关注工作空间的结构了。这里有一个二进制项目它使用了两个库：一个会提供`add_one`方法而第二个会提供`add_two`方法。让我们为这个二进制项目创建一个新 crate 作为开始：

```
$ cargo new --bin adder
     Created binary (application) `adder` project
$ cd adder
```

需要修改二进制包的 *Cargo.toml* 来告诉 Cargo 包`adder`是一个工作空间。再文件末尾增加如下：

```toml
[workspace]
```

类似于很多 Cargo 的功能，工作空间支持配置惯例：只要遵循这些惯例就无需再增加任何配置了。这个惯例是任何作为子目录依赖的 crate 将是工作空间的一部分。让我们像这样在 *Cargo.toml* 中的`[dependencies]`增加一个`adder` crate 的路径依赖：

```toml
[dependencies]
add-one = { path = "add-one" }
```

如果增加依赖但没有指定`path`，这将是一个不位于工作空间的正常的依赖。

接下来，在`adder`目录中生成`add-one` crate：

```
$ cargo new add-one
     Created library `add-one` project
```

现在`adder`目录应该有如下目录和文件：

```
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
└── src
    └── main.rs
```

在 *add-one/src/lib.rs* 中增加`add_one`函数的实现：

<span class="filename">Filename: add-one/src/lib.rs</span>

```rust
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

打开`adder`的 *src/main.rs* 并增加一行`extern crate`将新的`add-one`库引入作用域，并修改`main`函数来使用`add_one`函数：

```rust,ignore
extern crate add_one;

fn main() {
    let num = 10;
    println!("Hello, world! {} plus one is {}!", num, add_one::add_one(num));
}
```

让我们构建一下！

```
$ cargo build
   Compiling add-one v0.1.0 (file:///projects/adder/add-one)
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.68 secs
```

注意在 *adder* 目录运行`cargo build`会构建这个 crate 和 *adder/add-one* 中的`add-one` crate，不过只创建一个 *Cargo.lock* 和一个 *target* 目录，他们都位于 *adder* 目录。试试你能否用相同的方式增加`add-two` crate。

假如我们想要在`add-one` crate 中使用`rand` crate。一如既往在`Cargo.toml`的`[dependencies]`部分增加这个 crate：

<span class="filename">Filename: add-one/Cargo.toml</span>

```toml
[dependencies]

rand = "0.3.14"
```

如果在 *add-one/src/lib.rs* 中加上`extern crate rand;`后再运行`cargo build`，则会编译成功：

```
$ cargo build
    Updating registry `https://github.com/rust-lang/crates.io-index`
 Downloading rand v0.3.14
   ...snip...
   Compiling rand v0.3.14
   Compiling add-one v0.1.0 (file:///projects/adder/add-one)
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 10.18 secs
```

现在 *Cargo.lock* 的顶部反映了`add-one`依赖`rand`这一事实。然而即使在工作空间的某处使用了`rand`，也不能在工作空间的其他 crate 使用它，除非在对应的 *Cargo.toml* 也增加`rand`的依赖。例如，如果在顶层的`adder` crate 的 *src/main.rs* 中增加`extern crate rand;`，将会出现一个错误：

```
$ cargo build
   Compiling adder v0.1.0 (file:///projects/adder)
error[E0463]: can't find crate for `rand`
 --> src/main.rs:1:1
  |
1 | extern crate rand;
  | ^^^^^^^^^^^^^^^^^^^ can't find crate
```

为了修复这个错误，修改顶层的 *Cargo.toml* 并表明`rand`是`adder` crate 的一个依赖。

作为另一个提高，为 crate 中的`add_one::add_one`函数增加一个测试：

<span class="filename">Filename: add-one/src/lib.rs</span>

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

现在在顶层的 *adder* 目录运行`cargo test`：

```
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished debug [unoptimized + debuginfo] target(s) in 0.27 secs
     Running target/debug/adder-f0253159197f7841

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

等等，零个测试？我们不是刚增加了一个吗？如果我们观察输出，就不难发现在工作空间中的`cargo test`只运行顶层 crate 的测试。为了运行其他 crate 的测试，需要使用`-p`参数来表明我们希望运行指定包的测试：

```
$ cargo test -p add-one
    Finished debug [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/deps/add_one-abcabcabc

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured

   Doc-tests add-one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured
```

类似的，如果选择将工作空间发布到 crates.io，其中的每一个包都需要单独发布。

随着项目增长，考虑使用工作空间：每一个更小的组件比一大块代码要容易理解。将 crate 保持在工作空间中易于协调他们的改变，如果他们一起运行并经常需要同时被修改的话。