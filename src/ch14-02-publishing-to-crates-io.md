## 将 crate 发布到 Crates.io

> [ch14-02-publishing-to-crates-io.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-02-publishing-to-crates-io.md)
> <br>
> commit f2eef19b3a39ee68dd363db2fcba173491ba9dc4

我们曾经在项目中增加 crates.io 上的 crate 作为依赖。也可以选择将代码分享给其他人。Crates.io 用来分发包的源代码，所以它主要用于分发开源代码。

Rust 和 Cargo 有一些帮助人们找到和使用你发布的包的功能。我们将介绍这些功能，接着讲到如何发布一个包。

### 文档注释

在第三章中，我们见到了以`//`开头的注释，Rust 还有第二种注释：**文档注释**（*documentation comment*）。注释固然对阅读代码的人有帮助，也可以生成 HTML 代码来显式公有 API 的文档注释，这有助于那些对如何**使用** crate 有兴趣而不关心如何**实现**的人。注意只有库 crate 能生成文档，因为二进制 crate 并没有人们需要知道如何使用的公有 API。

文档注释使用`///`而不是`//`并支持 Markdown 注解。他们就位于需要文档的项的之前。如下是一个`add_one`函数的文档注释：

<span class="filename">Filename: src/lib.rs</span>

````rust
/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let five = 5;
///
/// assert_eq!(6, add_one(five));
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
````

<span class="caption">Listing 14-1: A documentation comment for a
function</span>

`cargo doc`运行一个由 Rust 分发的工具，`rustdoc`，来为这些注释生成 HTML 文档。可以运行`cargo doc --open`在本地尝试一下，这会构建当前状态的文档（以及 crate 的依赖）并在浏览器中打开。导航到`add_one`函数将会发现文档注释是如何渲染的。

在文档注释中增加示例代码块是一个清楚的表明如何使用库的方法。这么做还有一个额外的好处：`cargo test`也会像测试那样运行文档中的示例代码！没有什么比有例子的文档更好的了！也没有什么比不能正常工作的例子更糟的了，因为代码在编写文档时已经改变。尝试`cargo test`运行列表 14-1 中`add_one`函数的文档；将会看到如下测试结果：

```test
   Doc-tests add-one

running 1 test
test add_one_0 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured
```

尝试改变示例或函数并观察`cargo test`会捕获不再能运行的例子！

还有另一种风格的文档注释，`//!`，用于注释包含项的结构（例如：crate、模块或函数），而不是其之后的项。这通常用在 crate 的根（lib.rs）或模块的根（mod.rs）来分别编写 crate 或模块整体的文档。如下是包含整个标准库的`libstd`模块的文档：

```
//! # The Rust Standard Library
//!
//! The Rust Standard Library provides the essential runtime
//! functionality for building portable Rust software.
```

### 使用`pub use`来导出合适的公有 API

第七章介绍了如何使用`mod`关键字来将代码组织进模块中，如何使用`pub`关键字将项变为公有，和如何使用`use`关键字将项引入作用域。当发布 crate 给并不熟悉其使用的库的实现的人时，就值得花时间考虑 crate 的结构对于开发和对于依赖 crate 的人来说是否同样有用。如果结构对于供其他库使用来说并不方便，也无需重新安排内部组织：可以选择使用`pub use`来重新导出一个不同的公有结构。

例如列表 14-2 中，我们创建了一个库`art`，其包含一个`kinds`模块，模块中包含枚举`Color`和包含函数`mix`的模块`utils`：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
//! # Art
//!
//! A library for modeling artistic concepts.

pub mod kinds {
    /// The primary colors according to the RYB color model.
    pub enum PrimaryColor {
        Red,
        Yellow,
        Blue,
    }

    /// The secondary colors according to the RYB color model.
    pub enum SecondaryColor {
        Orange,
        Green,
        Purple,
    }
}

pub mod utils {
    use kinds::*;

    /// Combines two primary colors in equal amounts to create
    /// a secondary color.
    pub fn mix(c1: PrimaryColor, c2: PrimaryColor) -> SecondaryColor {
        // ...snip...
#         SecondaryColor::Green
    }
}
```

<span class="caption">Listing 14-2: An `art` library with items organized into
`kinds` and `utils` modules</span>

为了使用这个库，列表 14-3 中另一个 crate 中使用了`use`语句：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern crate art;

use art::kinds::PrimaryColor;
use art::utils::mix;

fn main() {
    let red = PrimaryColor::Red;
    let yellow = PrimaryColor::Yellow;
    mix(red, yellow);
}
```

<span class="caption">Listing 14-3: A program using the `art` crate's items
with its internal structure exported</span>

库的用户并不需要知道`PrimaryColor`和`SecondaryColor`位于`kinds`模块中和`mix`位于`utils`模块中；这些结构对于内部组织是有帮助的，不过对于外部的观点来说没有什么意义。

为此，可以选择在列表 14-2 中增加如下`pub use`语句来将这些类型重新导出到顶级结构，如列表 14-4 所示：

<span class="filename">Filename: src/lib.rs</span>

```rust,ignore
//! # Art
//!
//! A library for modeling artistic concepts.

pub use kinds::PrimaryColor;
pub use kinds::SecondaryColor;
pub use utils::mix;

pub mod kinds {
    // ...snip...
```

<span class="caption">Listing 14-4: Adding `pub use` statements to re-export
items</span>

<!-- Will add ghosting in libreoffice /Carol -->

重导出的项将会被连接和排列在 crate API 文档的头版。`art` crate 的用户仍然可以像列表 14-3 那样使用内部结构，或者使用列表 14-4 中更方便的结构，如列表 14-5 所示：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
extern crate art;

use art::PrimaryColor;
use art::mix;

fn main() {
    // ...snip...
}
```

<span class="caption">Listing 14-5: Using the re-exported items from the `art`
crate</span>

<!-- Will add ghosting in libreoffice /Carol -->

创建一个有用的公有 API 结构更像一种艺术而不是科学。选择`pub use`提供了如何向用户暴露 crate 内部结构的灵活性。观察一些你所安装的 crate 的代码来看看其内部结构是否不同于公有 API。

### 在第一次发布之前

在能够发布任何 crate 之前，你需要在[crates.io]上注册一个账号并获取一个 API token。为此，[访问其官网][crates.io]并使用 GitHub 账号登陆。目前 GitHub 账号是必须的，不过将来网站可能会支持其他创建账号的方法。一旦登陆之后，查看[Account Settings]页面并使用其中指定的 API key 运行`cargo login`命令，这看起来像这样：

[crates.io]: https://crates.io
[Account Settings]: https://crates.io/me

```
$ cargo login abcdefghijklmnopqrstuvwxyz012345
```

这个命令会通知 Cargo 你的 API token 并将其储存在本地的 *~/.cargo/config* 文件中。注意这个 token 是一个**秘密**（**secret**）并不应该与其他人共享。如果因为任何原因与他人共享了这个信息，应该立即重新生成这个 token。

### 在发布新 crate 之前

首先，crate 必须有一个位移的名称。虽然在本地开发 crate 时，可以使用任何你喜欢的名字，不过[crates.io]上的 crate 名称遵守先到先得的原则分配。一旦一个 crate 名被使用，就不能被另一个 crate 所使用，所以请确认你喜欢的名字在网站上是可用的。

如果尝试发布由`cargo new`生成的 crate，会出现一个警告接着是一个错误：

```
$ cargo publish
    Updating registry `https://github.com/rust-lang/crates.io-index`
warning: manifest has no description, license, license-file, documentation,
homepage or repository.
...snip...
error: api errors: missing or empty metadata fields: description, license.
Please see http://doc.crates.io/manifest.html#package-metadata for how to
upload metadata
```

我们可以在包的 *Cargo.toml* 文件中包含更多的信息。其中一些字段是可选的，不过描述和 license 是发布所必须的，因为这样人们才能知道 crate 是干什么的已经在什么样的条款下可以使用他们。

描述连同 crate 一起出现在搜索结果和 crate 页面中。描述通常是一两句话。`license`字段获取一个 license 标识符值，其可能的值由 Linux 基金会的[Software Package Data Exchange (SPDX)][spdx]指定。如果你想要使用一个不存在于SPDX的 license，则不使用`license`值，使用`license-file`来指定项目中包含你想要使用的 license 的文本的文件名。

关于项目所适用的 license 的指导超出了本书的范畴。很多 Rust 社区成员选择与 Rust 自身相同的 license，它是一个双许可的`MIT/Apache-2.0`，这表明可以通过斜杠来分隔指定多个 license。所以一个准备好发布的项目的 *Cargo.toml* 文件看起来像这样：

[spdx]: http://spdx.org/licenses/

```toml
[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
description = "A fun game where you guess what number the computer has chosen."
license = "MIT/Apache-2.0"

[dependencies]
```

请查看[crates.io 的文档][other-metadata]中关于其他可以指定元数据的内容，他们可以帮助你的 crate 更容易被发现和使用！

[other-metadata]: http://doc.crates.io/manifest.html#package-metadata

### 发布到 Crates.io

现在我们创建了一个账号，保存了 API token，为 crate 选择了一个名字，并指定了所需的元数据，我们已经准备好发布了！发布 crate 是一个特定版本的 crate 被上传并托管在 crates.io 的过程。

发布 crate 请多加小心，因为发布是**永久性的**。对应版本不能被覆盖，其代码也不可能被删除。然而，可以被发布的版本号却没有限制。

让我们运行`cargo publish`命令，这次它应该会成功因为已经指定了必须的元数据：

```
$ cargo publish
 Updating registry `https://github.com/rust-lang/crates.io-index`
Packaging guessing_game v0.1.0 (file:///projects/guessing_game)
Verifying guessing_game v0.1.0 (file:///projects/guessing_game)
Compiling guessing_game v0.1.0
(file:///projects/guessing_game/target/package/guessing_game-0.1.0)
 Finished debug [unoptimized + debuginfo] target(s) in 0.19 secs
Uploading guessing_game v0.1.0 (file:///projects/guessing_game)
```

恭喜！你现在向 Rust 社区分享了代码，而且任何人都可以轻松的将你的 crate 加入他们项目的依赖。

### 发布已有 crate 的新版本

当你修改了 crate 并准备好发布新版本时，改变 *Cargo.toml* 中`version`所指定的值。请使用[语义化版本规则][semver]来根据修改的类型决定下一个版本呢号。接着运行`cargo publish`来上传新版本。

[semver]: http://semver.org/

### 使用`cargo yank`从 Crates.io 删除版本

发布版本时可能会出现意外，因为这样那样的原因导致功能被破坏，比如语法错误或忘记引入某些文件。对于这种情况，Cargo 支持 *yanking* 一个版本。

标记一个版本的 crate 为 yank 意味着没有项目能够再开始依赖这个版本，不过现存的已经依赖这个版本的项目仍然能够下载和依赖这个版本的内容。crates.io 的一个主要目的是作为一个代码的永久档案库，这样能够保证所有的项目都能继续构建，而允许删除一个版本违反了这个目标。本质上来说，yank 意味着所有带有 *Cargo.lock* 的项目并不会被破坏，同时任何未来生成的 *Cargo.lock* 将不能使用被撤回的版本。

yank 并**不**意味着删除了任何代码。例如 yank 功能不打算删除意外上传的 secret。如果这发生了，请立刻重置这些 secret。

为了 yank 一个版本的 crate，运行`cargo yank`并指定需要 yank 的版本：

```
$ cargo yank --vers 1.0.1
```

也可以撤销 yank，并允许项目开始依赖这个版本，通过在命令中加上`--undo`：

```
$ cargo yank --vers 1.0.1 --undo
```