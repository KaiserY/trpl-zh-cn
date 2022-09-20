## 改进 I/O 项目

> [ch13-03-improving-our-io-project.md](https://github.com/rust-lang/book/blob/main/src/ch13-03-improving-our-io-project.md)
> <br>
> commit cc958ca579816ea6ac7e9067d628b0423a1ed3e4

有了这些关于迭代器的新知识，我们可以使用迭代器来改进第十二章中 I/O 项目的实现来使得代码更简洁明了。让我们看看迭代器如何能够改进 `Config::new` 函数和 `search` 函数的实现。

### 使用迭代器并去掉 `clone`

在示例 12-6 中，我们增加了一些代码获取一个 `String` slice 并创建一个 `Config` 结构体的实例，他们索引 slice 中的值并克隆这些值以便 `Config` 结构体可以拥有这些值。在示例 13-24 中重现了第十二章结尾示例 12-23 中 `Config::new` 函数的实现：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch13-functional-features/listing-12-23-reproduced/src/lib.rs:ch13}}
```

<span class="caption">示例 13-24：重现第十二章结尾的 `Config::new` 函数</span>

那时我们说过不必担心低效的 `clone` 调用了，因为将来可以对他们进行改进。好吧，就是现在！

起初这里需要 `clone` 的原因是参数 `args` 中有一个 `String` 元素的 slice，而 `new` 函数并不拥有 `args`。为了能够返回 `Config` 实例的所有权，我们需要克隆 `Config` 中字段 `query` 和 `filename` 的值，这样 `Config` 实例就能拥有这些值。

在学习了迭代器之后，我们可以将 `new` 函数改为获取一个有所有权的迭代器作为参数而不是借用 slice。我们将使用迭代器功能之前检查 slice 长度和索引特定位置的代码。这会明确 `Config::new` 的工作因为迭代器会负责访问这些值。

一旦 `Config::new` 获取了迭代器的所有权并不再使用借用的索引操作，就可以将迭代器中的 `String` 值移动到 `Config` 中，而不是调用 `clone` 分配新的空间。

#### 直接使用 `env::args` 返回的迭代器

打开 I/O 项目的 *src/main.rs* 文件，它看起来应该像这样：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch13-functional-features/listing-12-24-reproduced/src/main.rs:ch13}}
```

修改第十二章结尾示例 12-24 中的 `main` 函数的开头为示例 13-25 中的代码。在更新 `Config::new` 之前这些代码还不能编译：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-25/src/main.rs:here}}
```

<span class="caption">示例 13-25：将 `env::args` 的返回值传递给 `Config::new`</span>

`env::args` 函数返回一个迭代器！不同于将迭代器的值收集到一个 vector 中接着传递一个 slice 给 `Config::new`，现在我们直接将 `env::args` 返回的迭代器的所有权传递给 `Config::new`。

接下来需要更新 `Config::new` 的定义。在 I/O 项目的 *src/lib.rs* 中，将 `Config::new` 的签名改为如示例 13-26 所示。这仍然不能编译因为我们还需更新函数体：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-26/src/lib.rs:here}}
```

<span class="caption">示例 13-26：以迭代器作为参数更新 `Config::new` 的签名</span>

`env::args` 函数的标准库文档显示，它返回的迭代器的类型为 `std::env::Args`。我们已经更新了 `Config :: new` 函数的签名，因此参数 `args` 的类型为 `std::env::Args` 而不是 `&[String]`。因为我们拥有 `args` 的所有权，并且将通过对其进行迭代来改变 `args` ，所以我们可以将 `mut` 关键字添加到 `args` 参数的规范中以使其可变。

#### 使用 `Iterator` trait 代替索引

接下来，我们将修改 `Config::new` 的内容。标准库文档还提到 `std::env::Args` 实现了 `Iterator` trait，因此我们知道可以对其调用 `next` 方法！示例 13-27 更新了示例 12-23 中的代码，以使用 `next` 方法：

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-27/src/lib.rs:here}}
```

<span class="caption">示例 13-27：修改 `Config::new` 的函数体来使用迭代器方法</span>

请记住 `env::args` 返回值的第一个值是程序的名称。我们希望忽略它并获取下一个值，所以首先调用 `next` 并不对返回值做任何操作。之后对希望放入 `Config` 中字段 `query` 调用 `next`。如果 `next` 返回 `Some`，使用 `match` 来提取其值。如果它返回 `None`，则意味着没有提供足够的参数并通过 `Err` 值提早返回。对 `filename` 值进行同样的操作。

### 使用迭代器适配器来使代码更简明

I/O 项目中其他可以利用迭代器的地方是 `search` 函数，示例 13-28 中重现了第十二章结尾示例 12-19 中此函数的定义：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch12-an-io-project/listing-12-19/src/lib.rs:ch13}}
```

<span class="caption">示例 13-28：示例 12-19 中 `search` 函数的定义</span>

可以通过使用迭代器适配器方法来编写更简明的代码。这也避免了一个可变的中间 `results` vector 的使用。函数式编程风格倾向于最小化可变状态的数量来使代码更简洁。去掉可变状态可能会使得将来进行并行搜索的增强变得更容易，因为我们不必管理 `results` vector 的并发访问。示例 13-29 展示了该变化：

<span class="filename">文件名: src/lib.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch13-functional-features/listing-13-29/src/lib.rs:here}}
```

<span class="caption">示例 13-29：在 `search` 函数实现中使用迭代器适配器</span>

回忆 `search` 函数的目的是返回所有 `contents` 中包含 `query` 的行。类似于示例 13-19 中的 `filter` 例子，可以使用 `filter` 适配器只保留 `line.contains(query)` 返回 `true` 的那些行。接着使用 `collect` 将匹配行收集到另一个 vector 中。这样就容易多了！尝试对 `search_case_insensitive` 函数做出同样的使用迭代器方法的修改吧。

接下来的逻辑问题就是在代码中应该选择哪种风格：是使用示例 13-28 中的原始实现还是使用示例 13-29 中使用迭代器的版本？大部分 Rust 程序员倾向于使用迭代器风格。开始这有点难以理解，不过一旦你对不同迭代器的工作方式有了感觉之后，迭代器可能会更容易理解。相比摆弄不同的循环并创建新 vector，（迭代器）代码则更关注循环的目的。这抽象掉那些老生常谈的代码，这样就更容易看清代码所特有的概念，比如迭代器中每个元素必须面对的过滤条件。

不过这两种实现真的完全等同吗？直觉上的假设是更底层的循环会更快一些。让我们聊聊性能吧。

[lifetime-elision]: ch10-03-lifetime-syntax.html#生命周期省略lifetime-elision
