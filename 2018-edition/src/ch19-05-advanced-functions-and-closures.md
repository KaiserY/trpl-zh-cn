## 高级函数与闭包

> [ch19-05-advanced-functions-and-closures.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-05-advanced-functions-and-closures.md)
> <br>
> commit 9d5b9a573daf5fa0c98b3a3005badcea4a0a5211

最后让我们讨论一些有关函数和闭包的高级功能：函数指针、发散函数和返回值闭包。

### 函数指针

<!-- Maybe give an example of when we'd want to use this? -->
<!-- Added a short sentence, but we discuss interfacing with languages that
don't have closures below, which I don't think makes sense until we define how
function pointers are different than closures... /Carol -->

我们讨论过了如何向函数传递闭包；也可以向函数传递常规函数！这在我们希望传递已经定义的函数而不是重新定义闭包作为参数是很有用。通过函数指针允许我们使用函数作为另一个函数的参数。函数的类型是 `fn`，使用小写的 “f” 以便不与 `Fn` 闭包 trait 向混淆。`fn` 被称为**函数指针**（*function pointer*）。指定参数为函数指针的语法类似于闭包，如示例 19-34 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn add_one(x: i32) -> i32 {
    x + 1
}

fn do_twice(f: fn(i32) -> i32, arg: i32) -> i32 {
    f(arg) + f(arg)
}

fn main() {
    let answer = do_twice(add_one, 5);

    println!("The answer is: {}", answer);
}
```

<span class="caption">示例 19-35: 使用 `fn` 类型接受函数指针作为参数</span>

这会打印出 `The answer is: 12`。`do_twice` 中的 `f` 被指定为一个接受一个 `i32` 参数并返回 `i32` 的 `fn`。接着就可以在 `do_twice` 函数体中调用 `f`。在  `main` 中，可以将函数名 `add_one` 作为第一个参数传递给 `do_twice`。

不同于闭包，`fn` 是一个类型而不是一个 trait，所以直接指定 `fn` 作为参数而不是声明一个带有 `Fn` 作为 trait bound 的泛型参数。

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。

一个只期望接受 `fn` 而不接受闭包的情况的例子是与不存在闭包的外部代码交互时：C 语言的函数可以接受函数作为参数，但没有闭包。

作为一个既可以使用内联定义的闭包又可以使用命名函数的例子，让我们看看一个 `map` 的应用。使用 `map` 函数将一个数字 vector 转换为一个字符串 vector，就可以使用闭包：

```rust
let list_of_numbers = vec![1, 2, 3];
let list_of_strings: Vec<String> = list_of_numbers
    .iter()
    .map(|i| i.to_string())
    .collect();
```

或者可以将函数作为 `map` 的参数来代替闭包：

```rust
let list_of_numbers = vec![1, 2, 3];
let list_of_strings: Vec<String> = list_of_numbers
    .iter()
    .map(ToString::to_string)
    .collect();
```

注意这里必须使用 “高级 trait” 部分讲到的完全限定语法，因为存在多个叫做 `to_string` 的函数；这里使用了定义于 `ToString` trait 的 `to_string` 函数，标准库为所有实现了 `Display` 的类型实现了这个 trait。

一些人倾向于函数风格，一些人喜欢闭包。他们最终都会产生同样的代码，所以请使用对你来说更明白的吧。

### 返回闭包

闭包表现为 trait，这意味着不能直接返回闭包。对于大部分需要返回 trait 的情况，可以使用是实现了期望返回的 trait 的具体类型替代函数的返回值。但是这不能用于闭包，因为他们没有一个可返回的具体类型；例如不允许使用函数指针 `fn` 作为返回值类型。

这段代码尝试直接返回闭包，它并不能编译：

```rust,ignore
fn returns_closure() -> Fn(i32) -> i32 {
    |x| x + 1
}
```

编译器给出的错误是：

```text
error[E0277]: the trait bound `std::ops::Fn(i32) -> i32 + 'static:
std::marker::Sized` is not satisfied
 -->
  |
1 | fn returns_closure() -> Fn(i32) -> i32 {
  |                         ^^^^^^^^^^^^^^ `std::ops::Fn(i32) -> i32 + 'static`
  does not have a constant size known at compile-time
  |
  = help: the trait `std::marker::Sized` is not implemented for
  `std::ops::Fn(i32) -> i32 + 'static`
  = note: the return type of a function must have a statically known size
```

错误有一次指向了 `Sized` trait！Rust 并不知道需要多少空间来储存闭包。不过我们在上一部分见过这种情况的解决办法：可以使用 trait 对象：

```rust
fn returns_closure() -> Box<Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}
```

这段代码正好可以编译。关于 trait 对象的更多内容，请回顾第十七章的 “trait 对象” 部分。

## 总结

好的！现在我们学习了 Rust 并不常用但在特定情况下你可能用得着的功能。我们介绍了很多复杂的主题，这样若你在错误信息提示或阅读他人代码时遇到他们，至少可以说之前已经见过这些概念和语法了。你可以使用本章作为一个解决方案的参考。

现在，让我们再开始一个项目，将本书所学的所有内容付与实践！