## `if let` 和 `let else` 简洁控制流

<!-- https://github.com/rust-lang/book/blob/main/src/ch06-03-if-let.md -->
<!-- commit 746bf4c43ef0a2810b1f2cb234bfadd5ca5382f6 -->

`if let` 语法让我们以一种不那么冗长的方式结合 `if` 和 `let`，来处理只匹配一个模式的值而忽略其他模式的情况。考虑示例 6-6 中的程序，它匹配一个 `config_max` 变量中的 `Option<u8>` 值并只希望当值为 `Some` 变体时执行代码：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-06/src/main.rs:here}}
```

<span class="caption">示例 6-6：`match` 只关心当值为 `Some` 时执行代码</span>

如果值是 `Some`，我们希望打印出 `Some` 变体中的值，这个值被绑定到模式中的 `max` 变量里。对于 `None` 值我们不希望做任何操作。为了满足 `match` 表达式（穷尽性）的要求，必须在处理完这唯一的变体后加上 `_ => ()`，这样也要增加很多繁琐的样板代码。

不过我们可以使用 `if let` 这种简洁的方式编写。如下代码与示例 6-6 中的 `match` 行为一致：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-12-if-let/src/main.rs:here}}
```

`if let` 语法获取通过等号分隔的一个模式和一个表达式。它的工作方式与 `match` 相同，这里的表达式对应 `match` 而模式则对应第一个分支。在这个例子中，模式是 `Some(max)`，`max` 绑定为 `Some` 中的值。接着可以在 `if let` 代码块中使用 `max` 了，就跟在对应的 `match` 分支中一样。只有当值匹配该模式时，`if let` 块中的代码才会执行。

使用 `if let` 意味着编写更少代码，更少的缩进和更少的样板代码。然而，这样会失去 `match` 强制要求的穷尽性检查来确保你没有忘记处理某些情况。`match` 和 `if let` 之间的选择依赖特定的环境以及增加简洁度和失去穷尽性检查的权衡取舍。

换句话说，可以认为 `if let` 是 `match` 的一个语法糖，它当值匹配某一模式时执行代码而忽略所有其他值。

可以在 `if let` 中包含一个 `else`。`else` 块中的代码与 `match` 表达式中的 `_` 分支块中的代码相同，这样的 `match` 表达式就等同于 `if let` 和 `else`。回忆一下示例 6-4 中 `Coin` 枚举的定义，其 `Quarter` 变体也包含一个 `UsState` 值。如果想要计数所有不是 25 美分的硬币的同时也报告 25 美分硬币所属的州，可以使用这样一个 `match` 表达式：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-13-count-and-announce-match/src/main.rs:here}}
```

或者可以使用这样的 `if let` 和 `else` 表达式：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/no-listing-14-count-and-announce-if-let-else/src/main.rs:here}}
```

## 使用 `let...else` 来保持在 “愉快路径”（“Happy Path”）

在实际编程中，一个常见的场景是：如果某个值存在，就对它做一些操作；如果不存在，就返回一个默认值。还是继续用处理 `UsState` 的硬币作为例子。假设我们要写点有趣的逻辑，它依赖于硬币所代表的州成立了多久。我们就可以在 `UsState` 上定义一个方法，用来检查州的“年龄”：

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-07/src/main.rs:state}}
```

接着我们可能使用 `if let` 来匹配硬币的类型，在条件代码中引入一个 `state`，如示例 6-7 所示。

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-07/src/main.rs:describe}}
```

<figcaption>示例 6-7：使用嵌套在 `if let` 中的条件来检查一个州在 1900 年是否存在</figcaption>

</figure>

这样固然可以完成任务，不过这将工作推进了 `if let` 语句中，如果需要完成的工作更为复杂，则可能难以追踪顶层分支是如何关联的。我们也可以利用这个表达式要么从 `if let` 中生成一个 `state` 要么提前返回的优势，如示例 6-8 所示。（使用 `match` 也可以实现类似效果。）

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-08/src/main.rs:describe}}
```

<figcaption>示例 6-8：使用 `if let` 来产生一个值或提前返回</figcaption>

</figure>

不过这样写在某种程度上会让人觉得有些繁琐！`if let` 的一个分支产生一个值，而另一个分支则直接从函数中返回。

为了使这个通用模式更容易表达，Rust 提供了 `let...else`。`let...else` 语法左侧是一个模式，右侧是一个表达式，非常类似于 `if let`，不过它没有 `if` 分支，只有 `else` 分支。如果模式匹配，它会将匹配到的值绑定到外层作用域。如果模式**不**匹配，程序流会指向 `else` 分支，它必须从函数返回。

在示例 6-9 中，可以看到当在示例 6-8 中的 `if let` 替换为 `let...else` 时看起来如何。

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch06-enums-and-pattern-matching/listing-06-09/src/main.rs:describe}}
```

<figcaption>示例 6-9：使用 `let...else` 来明确函数的流向</figcaption>

</figure>

注意它以这种方式在函数主体中保持了 “愉快路径”（“Happy Path”），而不用像 `if let` 那样在两个分支中拥有明显不同的控制流

如果你的程序遇到一个使用 `match` 表达起来过于冗长的逻辑，记住 `if let` 和 `let...else` 也在你的 Rust 工具箱中。

## 总结

现在我们涉及到了如何使用枚举来创建有一系列可列举值的自定义类型。我们也展示了标准库的 `Option<T>` 类型是如何帮助你利用类型系统来避免出错的。当枚举值包含数据时，你可以根据需要处理多少情况来选择使用 `match` 或 `if let` 来获取并使用这些值。

你的 Rust 程序现在能够使用结构体和枚举在自己的作用域内表现其内容了。在你的 API 中使用自定义类型保证了类型安全：编译器会确保你的函数只会得到它期望的类型的值。

为了向你的用户提供一个组织良好的 API，它使用起来很直观并且只向用户暴露他们确实需要的部分，那么现在就让我们转向 Rust 的模块系统吧。
