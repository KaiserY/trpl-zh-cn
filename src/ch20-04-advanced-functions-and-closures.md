## 高级函数与闭包

<!-- https://github.com/rust-lang/book/blob/main/src/ch20-04-advanced-functions-and-closures.md -->
<!-- commit 56ec353290429e6547109e88afea4de027b0f1a9 -->

本部分将探索一些有关函数和闭包的高级特性，这包括函数指针以及返回闭包。

### 函数指针

我们讨论过了如何向函数传递闭包；也可以将普通函数传递给函数！这个技术在我们希望传递已经定义的函数而不是重新定义闭包作为参数时很有用。函数会被强制转换为 `fn` 类型（小写的 f），不要与闭包 trait 的 `Fn` 相混淆。`fn` 被称为 **函数指针**（*function pointer*）。通过函数指针允许我们使用函数作为其它函数的参数。

指定参数为函数指针的语法类似于闭包，如示例 20-28 所示，这里定义了一个 `add_one` 函数用于将其参数加一。`do_twice` 函数获取两个参数：一个指向任何获取一个 `i32` 参数并返回一个 `i32` 的函数指针，和一个 `i32` 值。`do_twice` 函数传入 `arg` 参数调用 `f` 函数两次，接着将两次函数调用的结果相加。`main` 函数使用 `add_one` 和 `5` 作为参数调用 `do_twice`。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-28/src/main.rs}}
```

<span class="caption">示例 20-28: 使用 `fn` 类型接受函数指针作为参数</span>

这段代码会打印出 `The answer is: 12`。`do_twice` 中的 `f` 被指定为一个接受一个 `i32` 参数并返回 `i32` 的 `fn`。接着就可以在 `do_twice` 函数体中调用 `f`。在 `main` 中，可以将函数名 `add_one` 作为第一个参数传递给 `do_twice`。

不同于闭包，`fn` 是一个类型而不是一个 trait，所以直接指定 `fn` 作为参数而不是声明一个带有 `Fn` 作为 trait bound 的泛型参数。

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。

尽管如此，一个只期望接受 `fn` 而不接受闭包的情况的例子是与不存在闭包的外部代码交互时：C 语言的函数可以接受函数作为参数，但 C 语言没有闭包。

作为一个既可以使用内联定义的闭包又可以使用命名函数的例子，让我们看看一个标准库中 `Iterator` trait 提供的 `map` 方法的应用。使用 `map` 函数将一个数字 vector 转换为一个字符串 vector，就可以使用闭包，如示例 20-29 所示：

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-29/src/main.rs:here}}
```

<figcaption>示例 20-29：使用闭包和 `map` 方法将数字转换为字符串</figcaption>

</figure>

或者可以将函数作为 `map` 的参数来代替闭包，如示例 20-30 所示：

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-30/src/main.rs:here}}
```

<figcaption>示例 20-30：使用 `String::to_string` 方法将数字转换为字符串</figcaption>

</figure>

注意这里必须使用 [“高级 trait”][advanced-traits] 部分讲到的完全限定语法，因为存在多个叫做 `to_string` 的函数。

这里使用了定义于 `ToString` trait 的 `to_string` 函数，标准库为所有实现了 `Display` 的类型实现了这个 trait。

回忆一下第六章 [“枚举值”][enum-values] 部分中定义的每一个枚举成员也变成了一个构造函数。我们可以使用这些构造函数作为实现了闭包 trait 的函数指针，这意味着可以指定构造函数作为接受闭包的方法的参数，如示例 20-31 所示：

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-31/src/main.rs:here}}
```

<figcaption>示例 20-31：使用枚举构造函数和 `map` 方法从数字创建 `Status` 实例</figcaption>

</figure>


这里，我们通过 `Status::Value` 的初始化函数，对 `map` 所作用的范围内每个 `u32` 值创建 `Status::Value` 实例。一些人倾向于函数式风格，一些人喜欢闭包。它们会编译成相同的代码，因此请选择对你来说更清晰的那一种。

### 返回闭包

闭包表现为 trait，这意味着不能直接返回闭包。对于大部分需要返回 trait 的场景中，可以使用实现了期望返回的 trait 的具体类型来替代函数的返回值。但是这不能用于闭包，因为它们没有一个可返回的具体类型；例如，当闭包从其作用域捕获任何值时，就不允许使用函数指针 `fn` 作为返回类型。

相反，可以正常地使用第十章所学的 `impl Trait` 语法。可以使用 `Fn`、`FnOnce` 和 `FnMut` 返回任何函数类型。例如，示例 20-32 中的代码就可以正常工作。

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-32/src/lib.rs}}
```

<figcaption>示例 20-32：使用 `impl Trait` 语法从函数返回闭包</figcaption>

</figure>

然而，如我们在 [“闭包类型推断和注解”][closure-types] 中所注意到的，每一个闭包也有其独立的类型。如果你需要处理多个拥有相同签名但是不同实现的函数，就需要使用 trait 对象。考虑一下如果编写类似示例 20-33 中所示代码会发生什么。

<figure class="listing">

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-33/src/main.rs}}
```

<figcaption>示例 20-33：创建一个由返回 `impl Fn` 的函数定义的闭包的 `Vec<T>`</figcaption>

</figure>

这里有两个函数，`returns_closure` 和 `returns_initialized_closure`，它们都返回 `impl Fn(i32) -> i32`。注意它们返回的闭包是不同的，即使它们实现了相同的类型。如果尝试编译这段代码，Rust 会告诉我们这不可行：

```text
{{#include ../listings/ch20-advanced-features/listing-20-33/output.txt}}
```

错误信息告诉我们每当返回一个 `impl Trait` Rust 会创建一个独特的**不透明类型**（*opaque type*），这是一个无法看清 Rust 为我们构建了什么细节的类型。所以即使这些函数都返回了实现了相同 trait（ `Fn(i32) -> i32`）的闭包，Rust 为我们生成的不透明类型也是不同的。这类似于 Rust 如何为不同的异步代码块生成不同的具体类型，即使它们有着相同的输出类型，如第十七章 [“使用任意数量的 futures”][any-number-of-futures] 所示。我们已经多次看到这个问题的解决方案：我们可以使用 trait 对象，如示例 20-34 所示。

<figure class="listing">

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-34/src/main.rs:here}}
```

<figcaption>示例 20-34：创建一个由返回 `Box<dyn Fn>` 的函数定义的闭包的 `Vec<T>` 以便它们有相同的类型</figcaption>

</figure>

这段代码正好可以编译。关于 trait 对象的更多内容，请回顾第十八章的 [顾及不同类型值的 trait 对象”][using-trait-objects-that-allow-for-values-of-different-types] 部分。

接下来让我们学习宏！

[advanced-traits]: ch20-02-advanced-traits.html#高级-trait
[enum-values]: ch06-01-defining-an-enum.html#枚举值
[closure-types]: ch13-01-closures.html#闭包类型推断和注解
[any-number-of-futures]: ch17-03-more-futures.html
[using-trait-objects-that-allow-for-values-of-different-types]: ch18-02-trait-objects.html#顾及不同类型值的-trait-对象
