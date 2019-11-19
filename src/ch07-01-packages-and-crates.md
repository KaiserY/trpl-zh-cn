## 包和 crate

> [ch07-01-packages-and-crates.md](https://github.com/rust-lang/book/blob/master/src/ch07-01-packages-and-crates.md)
> <br>
> commit 879fef2345bf32751a83a9e779e0cb84e79b6d3d

模块系统的第一部分，我们将介绍包和 crate。crate 是一个二进制项或者库。*crate root* 是一个源文件，Rust 编译器以它为起始点，并构成你的 crate 的根模块（我们将在 “[Defining Modules to Control Scope and Privacy](https://github.com/rust-lang/book/blob/master/src/ch07-02-defining-modules-to-control-scope-and-privacy.md)” 一节深入解读）。*包*（*package*） 是提供一系列功能的一个或者多个 crate。一个包会包含有一个 *Cargo.toml* 文件，阐述如何去构建这些 crate。

包中所包含的内容由几条规则来确立。一个包中至多 **只能** 包含一个库 crate(library crate)；包中可以包含任意多个二进制 crate(binary crate)；包中至少包含一个 crate，无论是库的还是二进制的。

让我们来看看创建包的时候会发生什么。首先，我们输入命令 `cargo new`：

```text
$ cargo new my-project
     Created binary (application) `my-project` package
$ ls my-project
Cargo.toml
src
$ ls my-project/src
main.rs
```

当我们输入了这条命令，Cargo 会给我们的包创建一个 *Cargo.toml* 文件。查看 *Cargo.toml* 的内容，会发现并没有提到 *src/main.rs*，因为 Cargo 遵循的一个约定：*src/main.rs* 就是一个与包同名的二进制 crate 的 crate 根。同样的，Cargo 知道如果包目录中包含 *src/lib.rs*，则包带有与其同名的库 crate，且 *src/lib.rs* 是 crate 根。crate 根文件将由 Cargo 传递给 `rustc` 来实际构建库或者二进制项目。

在此，我们有了一个只包含 *src/main.rs* 的包，意味着它只含有一个名为 `my-project` 的二进制 crate。如果一个包同时含有 *src/main.rs* 和 *src/lib.rs*，则它有两个 crate：一个库和一个二进制项，且名字都与包相同。通过将文件放在 *src/bin* 目录下，一个包可以享有多个二进制 crate：每个文件都是一个分离出来的二进制 crate。

一个 crate 会将一个作用域内的相关功能分组到一起，使得该功能可以很方便地在多个项目之间共享。举一个例子，我们在 [第二章](https://github.com/rust-lang/book/blob/master/src/ch02-00-guessing-game-tutorial.md#generating-a-random-number) 使用的 `rand` crate 提供了生成随机数的功能。通过将 `rand` crate 加入到我们项目的作用域中，我们就可以在自己的项目中使用该功能。`rand` crate 提供的所有功能都可以通过该 crate 的名字：`rand` 进行访问。

将一个 crate 的功能保持在其自身的作用域中，可以知晓一些特定的功能是在我们的 crate 中定义的还是在 `rand` crate 中定义的，这可以防止潜在的冲突。例如，`rand` crate 提供了一个名为 `Rng` 的特性（trait）。我们还可以在我们自己的 crate 中定义一个名为 `Rng` 的 `struct`。因为一个 crate 的功能是在自身的作用域进行命名的，当我们将 `rand` 作为一个依赖，编译器不会混淆 `Rng` 这个名字的指向。在我们的 crate 中，它指向的是我们自己定义的 `struct Rng`。我们可以通过 `rand::Rng` 这一方式来访问 `rand` crate 中的 `Rng` 特性（trait）。

接下来让我们来说一说模块系统！
