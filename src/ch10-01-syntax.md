## 泛型数据类型

> [ch10-01-syntax.md](https://github.com/rust-lang/book/blob/master/src/ch10-01-syntax.md)
> <br>
> commit 55d9e75ffec92e922273c997026bb10613a76578

泛型用于通常我们放置类型的位置，比如函数签名或结构体，允许我们创建可以代替许多具体数据类型的结构体定义。让我们看看如何使用泛型定义函数、结构体、枚举和方法，并且在本部分的结尾我们会讨论泛型代码的性能。

### 在函数定义中使用泛型

定义函数时可以在函数签名的参数数据类型和返回值中使用泛型。以这种方式编写的代码将更灵活并能向函数调用者提供更多功能，同时不引入重复代码。

回到`largest`函数上，列表 10-4 中展示了两个提供了相同的寻找 slice 中最大值功能的函数。第一个是从列表 10-3 中提取的寻找 slice 中`i32`最大值的函数。第二个函数寻找 slice 中`char`的最大值：

<figure>
<span class="filename">Filename: src/main.rs</span>

```rust
fn largest_i32(list: &[i32]) -> i32 {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest_char(list: &[char]) -> char {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];

    let result = largest_i32(&numbers);
    println!("The largest number is {}", result);
#    assert_eq!(result, 100);

    let chars = vec!['y', 'm', 'a', 'q'];

    let result = largest_char(&chars);
    println!("The largest char is {}", result);
#    assert_eq!(result, 'y');
}
```

<figcaption>

Listing 10-4: Two functions that differ only in their names and the types in
their signatures

</figcaption>
</figure>

这里`largest_i32`和`largest_char`有着完全相同的函数体，所以能够将这两个函数变成一个来减少重复就太好了。所幸通过引入一个泛型参数就能实现。

为了参数化我们要定义的函数的签名中的类型