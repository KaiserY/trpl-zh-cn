## 高级函数与闭包

> [ch19-05-advanced-functions-and-closures.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch19-05-advanced-functions-and-closures.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

最后让我们讨论一些有关函数和闭包的高级功能：函数指针、发散函数和返回值闭包。

### 函数指针

我们讨论过了如何向函数传递闭包，不过也可以向函数传递常规的函数！函数的类型是 `fn`，使用小写的 “f” 以便不与 `Fn` 闭包 trait 向混淆。`fn` 被称为**函数指针**（*function pointer*）。指定参数为函数指针的语法类似于闭包，如列表 19-34 所示：

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

<span class="caption">列表 19-34：使用 `fn` 类型接受函数指针作为参数</span>

这会打印出 `The answer is: 12`。`do_twice` 中的 `f` 被指定为一个接受一个 `i32` 参数并返回 `i32` 的 `fn`。接着就可以在 `do_twice` 函数体中调用 `f`。在  `main` 中，可以将函数名 `add_one` 作为第一个参数传递给 `do_twice`。

不同于闭包，`fn` 是一个类型而不是一个 trait，所以直接指定 `fn` 作为参数而不是声明一个带有 `Fn` 作为 trait bound 的泛型参数。

函数指针实现了所有三个闭包 trait（`Fn`、`FnMut` 和 `FnOnce`），所以总是可以在调用期望闭包的函数时传递函数指针作为参数。倾向于编写使用泛型和闭包 trait 的函数，这样它就能接受函数或闭包作为参数。一个只期望接受 `fn` 的情况的例子是与不存在闭包的外部代码交互时：C 语言的函数可以接受函数作为参数，但没有闭包。

比如，如果希望使用 `map` 函数将一个数字 vector 转换为一个字符串 vector，就可以使用闭包：

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

注意这里必须使用“高级 trait”部分讲到的完全限定语法，因为存在多个叫做 `to_string` 的函数；这里使用定义于 `ToString` trait 的 `to_string` 函数，标准库为所有实现了 `Display` 的类型实现了这个 trait。

一些人倾向于函数风格，一些人喜欢闭包。他们最终都会产生同样的代码，所以请使用你更明白的吧。

### 返回闭包

因为闭包以 trait 的形式体现，返回闭包就有点微妙了；不能直接这么做。对于大部分需要返回 trait 的情况，可以使用是实现了期望返回的 trait 的具体类型替代函数的返回值。但是这不能用于闭包。他们没有一个可返回的具体类型；例如不允许使用函数指针 `fn` 作为返回值类型。

这段代码尝试直接返回闭包，它并不能编译：

```rust
fn returns_closure() -> Fn(i32) -> i32 {
    |x| x + 1
}
```

编译器给出的错误是：

```
error[E0277]: the trait bound `std::ops::Fn(i32) -> i32 + 'static:
std::marker::Sized` is not satisfied
 --> <anon>:2:25
  |
2 | fn returns_closure() -> Fn(i32) -> i32 {
  |                         ^^^^^^^^^^^^^^ the trait `std::marker::Sized` is
  not implemented for `std::ops::Fn(i32) -> i32 + 'static`
  |
  = note: `std::ops::Fn(i32) -> i32 + 'static` does not have a constant size
  known at compile-time
  = note: the return type of a function must have a statically known size
```

又是 `Sized` trait！Rust 并不知道需要多少空间来储存闭包。不过我们在上一部分见过这种情况的解决办法：可以使用 trait 对象：

```rust
fn returns_closure() -> Box<Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}
```

关于 trait 对象的更多内容，请参考第十八章。

## 总结

好的！现在我们学习了 Rust 并不常用但你可能用得着的功能。我们介绍了很多复杂的主题，这样当你在错误信息提示或阅读他人代码时遇到他们时，至少可以说已经见过这些概念和语法了。

现在，让我们再开始一个项目，将本书所学的所有内容付与实践！