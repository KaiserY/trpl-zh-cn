## 附录 G：Rust 是如何开发的与 “Nightly Rust”

[appendix-07-nightly-rust.md](https://github.com/rust-lang/book/blob/af415fc6c8a6823dfb4595074f27d5a3e9e2fe49/src/appendix-07-nightly-rust.md)

本附录介绍 Rust 是如何开发的以及这对你作为 Rust 开发者的影响。

### 无停滞稳定

作为一门语言，Rust **十分**注重代码的稳定性。我们希望 Rust 成为你可依赖的坚实基础，假如事务持续地在变化，这个希望就实现不了。但与此同时，如果不能实验新功能的话，在发布之前我们又无法发现其中重大的缺陷，而一旦发布便再也没有修改的机会了。

对于这个问题我们的解决方案被称为 “无停滞稳定”（“stability without stagnation”），其指导性原则是：无需担心升级到最新的稳定版 Rust。每次升级应该是无痛的，并应带来新功能，更少的 bug 和更快的编译速度。

### Choo, Choo! 发布通道和发布时刻表（Riding the Trains）

Rust 开发运行于一个**发布时刻表**（_train schedule_）之上。也就是说，所有的开发工作都发生在 Rust 仓库的主分支上。发布采用 software release train 模型，它曾被 Cisco IOS 及其他软件项目采用。Rust 有三个**发布通道**（_release channel_）：

- Nightly
- Beta
- Stable（稳定版）

大部分 Rust 开发者主要采用稳定版通道，不过希望实验新功能的开发者可能会使用 nightly 或 beta 版。

如下是一个开发和发布过程如何运转的例子：假设 Rust 团队正在进行 Rust 1.5 的发布工作。该版本发布于 2015 年 12 月，不过这里只是为了提供一个真实的版本号。Rust 新增了一项功能：一个新提交进入了主分支。每天晚上，都会产生一个新的 nightly 版本。每天都是发布日，而这些发布由发布基础设施自动完成。所以随着时间推移，发布轨迹看起来像这样，版本每晚一发：

```text
nightly: * - - * - - *
```

每六周时间，是准备发布新版本的时候了！Rust 仓库的 `beta` 分支会从 nightly 所使用的主分支分出。现在，有了两个发布渠道：

```text
nightly: * - - * - - *
                     |
beta:                *
```

大部分 Rust 用户不会主要使用 beta 版本，不过在 CI 系统中对 beta 版本进行测试能够帮助 Rust 发现可能的回归缺陷（regression）。同时，每晚仍产生 nightly 发布：

```text
nightly: * - - * - - * - - * - - *
                     |
beta:                *
```

比如我们发现了一个回归缺陷。好消息是，在这些回归缺陷流入稳定发布之前，我们还有一些时间来测试 beta 版本！修复会先应用到主分支，因此 nightly 版本先得到修复；然后再把修复回移植到 `beta` 分支，于是新的 beta 发布就产生了：

```text
nightly: * - - * - - * - - * - - * - - *
                     |
beta:                * - - - - - - - - *
```

第一个 beta 版的六周后，是发布稳定版的时候了！`stable` 分支从 `beta` 分支生成：

```text
nightly: * - - * - - * - - * - - * - - * - * - *
                     |
beta:                * - - - - - - - - *
                                       |
stable:                                *
```

好的！Rust 1.5 发布了！然而，我们忘了些东西：因为又过了六周，我们还需发布**下一个** Rust 的 beta 版，Rust 1.6。所以从 `beta` 生成 `stable` 分支后，新版的 `beta` 分支也再次从 `nightly` 生成：

```text
nightly: * - - * - - * - - * - - * - - * - * - *
                     |                         |
beta:                * - - - - - - - - *       *
                                       |
stable:                                *
```

这被称为 “train model”，因为每六周，一个版本 “离开车站”（“leaves the station”），不过从 beta 通道到达稳定通道还需历经一段旅程。

Rust 每六周发布一个版本，如时钟般准确。如果你知道了某个 Rust 版本的发布时间，就可以知道下个版本的时间：六周后。每六周发布版本的一个好的方面是下一班车会来得更快。如果特定版本碰巧缺失某个功能也无需担心：另一个版本很快就会到来！这有助于减少因临近发版时间而偷偷释出未经完善的功能的压力。

多亏了这个过程，你总是可以切换到下一版本的 Rust 并验证是否可以轻易的升级：如果 beta 版不能如期工作，你可以向 Rust 团队报告并在发布稳定版之前得到修复！beta 版造成的破坏是非常少见的，不过 `rustc` 也不过是一个软件，难免会有 bug。

### 维护时间

Rust 项目仅对最近的稳定版本提供支持。当发布新稳定版本时，旧版本即达到生命周期终止（EOL, end of life），这意味着每个版本的支持期为六周。

### 不稳定功能

这个发布模型中另一个值得注意的地方：不稳定功能（unstable features）。Rust 使用一种叫做 **feature flags** 的技术来决定某个发布中启用了哪些功能。如果一个新功能仍在积极开发中，它会进入主分支，因此也会出现在 nightly 版本里，但会被放在某个 **功能标记** 之后。作为用户，如果你想尝试这个仍在开发中的功能，可以这么做，但你必须使用 nightly 版 Rust，并在源码中添加相应的标记来显式启用它。

如果使用的是 beta 或稳定版 Rust，则不能使用任何功能标记。这是在新功能被宣布为永久稳定之前让大家提前实际使用它们的关键。这既满足了希望使用最尖端技术的同学，那些坚持稳定版的同学也知道其代码不会被破坏。这就是无停滞稳定。

本书只包含稳定的功能，因为还在开发中的功能仍可能改变，当其进入稳定版时肯定会与编写本书的时候有所不同。你可以在网上获取只存在 nightly 版中功能的文档。

### Rustup 和 Rust Nightly 的职责

Rustup 使得在不同 Rust 发布通道之间切换变得很容易，无论是全局还是按项目都可以。默认情况下，你安装的是稳定版 Rust。例如，要安装 nightly：

```console
$ rustup toolchain install nightly
```

你也可以用 `rustup` 查看已经安装的所有**工具链**（_toolchains_，也就是 Rust 发布版本及其相关组件）。下面是一位作者的 Windows 电脑上的例子：

```powershell
> rustup toolchain list
stable-x86_64-pc-windows-msvc (default)
beta-x86_64-pc-windows-msvc
nightly-x86_64-pc-windows-msvc
```

如你所见，默认是稳定版。大部分 Rust 用户在大部分时间使用稳定版。你可能也会这么做，不过如果你关心最新的功能，可以为特定项目使用 nightly 版。为此，可以在项目目录使用 `rustup override` 来设置当前目录 `rustup` 使用 nightly 工具链：

```console
$ cd ~/projects/needs-nightly
$ rustup override set nightly
```

现在，每次在 _~/projects/needs-nightly_ 中调用 `rustc` 或 `cargo`，`rustup` 会确保使用 nightly 版 Rust 而非默认的稳定版。在你有很多 Rust 项目时大有裨益！

### RFC 流程和团队

那么你如何了解这些新功能呢？Rust 开发模式遵循一个 **Request For Comments (RFC) 流程**。如果你希望改进 Rust，可以编写一个提案，也就是 RFC。

任何人都可以编写 RFC 来改进 Rust，同时这些 RFC 会被 Rust 团队评审和讨论，他们由很多不同分工的子团队组成。这里是 [Rust 官网上](https://www.rust-lang.org/governance) 所有团队的总列表，其包含了项目中每个领域的团队：语言设计、编译器实现、基础设施、文档等。各个团队会阅读相应的提议和评论，发表自己的意见，并最终达成接受或回绝功能的一致。

如果功能被接受了，Rust 仓库里就会开一个 issue，然后就会有人去实现它。最终完成实现的人，很可能并不是最初提出这个功能的人！当实现准备好之后，它会合并到主分支，并被放在一个 feature gate 之后，正如 [“不稳定功能”](#不稳定功能) 一节所讨论的那样。

在稍后的某个时间，一旦使用 nightly 版的 Rust 团队能够尝试这个功能了，团队成员会讨论这个功能，它如何在 nightly 中工作，并决定是否应该进入稳定版。如果决定继续推进，功能开关会移除，然后这个功能就被认为是稳定的了！乘着“发布列车”，最终在新的稳定版 Rust 中出现。
