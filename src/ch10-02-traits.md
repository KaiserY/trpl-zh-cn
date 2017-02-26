## trait：定义共享的行为

> [ch10-02-traits.md](https://github.com/rust-lang/book/blob/master/src/ch10-02-traits.md)
> <br>
> commit 709eb1eaca48864fafd9263042f5f9d9d6ffe08d

trait 允许我们进行另一种抽象：他们让我们可以抽象类型所通用的行为。*trait* 告诉 Rust 编译器某个特定类型拥有可能与其他类型共享的功能。在使用泛型类型参数的场景中，可以使用 *trait bounds* 在编译时指定泛型可以是任何实现了某个 trait 的类型，并由此在这个场景下拥有我们希望的功能。

> 注意：*trait* 类似于其他语言中的常被称为**接口**（*interfaces*）的功能，虽然有一些不同。

### 定义 trait

一个类型的行为由其可供调用的方法构成。如果可以对不同类型调用相同的方法的话，这些类型就可以共享相同的行为了。trait 定义是一种将方法签名组合起来的方法，目的是定义一个实现某些目的所必须行为的集合。

例如，这里有多个存放了不同类型和属性文本的结构体：结构体`NewsArticle`用于存放发生于世界各地的新闻故事，而结构体`Tweet`最多只能存放 140 个字符的内容，以及像是否转推或是否是对推友的回复这样的元数据。

我们想要创建一个多媒体聚合库用来显示可能储存在`NewsArticle`或`Tweet`实例中的数据的总结。每一个结构体都需要的行为是他们是能够被总结的，这样的话就可以调用实例的`summary`方法来请求总结。列表 10-11 中展示了一个表现这个概念的`Summarizable` trait 的定义：

<figure>
<span class="filename">Filename: lib.rs</span>

```rust
pub trait Summarizable {
    fn summary(&self) -> String;
}
```

<figcaption>

Listing 10-11: Definition of a `Summarizable` trait that consists of the
behavior provided by a `summary` method

</figcaption>
</figure>

使用`trait`关键字来定义一个 trait，后面是 trait 的名字，在这个例子中是`Summarizable`。在大括号中声明描述实现这个 trait 的类型所需要的行为的方法签名，在这个例子中是是`fn summary(&self) -> String`。在方法签名后跟分号而不是在大括号中提供其实现。接着每一个实现这个 trait 的类型都需要提供其自定义行为的方法体，编译器也会确保任何实现`Summarizable` trait 的类型都拥有与这个签名的定义完全一致的`summary`方法。

trait 体中可以有多个方法，一行一个方法签名且都以分号结尾。

### 为类型实现 trait

现在我们定义了`Summarizable` trait，接着就可以在多媒体聚合库中需要拥有这个行为的类型上实现它了。列表 10-12 中展示了`NewsArticle`结构体上`Summarizable` trait 的一个实现，它使用标题、作者和创建的位置作为`summary`的返回值。对于`Tweet`结构体，我们选择将`summary`定义为用户名后跟推文的全部文本作为返回值，并假设推文内容已经被限制为 140 字符以内。

<figure>
<span class="filename">Filename: lib.rs</span>

```rust
# pub trait Summarizable {
#     fn summary(&self) -> String;
# }
#
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summarizable for NewsArticle {
    fn summary(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summarizable for Tweet {
    fn summary(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

<figcaption>

Listing 10-12: Implementing the `Summarizable` trait on the `NewsArticle` and
`Tweet` types

</figcaption>
</figure>

在类型上实现 trait 类似与实现与 trait 无关的方法。区别在于`impl`关键字之后，我们提供需要实现 trait 的名称，接着是`for`和需要实现 trait 的类型的名称。