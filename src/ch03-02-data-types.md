## 数据类型

> [ch03-02-data-types.md](https://github.com/rust-lang/book/blob/master/src/ch03-02-data-types.md)
> <br>
> commit d05b7c63ff50b3f9126bb5533e0ba5dd424b83d1

Rust 中的任何值都有一个具体的*类型*（*type*），这告诉了 Rust 它被指定为何种数据这样 Rust 就知道如何处理这些数据了。这一部分将讲到一些语言内建的类型。我们将这些类型分为两个子集：标量（scalar）和复合（compound）。

贯穿整个部分，请记住 Rust 是一个*静态类型*（*statically typed*）语言，也就是说必须在编译时就知道所有变量的类型。编译器通常可以通过值以及如何使用他们来推断出我们想要用的类型。当多个类型都是可能的时候，比如第二章中`parse`将`String`转换为数字类型，必须增加类型注解，像这样：

```rust
let guess: u32 = "42".parse().unwrap();
```

如果这里不添加类型注解，Rust 会显示如下错误，它意味着编译器需要我们提供更多我们想要使用哪个可能的类型的信息：

```sh
error[E0282]: unable to infer enough type information about `_`
 --> src/main.rs:2:5
  |
2 | let guess = "42".parse().unwrap();
  |     ^^^^^ cannot infer type for `_`
  |
  = note: type annotations or generic parameter binding required
```

在我们讨论各种数据类型时会看到不同的类型注解。

### 标量类型

*标量*类型代表一个单独的值。Rust 有四种基本的标量类型：整型、浮点型、布尔类型和字符类型。你可能在其他语言中见过他们，不过让我们深入了解他们在 Rust 中时如何工作的。

#### 整型

*整数*是一个没有小数部分的数字。我们在这一章的前面使用过一个整型，`i32`类型。这个类型声明表明在 32 位系统上它关联的值应该是一个有符号整数（因为这个`i`，与`u`代表的无符号相对）。表格 3-1 展示了 Rust 内建的整数类型。每一个变体的有符号和无符号列（例如，*i32*）可以用来声明对应的整数值。

<figure>
<figcaption>

Table 3-1: Integer Types in Rust

</figcaption>

| Length | Signed | Unsigned |
|--------|--------|----------|
| 8-bit  | i8     | u8       |
| 16-bit | i16    | u16      |
| 32-bit | i32    | u32      |
| 64-bit | i64    | u64      |
| arch   | isize  | usize    |

</figure>

每一种变体都可以是有符号或无符号的并有一个显式的大小。有符号和无符号代表数字是否能够是正数或负数；换句话说，数字是否需要有一个符号（有符号数）或者永远只需要是正的这样就可以不用符号（无符号数）。