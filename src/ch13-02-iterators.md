## 迭代器

> [ch13-02-iterators.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-02-iterators.md)
> <br>
> commit 431116f5c696000b9fd6780e5fde90392cef6812

迭代器是 Rust 中的一个模式，它允许你对一个项的序列进行某些处理。例如。列表 13-5 中对 vecctor 中的每一个数加一：

```rust
let v1 = vec![1, 2, 3];

let v2: Vec<i32> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, [2, 3, 4]);
```

<span class="caption">Listing 13-5: Using an iterator, `map`, and `collect` to
add one to each number in a vector</span>

<!-- Will add wingdings in libreoffice /Carol -->

vector 的`iter`方法允许从 vector 创建一个**迭代器**（*iterator*）。接着迭代器上的`map`方法调用允许我们处理每一个元素：在这里，我们向`map`传递了一个对每一个元素`x`加一的闭包。`map`是最基本的与比较交互的方法之一，因为依次处理每一个元素是非常有用的！最后`collect`方法消费了迭代器并将其元素存放到一个新的数据结构中。在这个例子中，因为我们指定`v2`的类型是`Vec<i32>`，`collect`将会创建一个`i32`的 vector。

像`map`这样的迭代器方法有时被称为**迭代器适配器**（*iterator adaptors*），因为他们获取一个迭代器并产生一个新的迭代器。也就是说，`map`在之前迭代器的基础上通过调用传递给它的闭包来创建了一个新的值序列的迭代器。

概括一下，这行代码进行了如下工作：

1. 从 vector 中创建了一个迭代器。
2. 使用`map`适配器和一个闭包参数对每一个元素加一。
3. 使用`collect`适配器来消费迭代器并生成了一个新的 vector。

这就是如何产生结果`[2, 3, 4]`的。如你所见，闭包是使用迭代器的很重要的一部分：他们提供了一个自定义类似`map`这样的迭代器适配器的行为的方法。

### 迭代器是惰性的

在上一部分，你可能已经注意到了一个微妙的用词区别：我们说`map`**适配**（*adapts*）了一个迭代器，而`collect`**消费**（*consumes*）了一个迭代器。这是有意为之的。单独的迭代器并不会做任何工作；他们是惰性的。也就是说，像列表 13-5 的代码但是不调用`collect`的话：

```rust
let v1: Vec<i32> = vec![1, 2, 3];

v1.iter().map(|x| x + 1); // without collect
```

这可以编译，不过会给出一个警告：

```
warning: unused result which must be used: iterator adaptors are lazy and do
nothing unless consumed, #[warn(unused_must_use)] on by default
 --> src/main.rs:4:1
  |
4 | v1.iter().map(|x| x + 1); // without collect
  | ^^^^^^^^^^^^^^^^^^^^^^^^^
```

这个警告是因为迭代器适配器实际上并不自己进行处理。他们需要一些其他方法来触发迭代器链的计算。我们称之为**消费适配器**（*consuming adaptors*），而`collect`就是其中之一。

那么如何知道迭代器方法是否消费了迭代器呢？还有哪些适配器是可用的呢？为此，让我们看看`Iterator` trait。

### `Iterator` trait

迭代器都实现了一个标准库中叫做`Iterator`的 trait。其定义看起来像这样：

```rust
trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

这里有一些还未讲到的新语法：`type Item`和`Self::Item`定义了这个 trait 的**关联类型**（*associated type*），第十九章会讲到关联类型。现在所有你需要知道就是这些代码表示`Iterator` trait 要求你也定义一个`Item`类型，而这个`Item`类型用作`next`方法的返回值。换句话说，`Item`类型将是迭代器返回的元素的类型。

让我们使用`Iterator` trait 来创建一个从一数到五的迭代器`Counter`。首先，需要创建一个结构体来存放迭代器的当前状态，它有一个`u32`的字段`count`。我们也定义了一个`new`方法，当然这并不是必须的。因为我们希望`Counter`能从一数到五，所以它总是从零开始：

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Counter {
        Counter { count: 0 }
    }
}
```

接下来，我们将通过定义`next`方法来为`Counter`类型实现`Iterator` trait。我们希望迭代器的工作方式是对当前状态加一（这就是为什么将`count`初始化为零，这样迭代器首先就会返回一）。如果`count`仍然小于六，将返回当前状态，不过如果`count`大于等于六，迭代器将返回`None`，如列表 13-6 所示：

```rust
# struct Counter {
#     count: u32,
# }
#
impl Iterator for Counter {
    // Our iterator will produce u32s
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // increment our count. This is why we started at zero.
        self.count += 1;

        // check to see if we've finished counting or not.
        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}
```

<span class="caption">Listing 13-6: Implementing the `Iterator` trait on our
`Counter` struct</span>

<!-- I will add wingdings in libreoffice /Carol -->

`type Item = u32`这一行表明迭代器中`Item`的关联类型将是`u32`。同样无需担心关联类型，因为第XX章会涉及他们。

`next`方法是迭代器的主要接口，它返回一个`Option`。如果它是`Some(value)`，相当于可以迭代器中获取另一个值。如果它是`None`，迭代器就结束了。在`next`方法中可以进行任何迭代器需要的计算。在这个例子中，我们对当前状态加一，接着检查其是否仍然小于六。如果是，返回`Some(self.count)`来产生下一个值。如果大于等于六，迭代结束并返回`None`。

迭代器 trait 指定当其返回`None`，就代表迭代结束。该 trait 并不强制任何在`next`方法返回`None`后再次调用时必须有的行为。在这个情况下，在第一次返回`None`后每一次调用`next`仍然返回`None`，不过其内部`count`字段会依次增长到`u32`的最大值，接着`count`会溢出（在调试模式会`panic!`而在发布模式则会折叠从最小值开始）。有些其他的迭代器则选择再次从头开始迭代。如果需要确保迭代器在返回第一个`None`之后所有的`next`方法调用都返回`None`，可以使用`fuse`方法来创建不同于任何其他的迭代器。

一旦实现了`Iterator` trait，我们就有了一个迭代器！可以通过不停的调用`Counter`结构体的`next`方法来使用迭代器的功能：

```rust,ignore
let mut counter = Counter::new();

let x = counter.next();
println!("{:?}", x);

let x = counter.next();
println!("{:?}", x);

let x = counter.next();
println!("{:?}", x);

let x = counter.next();
println!("{:?}", x);

let x = counter.next();
println!("{:?}", x);

let x = counter.next();
println!("{:?}", x);
```

这会一次一行的打印出从`Some(1)`到`Some(5)`，之后就全是`None`。

### 各种`Iterator`适配器

在列表 13-5 中有一个迭代器并调用了其像`map`和`collect`这样的方法。然而在列表 13-6 中，只实现了`Counter`的`next`方法。`Counter`如何才能得到像`map`和`collect`这样的方法呢？

好吧，当讲到`Iterator`的定义时，我们故意省略一个小的细节。`Iterator`定义了一系列默认实现，他们会调用`next`方法。因为`next`是唯一一个`Iterator` trait 没有默认实现的方法，一旦实现之后，`Iterator`的所有其他的适配器就都可用了。这些适配器可不少！

例如，处于某种原因我们希望获取一个`Counter`实例产生的值，与另一个`Counter`实例忽略第一个值之后的值相组合，将每组数相乘，并只保留能被三整除的相乘结果，最后将所有保留的结果相加，我们可以这么做：


```rust
# struct Counter {
#     count: u32,
# }
#
# impl Counter {
#     fn new() -> Counter {
#         Counter { count: 0 }
#     }
# }
#
# impl Iterator for Counter {
#     // Our iterator will produce u32s
#     type Item = u32;
#
#     fn next(&mut self) -> Option<Self::Item> {
#         // increment our count. This is why we started at zero.
#         self.count += 1;
#
#         // check to see if we've finished counting or not.
#         if self.count < 6 {
#             Some(self.count)
#         } else {
#             None
#         }
#     }
# }
let sum: u32 = Counter::new().zip(Counter::new().skip(1))
                             .map(|(a, b)| a * b)
                             .filter(|x| x % 3 == 0)
                             .sum();
assert_eq!(18, sum);
```

注意`zip`只生成四对值；理论上的第五对值并不会产生，因为`zip`在任一输入返回`None`时也会返回`None`（这个迭代器最多就生成 5）。

因为实现了`Iterator`的`next`方法，所有这些方法调用都是可能的。请查看标准库文档来寻找迭代器可能会用得上的方法。