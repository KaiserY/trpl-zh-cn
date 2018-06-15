## 将 crate 发布到 Crates.io

> [ch14-02-publishing-to-crates-io.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch14-02-publishing-to-crates-io.md)
> <br>
> commit ff93f82ff63ade5a352d9ccc430945d4ec804cdf

我们曾经在项目中使用 [crates.io](https://crates.io)<!-- ignore --> 上的包作为依赖，不过你也可以通过发布自己的包来向它人分享代码。[crates.io](https://crates.io)<!-- ignore --> 用来分发包的源代码，所以它主要托管开源代码。

Rust 和 Cargo 有一些帮助它人更方便找到和使用你发布的包的功能。我们将介绍一些这样的功能，接着讲到如何发布一个包。


### 编写有用的文档注释

准确的包文档有助于其他用户理解如何以及何时使用他们，所以花一些时间编写文档是值得的。第三章中我们讨论了如何使用 `//` 注释 Rust 代码。Rust 也有特定的用于文档的注释类型，通常被称为 **文档注释**（*documentation comments*），他们会生成 HTML 文档。这些 HTML 展示公有 API 文档注释的内容，他们意在让对库感兴趣的程序员理解如何 **使用** 这个 crate，而不是它是如何被 **实现** 的。

文档注释使用 `///` 而不是 `//` 并支持 Markdown 注解来格式化文本。文档注释就位于需要文档的项的之前。示例 14-1 展示了一个 `my_crate` crate 中 `add_one` 函数的文档注释：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let five = 5;
///
/// assert_eq!(6, my_crate::add_one(5));
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

<span class="caption">示例 14-1：一个函数的文档注释</span>

这里，我们提供了一个 `add_one` 函数工作的描述，接着开始了一个标题为 “Examples” 的部分，和展示如何使用 `add_one` 函数的代码。可以运行 `cargo doc` 来生成这个文档注释的 HTML 文档。这个命令运行由 Rust 分发的工具 `rustdoc` 并将生成的 HTML 文档放入 *target/doc* 目录。

为了方便起见，运行 `cargo doc --open` 会构建当前 crate 文档（同时还有所有 crate 依赖的文档）的 HTML 并在浏览器中打开。导航到 `add_one` 函数将会发现文档注释的文本是如何渲染的，如图 14-1 所示：

<img alt="`my_crate` 的 `add_one` 函数所渲染的文档注释 HTML" src="img/trpl14-01.png" class="center" />

<span class="caption">图 14-1：`add_one` 函数的文档注释 HTML</span>

#### 常用（文档注释）部分

示例 14-1 中使用了 `# Examples` Markdown 标题在 HTML 中创建了一个以 “Examples” 为标题的部分。其他一些 crate 作者经常在文档注释中使用的部分有：

- **Panics**：这个函数可能会 `panic!` 的场景。并不希望程序崩溃的函数调用者应该确保他们不会在这些情况下调用此函数。
- **Errors**：如果这个函数返回 `Result`，此部分描述可能会出现何种错误以及什么情况会造成这些错误，这有助于调用者编写代码来采用不同的方式处理不同的错误。
- **Safety**：如果这个函数使用 `unsafe` 代码（这会在第十九章讨论），这一部分应该会涉及到期望函数调用者支持的确保 `unsafe` 块中代码正常工作的不变条件（invariants）。

大部分文档注释不需要所有这些部分，不过这是一个提醒你检查调用你代码的人有兴趣了解的内容的列表。

#### 文档注释作为测试

在文档注释中增加示例代码块是一个清楚的表明如何使用库的方法，这么做还有一个额外的好处：`cargo test` 也会像测试那样运行文档中的示例代码！没有什么比有例子的文档更好的了！也没有什么比不能正常工作的例子更糟的了，因为代码在编写文档时已经改变。尝试 `cargo test` 运行像示例 14-1 中 `add_one` 函数的文档；应该在测试结果中看到像这样的部分：

```text
   Doc-tests my_crate

running 1 test
test src/lib.rs - add_one (line 5) ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

现在尝试改变函数或例子来使例子中的 `assert_eq!` 产生 panic。再次运行 `cargo test`，你将会看到文档测试捕获到了例子与代码不再同步！

#### 注释包含项的结构

还有另一种风格的文档注释，`//!`，这为包含注释的项，而不是注释之后的项增加文档。这通常用于 crate 根文件（通常是 *src/lib.rs*）或模块的根文件为 crate 或模块整体提供文档。

作为一个例子，如果我们希望增加描述包含 `add_one` 函数的 `my_crate` crate 目的的文档，可以在 *src/lib.rs* 开头增加以 `//!` 开头的注释，如示例 14-2 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
//! # My Crate
//!
//! `my_crate` is a collection of utilities to make performing certain
//! calculations more convenient.

/// Adds one to the number given.
// --snip--
```

<span class="caption">示例 14-2：`my_crate` crate 整体的文档</span>

注意 `//!` 的最后一行之后没有任何代码。因为他们以 `//!` 开头而不是 `///`，这是属于包含此注释的项而不是注释之后项的文档。在这个情况中，包含这个注释的项是 *src/lib.rs* 文件，也就是 crate 根文件。这些注释描述了整个 crate。

如果运行 `cargo doc --open`，将会发现这些注释显示在 `my_crate` 文档的首页，位于 crate 中公有项列表之上，如图 14-2 所示：

<img alt="crate 整体注释所渲染的 HTML 文档" src="img/trpl14-02.png" class="center" />

<span class="caption">图 14-2：包含 `my_crate` 整体描述的注释所渲染的文档</span>

位于项之中的文档注释对于描述 crate 和模块特别有用。使用他们描述其容器整体的目的来帮助 crate 用户理解你的代码组织。

### 使用 `pub use` 导出合适的公有 API

第七章介绍了如何使用 `mod` 关键字来将代码组织进模块中，如何使用 `pub` 关键字将项变为公有，和如何使用 `use` 关键字将项引入作用域。然而对你开发来说很有道理的结果可能对用户来说就不太方便了。你可能希望将结构组织进有多个层次的层级中，不过想要使用被定义在很深层级中的类型的人可能很难发现这些类型是否存在。他们也可能会厌烦 `use my_crate::some_module::another_module::UsefulType;` 而不是 `use my_crate::UsefulType;` 来使用类型。

公有 API 的结构是你发布 crate 时主要需要考虑的。crate 用户没有你那么熟悉其结构，并且如果模块层级过大他们可能会难以找到所需的部分。

好消息是，如果结果对于用户来说 **不是** 很方便，你也无需重新安排内部组织：你可以选择使用 `pub use` 重导出（re-export）项来使公有结构不同于私有结构。重导出获取位于一个位置的公有项并将其公开到另一个位置，好像它就定义在这个新位置一样。

例如，假设我们创建了一个模块化了充满艺术化气息的库 `art`。在这个库中是一个包含两个枚举 `PrimaryColor` 和 `SecondaryColor` 的模块 `kinds`，以及一个包含函数 `mix` 的模块 `utils`，如示例 14-3 所示：

<span class="filename">文件名: src/lib.rs</span>

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
        // --snip--
    }
}
```

<span class="caption">示例 14-3：一个库 `art` 其组织包含 `kinds` 和 `utils` 模块</span>

`cargo doc` 所生成的 crate 文档首页如图 14-3 所示：

<img alt="包含 `kinds` 和 `utils` 模块的 `art`" src="img/trpl14-03.png" class="center" />

<span class="caption">图 14-3：包含 `kinds` 和 `utils` 模块的库 `art` 的文档首页</span>

注意 `PrimaryColor` 和 `SecondaryColor` 类型没有在首页中列出，`mix` 函数也是。必须点击 `kinds` 或 `utils` 才能看到他们。

另一个依赖这个库的 crate 需要 `use` 语句来导入 `art` 中的项，这包含指定其当前定义的模块结构。示例 14-4 展示了一个使用 `art` crate 中 `PrimaryColor` 和 `mix` 项的 crate 的例子：

<span class="filename">文件名: src/main.rs</span>

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

<span class="caption">示例 14-4：一个通过导出内部结构使用 `art` crate 中项的 crate</span>

示例 14-4 中使用 `art` crate 代码的作者不得不搞清楚 `PrimaryColor` 位于 `kinds` 模块而 `mix` 位于 `utils` 模块。`art` crate 的模块结构相比使用它的开发者来说对编写它的开发者更有意义。其内部的 `kinds` 模块和 `utils` 模块的组织结构并没有对尝试理解如何使用它的人提供任何有价值的信息。`art` crate 的模块结构因不得不搞清楚所需的内容在何处和必须在 `use` 语句中指定模块名称而显得混乱和不便。

为了从公有 API 中去掉 crate 的内部组织，我们可以采用示例 14-3 中的 `art` crate 并增加 `pub use` 语句来重导出项到顶层结构，如示例 14-5 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
//! # Art
//!
//! A library for modeling artistic concepts.

pub use kinds::PrimaryColor;
pub use kinds::SecondaryColor;
pub use utils::mix;

pub mod kinds {
    // --snip--
}

pub mod utils {
    // --snip--
}
```

<span class="caption">示例 14-5：增加 `pub use` 语句重导出项</span>

现在此 crate 由 `cargo doc` 生成的 API 文档会在首页列出重导出的项以及其链接，如图 14-4 所示，这就使得这些类型易于查找。

<img alt="Rendered documentation for the `art` crate with the re-exports on the front page" src="img/trpl14-04.png" class="center" />

<span class="caption">图 14-10：`art` 文档的首页，这里列出了重导出的项</span>

`art` crate 的用户仍然可以看见和选择使用示例 14-3 中的内部结构，或者可以使用示例 14-4 中更为方便的结构，如示例 14-6 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
extern crate art;

use art::PrimaryColor;
use art::mix;

fn main() {
    // --snip--
}
```

<span class="caption">示例 14-6：一个使用 `art` crate 中重导出项的程序</span>

对于有很多嵌套模块的情况，使用 `pub use` 将类型重导出到顶级结构对于使用 crate 的人来说将会是大为不同的体验。

创建一个有用的公有 API 结构更像是一门艺术而非科学，你可以反复检视他们来找出最适合用户的 API。选择 `pub use` 提供了解耦组织 crate 内部结构和与终端用户体现的灵活性。观察一些你所安装的 crate 的代码来看看其内部结构是否不同于公有 API。

### 创建 Crates.io 账号

在你可以发布任何 crate 之前，需要在 [crates.io](https://crates.io)<!-- ignore --> 上注册账号并获取一个 API token。为此，访问位于 [crates.io](https://crates.io)<!-- ignore --> 的首页并使用 GitHub 账号登陆————目前 GitHub 账号是必须的，不过将来该网站可能会支持其他创建账号的方法。一旦登陆之后，查看位于 [https://crates.io/me/](https://crates.io/me/)<!-- ignore --> 的账户设置页面并获取 API token。接着使用该 API token 运行 `cargo login` 命令，像这样：

```text
$ cargo login abcdefghijklmnopqrstuvwxyz012345
```

这个命令会通知 Cargo 你的 API token 并将其储存在本地的 *~/.cargo/credentials* 文件中。注意这个 token 是一个 **秘密**（**secret**）且不应该与其他人共享。如果因为任何原因与他人共享了这个信息，应该立即到 [crates.io](https://crates.io)<!-- ignore --> 重新生成这个 token。

### 发布新 crate 之前

有了账号之后，比如说你已经有一个希望发布的 crate。在发布之前，你需要在 crate 的 *Cargo.toml* 文件的 `[package]` 部分增加一些本 crate 的元信息（metadata）。

首先 crate 需要一个唯一的名称。虽然在本地开发 crate 时，可以使用任何你喜欢的名称。不过 [crates.io](https://crates.io)<!-- ignore --> 上的 crate 名称遵守先到先得的分配原则。一旦某个 crate 名称被使用，其他人就不能再发布这个名称的 crate 了。请在网站上搜索你希望使用的名称来找出它是否已被使用。如果没有，修改 *Cargo.toml* 中 `[package]` 里的名称为你希望用于发布的名称，像这样：

<span class="filename">文件名: Cargo.toml</span>

```toml
[package]
name = "guessing_game"
```

即使你选择了一个唯一的名称，如果此时尝试运行 `cargo publish` 发布该 crate 的话，会得到一个一个警告接着是一个错误：

```text
$ cargo publish
    Updating registry `https://github.com/rust-lang/crates.io-index`
warning: manifest has no description, license, license-file, documentation,
homepage or repository.
--snip--
error: api errors: missing or empty metadata fields: description, license.
```

这是因为我们缺少一些关键信息：关于该 crate 用途的描述和用户可能在何种条款下使用该 crate 的 license。为了修正这个错误，需要在 *Cargo.toml* 中引入这些信息。

描述通常是一两句话，因为它会出现在 crate 的搜索结果中和 crate 页面里。对于 `license` 字段，你需要一个 **license 标识符值**（*license identifier value*）。Linux 基金会位于 *http://spdx.org/licenses/* 的 Software Package Data Exchange (SPDX) 列出了可以使用的标识符。例如，为了指定 crate 使用 MIT License，增加 `MIT` 标识符：

<span class="filename">文件名: Cargo.toml</span>

```toml
[package]
name = "guessing_game"
license = "MIT"
```

如果你希望使用不存在于 SPDX 的 license，则需要将 license 文本放入一个文件，将该文件包含进项目中，接着使用 `license-file` 来指定文件名而不是使用 `license` 字段。

关于项目所适用的 license 指导超出了本书的范畴。很多 Rust 社区成员选择与 Rust 自身相同的 license，这是一个双许可的 `MIT OR Apache-2.0` ———— 这展示了也可以通过 `OR` 来分隔来为项目指定多个 license 标识符。

那么，有了唯一的名称、版本号、由 `cargo new` 新建项目时增加的作者信息、描述和所选择的 license，已经准备好发布的项目的 *Cargo.toml* 文件可能看起来像这样：

<span class="filename">文件名: Cargo.toml</span>

```toml
[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Your Name <you@example.com>"]
description = "A fun game where you guess what number the computer has chosen."
license = "MIT OR Apache-2.0"

[dependencies]
```

[Cargo 的文档](http://doc.rust-lang.org/cargo/) 描述了其他可以指定的元信息，他们可以帮助你的 crate 更容易被发现和使用！

### 发布到 Crates.io

现在我们创建了一个账号，保存了 API token，为 crate 选择了一个名字，并指定了所需的元数据，你已经准备好发布了！发布 crate 会上传特定版本的 crate 到 [crates.io](https://crates.io)<!-- ignore --> 以供他人使用。

发布 crate 时请多加小心，因为发布是 **永久性的**（*permanent*）。对应版本不可能被覆盖，其代码也不可能被删除。[crates.io](https://crates.io)<!-- ignore --> 的一个主要目标是作为一个代码的永久文档服务器，这样所有依赖 [crates.io](https://crates.io)<!-- ignore --> 中 crate 的项目都能一直正常工作。允许删除版本将不可能满足这个目标。然而，可以被发布的版本号却没有限制。

再次运行 `cargo publish` 命令。这次它应该会成功：

```text
$ cargo publish
 Updating registry `https://github.com/rust-lang/crates.io-index`
Packaging guessing_game v0.1.0 (file:///projects/guessing_game)
Verifying guessing_game v0.1.0 (file:///projects/guessing_game)
Compiling guessing_game v0.1.0
(file:///projects/guessing_game/target/package/guessing_game-0.1.0)
 Finished dev [unoptimized + debuginfo] target(s) in 0.19 secs
Uploading guessing_game v0.1.0 (file:///projects/guessing_game)
```

恭喜！你现在向 Rust 社区分享了代码，而且任何人都可以轻松的将你的 crate 加入他们项目的依赖。

### 发布现存 crate 的新版本

当你修改了 crate 并准备好发布新版本时，改变 *Cargo.toml* 中 `version` 所指定的值。请使用 [语义化版本规则][semver] 来根据修改的类型决定下一个版本号。接着运行 `cargo publish` 来上传新版本。

[semver]: http://semver.org/

### 使用 `cargo yank` 从 Crates.io 撤回版本

虽然你不能删除之前版本的 crate，但是可以阻止任何将来的项目将他们加入到依赖中。这在某个版本因为这样或那样的原因被破坏的情况很有用。对于这种情况，Cargo 支持 **撤回**（*yanking*）某个版本。

撤回某个版本会阻止新项目开始依赖此版本，不过所有现存此依赖的项目仍然能够下载和依赖这个版本。从本质上说，撤回意味着所有带有 *Cargo.lock* 的项目的依赖不会被破坏，同时任何新生成的 *Cargo.lock* 将不能使用被撤回的版本。

为了撤回一个 crate，运行 `cargo yank` 并指定希望撤回的版本：

```text
$ cargo yank --vers 1.0.1
```

也可以撤销撤回操作，并允许项目可以再次开始依赖某个版本，通过在命令上增加 `--undo`：

```text
$ cargo yank --vers 1.0.1 --undo
```

撤回 **并没有** 删除任何代码。举例来说，撤回功能并不意在删除不小心上传的秘密信息。如果出现了这种情况，请立即重新设置这些秘密信息。