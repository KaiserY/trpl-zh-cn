## 高级函数与闭包

> [ch20-05-advanced-functions-and-closures.md](https://github.com/rust-lang/book/blob/main/src/ch20-05-advanced-functions-and-closures.md)
> <br>
> commit 21cf840842bdf768a798869f06373c96c1cc5122

本部分将探索一些有关函数和闭包的高级功能，这包括函数指针以及返回值闭包。

### 函数指针

我们讨论过了如何向函数传递闭包；也可以向函数传递常规函数！这个技术在我们希望传递已经定义的函数而不是重新定义闭包作为参数时很有用。函数满足类型 `fn`（小写的 f），不要与闭包 trait 的 `Fn` 相混淆。`fn` 被称为 **函数指针**（*function pointer*）。通过函数指针允许我们使用函数作为另一个函数的参数。

指定参数为函数指针的语法类似于闭包，如示例 19-27 所示，这里定义了一个 `add_one` 函数将其参数加一。`do_twice` 函数获取两个参数：一个指向任何获取一个 `i32` 参数并返回一个 `i32` 的函数指针，和一个 `i32` 值。`do_twice` 函数传递 `arg` 参数调用 `f` 函数两次，接着将两次函数调用的结果相加。`main` 函数使用 `add_one` 和 `5` 作为参数调用 `do_twice`。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-27/src/main.rs}}
```

<span class="caption">示例 19-27: 使用 `fn` 类型接受函数指针作为参数</span>

这会打印出 `The answer is: 12`。`do_twice` 中的 `f` 被指定为一个接受一个 `i32` 参数并返回 `i32` 的 `fn`。接着就可以在 `do_twice` 函数体中调用 `f`。在 `main` 中，可以将函数名 `add_one` 作为第一个参数传递给 `do_twice`。

不同于闭包，`fn` 是一个类型而不是一个 trait，所以直接指定 `fn` 作为参数而不是声明一个带有 `Fn` 作为 trait bound 的泛型参数。

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。

一个只期望接受 `fn` 而不接受闭包的情况的例子是与不存在闭包的外部代码交互时：C 语言的函数可以接受函数作为参数，但 C 语言没有闭包。

作为一个既可以使用内联定义的闭包又可以使用命名函数的例子，让我们看看一个 `map` 的应用。使用 `map` 函数将一个数字 vector 转换为一个字符串 vector，就可以使用闭包，比如这样：

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-15-map-closure/src/main.rs:here}}
```

或者可以将函数作为 `map` 的参数来代替闭包，像是这样：

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-16-map-function/src/main.rs:here}}
```

注意这里必须使用 [“高级 trait”][advanced-traits] 部分讲到的完全限定语法，因为存在多个叫做 `to_string` 的函数；这里使用了定义于 `ToString` trait 的 `to_string` 函数，标准库为所有实现了 `Display` 的类型实现了这个 trait。

回忆一下第六章 [“枚举值”][enum-values] 部分中定义的每一个枚举成员也变成了一个构造函数。我们可以使用这些构造函数作为实现了闭包 trait 的函数指针，这意味着可以指定构造函数作为接受闭包的方法的参数，如下：

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-17-map-initializer/src/main.rs:here}}
```

这里创建了 `Status::Value` 实例，它通过 `map` 用范围的每一个 `u32` 值调用 `Status::Value` 的初始化函数。一些人倾向于函数风格，一些人喜欢闭包。这两种形式最终都会产生同样的代码，所以请使用对你来说更明白的形式吧。

### 返回闭包

闭包表现为 trait，这意味着不能直接返回闭包。对于大部分需要返回 trait 的情况，可以使用实现了期望返回的 trait 的具体类型来替代函数的返回值。但是这不能用于闭包，因为它们没有一个可返回的具体类型；例如不允许使用函数指针 `fn` 作为返回值类型。

这段代码尝试直接返回闭包，它并不能编译：

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-18-returns-closure/src/lib.rs}}
```

编译器给出的错误是：

```console
{{#include ../listings/ch20-advanced-features/no-listing-18-returns-closure/output.txt}}
```

错误又一次指向了 `Sized` trait！Rust 并不知道需要多少空间来储存闭包。不过我们在上一部分见过这种情况的解决办法：可以使用 trait 对象：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-19-returns-closure-trait-object/src/lib.rs}}
```

这段代码正好可以编译。关于 trait 对象的更多内容，请回顾第十八章的 [顾及不同类型值的 trait 对象”][using-trait-objects-that-allow-for-values-of-different-types] 部分。

接下来让我们学习宏！

[advanced-traits]: ch20-03-advanced-traits.html#高级-trait
[enum-values]: ch06-01-defining-an-enum.html#枚举值
[using-trait-objects-that-allow-for-values-of-different-types]: ch18-02-trait-objects.html#顾及不同类型值的-trait-对象
