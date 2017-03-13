## `Deref` Trait 允许通过引用访问数据

> [ch15-02-deref.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-02-deref.md)
> <br>
> commit 3f2a1bd8dbb19cc48b210fc4fb35c305c8d81b56

第一个智能指针相关的重要 trait 是`Deref`，它允许我们重载`*`，解引用运算符（不同于乘法运算符和全局引用运算符）。重载智能指针的`*`方便访问其后的数据，在这个部分的稍后介绍解引用强制多态时我们会讨论方便的意义。

第八章的哈希 map 的“根据旧值更新一个值”部分简要的提到了解引用运算符。当时有一个可变引用，而我们希望改变这个引用所指向的值。为此，首先我们必须解引用。这是另一个使用`i32`值引用的例子：

```rust
let mut x = 5;
{
    let y = &mut x;

    *y += 1
}

assert_eq!(6, x);
```

我们使用`*y`来访问可变引用`y`所指向的数据，