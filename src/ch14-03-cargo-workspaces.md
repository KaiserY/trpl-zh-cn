## Cargo 工作空间

[ch14-03-cargo-workspaces.md](https://github.com/rust-lang/book/blob/43b9ad334aaf7353e5708dba49f84f941b50ec4b/src/ch14-03-cargo-workspaces.md)

第十二章中，我们构建了一个同时包含二进制 crate 和库 crate 的包。随着项目不断发展，你可能会发现库 crate 变得越来越大，并希望进一步将这个包拆分为多个库 crate。Cargo 提供了一项叫作**工作空间**（*workspace*）的功能，可以帮助管理多个彼此相关、并行开发的包。

### 创建工作空间

**工作空间**是一组共享同一个 *Cargo.lock* 和输出目录的包。让我们用工作空间创建一个项目，这里会使用简单代码，以便把注意力集中在工作空间的结构上。组织工作空间的方式有很多种，因此我们只展示一种常见方式。这个工作空间会包含一个二进制 crate 和两个库。二进制 crate 提供主要功能，并依赖这两个库。一个库提供 `add_one` 函数，另一个库提供 `add_two` 函数。这三个 crate 都属于同一个工作空间。我们先为工作空间创建一个新目录：

```console
$ mkdir add
$ cd add
```

接下来，在 *add* 目录中创建 *Cargo.toml* 文件，用来配置整个工作空间。这个文件不会有 `[package]` 部分，而是会以 `[workspace]` 部分开头，这样我们就能向工作空间添加成员。我们还会把 `resolver` 的值设为 `"3"`，以便在工作空间中使用 Cargo 最新的依赖解析算法：

<span class="filename">文件名：Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-01-workspace/add/Cargo.toml}}
```

接下来，在 *add* 目录运行 `cargo new` 新建 `adder` 二进制 crate：

```console
$ cargo new adder
     Created binary (application) `adder` package
      Adding `adder` as member of workspace at `file:///projects/add`
```

在工作空间中运行 `cargo new` 时，新创建的包也会被自动加入工作空间 *Cargo.toml* 中 `[workspace]` 定义的 `members` 键，像这样：

```toml
{{#include ../listings/ch14-more-about-cargo/output-only-01-adder-crate/add/Cargo.toml}}
```

现在，我们可以运行 `cargo build` 来构建工作空间。你的 *add* 目录中的文件应如下所示：

```text
├── Cargo.lock
├── Cargo.toml
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

工作空间在顶层只有一个 *target* 目录，用来存放编译产物；`adder` 包不会有自己的 *target* 目录。即使我们在 *adder* 目录中运行 `cargo build`，编译产物也仍会放到 *add/target*，而不是 *add/adder/target*。Cargo 之所以这样组织工作空间中的 *target* 目录，是因为工作空间中的 crate 本来就是要彼此依赖的。如果每个 crate 都有各自的 *target* 目录，那么每个 crate 都不得不重新编译工作空间中的其他 crate，才能把产物放进自己的 *target* 目录。共享一个 *target* 目录可以避免不必要的重复构建。

### 在工作空间中创建第二个包

接下来，让我们在工作空间中创建另一个成员包，并将其命名为 `add_one`。生成一个名为 `add_one` 的库 crate：

```console
$ cargo new add_one --lib
     Created library `add_one` package
      Adding `add_one` as member of workspace at `file:///projects/add`
```

现在顶层的 *Cargo.toml* 的 `members` 列表将会包含 *add_one* 路径：

<span class="filename">文件名：Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/Cargo.toml}}
```

现在 *add* 目录应该有如下目录和文件：

```text
├── Cargo.lock
├── Cargo.toml
├── add_one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

在 *add_one/src/lib.rs* 文件中，增加一个 `add_one` 函数：

<span class="filename">文件名：add_one/src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/add_one/src/lib.rs}}
```

现在，我们可以让二进制包 `adder` 依赖包含库的 `add_one` 包了。首先，需要在 *adder/Cargo.toml* 中把 `add_one` 添加为一个路径依赖：

<span class="filename">文件名：adder/Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-02-workspace-with-two-crates/add/adder/Cargo.toml:6:7}}
```

Cargo 并不会假定工作空间中的 crate 会彼此依赖，因此我们需要显式声明这些依赖关系。

接下来，让我们在 `adder` crate 中使用 `add_one` crate 里的 `add_one` 函数。打开 *adder/src/main.rs* 文件，并将 `main` 函数改为调用 `add_one`，如示例 14-7 所示。

<span class="filename">文件名：adder/src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch14-more-about-cargo/listing-14-07/add/adder/src/main.rs}}
```

<span class="caption">示例 14-7：在 `adder` crate 中使用 `add_one` 库 crate</span>

在顶层 *add* 目录中运行 `cargo build` 来构建工作空间！

```console
$ cargo build
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.22s
```

要从 *add* 目录运行这个二进制 crate，可以在 `cargo run` 时通过 `-p` 参数加上包名，指定要运行工作空间中的哪个包：

```console
$ cargo run -p adder
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running `target/debug/adder`
Hello, world! 10 plus one is 11!
```

这会运行 *adder/src/main.rs* 中的代码，其依赖 `add_one` crate。


#### 依赖外部包

注意，工作空间只在顶层有一个 *Cargo.lock* 文件，而不是让每个 crate 目录里都各自有一个 *Cargo.lock*。这能确保所有 crate 使用的都是同一个版本的依赖。如果我们把 `rand` 包同时加到 _adder/Cargo.toml_ 和 _add_one/Cargo.toml_ 中，Cargo 会把它们都解析为同一个 `rand` 版本，并把结果记录到唯一的 _Cargo.lock_ 中。让工作空间中的所有 crate 使用相同依赖，意味着这些 crate 会始终彼此兼容。现在我们先把 `rand` crate 加到 *add_one/Cargo.toml* 的 `[dependencies]` 部分，以便能在 `add_one` crate 中使用它：

<span class="filename">文件名：add_one/Cargo.toml</span>

```toml
{{#include ../listings/ch14-more-about-cargo/no-listing-03-workspace-with-external-dependency/add/add_one/Cargo.toml:6:7}}
```

现在我们可以在 *add_one/src/lib.rs* 中加入 `use rand;`，然后在 *add* 目录中运行 `cargo build` 来构建整个工作空间，这会引入并编译 `rand` crate。我们会得到一条警告，因为我们并没有实际使用引入到作用域中的 `rand`：

```console
$ cargo build
    Updating crates.io index
  Downloaded rand v0.8.5
   --snip--
   Compiling rand v0.8.5
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
warning: unused import: `rand`
 --> add_one/src/lib.rs:1:5
  |
1 | use rand;
  |     ^^^^
  |
  = note: `#[warn(unused_imports)]` on by default

warning: `add_one` (lib) generated 1 warning (run `cargo fix --lib -p add_one` to apply 1 suggestion)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.95s
```

顶层的 *Cargo.lock* 现在已经包含了 `add_one` 依赖 `rand` 的信息。不过，即使 `rand` 在工作空间的某处被使用，我们也不能直接在工作空间里的其他 crate 中使用它，除非也把 `rand` 加到它们各自的 *Cargo.toml* 中。例如，如果我们在 `adder` 包的 *adder/src/main.rs* 中加入 `use rand;`，就会得到一个错误：

```console
$ cargo build
  --snip--
   Compiling adder v0.1.0 (file:///projects/add/adder)
error[E0432]: unresolved import `rand`
 --> adder/src/main.rs:2:5
  |
2 | use rand;
  |     ^^^^ no external crate `rand`
```

要修复这个错误，就编辑 `adder` 包的 *Cargo.toml* 文件，声明 `rand` 也是它的依赖。构建 `adder` 包时，会把 `rand` 加到 *Cargo.lock* 中 `adder` 的依赖列表里，但不会额外下载一份新的 `rand`。Cargo 会确保工作空间中每个使用 `rand` 的 crate 都使用同一个版本，只要它们声明的是彼此兼容的 `rand` 版本，这样既节省空间，也确保工作空间中的 crate 彼此兼容。

如果工作空间中的 crate 为同一个依赖指定了彼此不兼容的版本，Cargo 仍然会分别解析它们，但会尽量把版本数量控制得尽可能少。

#### 为工作空间增加测试

作为另一个改进，让我们为 `add_one` crate 中的 `add_one::add_one` 函数增加一个测试：

<span class="filename">文件名：add_one/src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch14-more-about-cargo/no-listing-04-workspace-with-tests/add/add_one/src/lib.rs}}
```

现在，在顶层 *add* 目录中运行 `cargo test`。在这种结构的工作空间里运行 `cargo test`，会执行工作空间中所有 crate 的测试：

```console
$ cargo test
   Compiling add_one v0.1.0 (file:///projects/add/add_one)
   Compiling adder v0.1.0 (file:///projects/add/adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.20s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running unittests src/main.rs (target/debug/deps/adder-3a47283c568d2b6a)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

输出的第一部分表明 `add_one` crate 中的 `it_works` 测试通过了。下一部分表明在 `adder` crate 中没有找到测试，最后一部分表明 `add_one` crate 中也没有文档测试。

你也可以选择只运行工作空间中某个特定 crate 的测试，只需在根目录中使用 `-p` 参数并指定想要测试的 crate 名称：

```console
$ cargo test -p add_one
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.00s
     Running unittests src/lib.rs (target/debug/deps/add_one-93c49ee75dc46543)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests add_one

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

输出表明，`cargo test` 只运行了 `add_one` crate 的测试，而没有运行 `adder` crate 的测试。

如果你打算把工作空间中的 crate 发布到 [crates.io](https://crates.io/) 上，那么工作空间中的每个 crate 都需要单独发布。和 `cargo test` 一样，你可以通过 `-p` 参数并指定要发布的 crate 名称，来发布工作空间中的某个特定 crate。

现在，试着仿照 `add_one` crate 的方式，把 `add_two` crate 也加入工作空间，作为额外练习吧！

随着项目规模增长，可以考虑使用工作空间：每个较小的组件都比一大块代码更容易理解。如果这些组件经常需要一起修改，那么把它们保留在同一个工作空间中，会更容易协调彼此的变更。
