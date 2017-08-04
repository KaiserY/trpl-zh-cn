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

这会打印出 `The answer is: 12`。