## trait：定义共享的行为

> [ch10-02-traits.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch10-02-traits.md)
> <br>
> commit 131859023a0a6be67168d36dcdc8e2aa43f806fd

trait 允许我们进行另一种抽象：他们让我们可以抽象类型所通用的行为。*trait* 告诉 Rust 编译器某个特定类型拥有可能与其他类型共享的功能。在使用泛型类型参数的场景中，可以使用 *trait bounds* 在编译时指定泛型可以是任何实现了某个 trait 的类型，并由此在这个场景下拥有我们希望的功能。

> 注意：*trait* 类似于其他语言中的常被称为 **接口**（*interfaces*）的功能，虽然有一些不同。

### 定义 trait

一个类型的行为由其可供调用的方法构成。如果可以对不同类型调用相同的方法的话，这些类型就可以共享相同的行为了。trait 定义是一种将方法签名组合起来的方法，目的是定义一个实现某些目的所必需的行为的集合。

例如，这里有多个存放了不同类型和属性文本的结构体：结构体 `NewsArticle` 用于存放发生于世界各地的新闻故事，而结构体 `Tweet` 最多只能存放 140 个字符的内容，以及像是否转推或是否是对推友的回复这样的元数据。

我们想要创建一个多媒体聚合库用来显示可能储存在 `NewsArticle` 或 `Tweet` 实例中的数据的总结。每一个结构体都需要的行为是他们是能够被总结的，这样的话就可以调用实例的 `summary` 方法来请求总结。示例 10-12 中展示了一个表现这个概念的 `Summarizable` trait 的定义：

<span class="filename">文件名: lib.rs</span>

```rust
pub trait Summarizable {
    fn summary(&self) -> String;
}
```

<span class="caption">示例 10-12：`Summarizable` trait 定义，它包含由 `summary` 方法提供的行为</span>

使用 `trait` 关键字来声明一个 trait，后面是 trait 的名字，在这个例子中是 `Summarizable`。在大括号中声明描述实现这个 trait 的类型所需要的行为的方法签名，在这个例子中是是 `fn summary(&self) -> String`。在方法签名后跟分号，而不是在大括号中提供其实现。接着每一个实现这个 trait 的类型都需要提供其自定义行为的方法体，编译器也会确保任何实现 `Summarizable` trait 的类型都拥有与这个签名的定义完全一致的 `summary` 方法。

trait 体中可以有多个方法，一行一个方法签名且都以分号结尾。

### 为类型实现 trait

现在我们定义了 `Summarizable` trait，接着就可以在多媒体聚合库中需要拥有这个行为的类型上实现它了。示例 10-13 中展示了 `NewsArticle` 结构体上 `Summarizable` trait 的一个实现，它使用标题、作者和创建的位置作为 `summary` 的返回值。对于 `Tweet` 结构体，我们选择将 `summary` 定义为用户名后跟推文的全部文本作为返回值，并假设推文内容已经被限制为 140 字符以内。

<span class="filename">文件名: lib.rs</span>

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

<span class="caption">示例 10-13：在 `NewsArticle` 和 `Tweet` 类型上实现 `Summarizable` trait</span>

在类型上实现 trait 类似于实现与 trait 无关的方法。区别在于 `impl` 关键字之后，我们提供需要实现 trait 的名称，接着是 `for` 和需要实现 trait 的类型的名称。在 `impl` 块中，使用 trait 定义中的方法签名，不过不再后跟分号，而是需要在大括号中编写函数体来为特定类型实现 trait 方法所拥有的行为。

一旦实现了 trait，我们就可以用与 `NewsArticle` 和 `Tweet` 实例的非 trait 方法一样的方式调用 trait 方法了：

```rust,ignore
let tweet = Tweet {
    username: String::from("horse_ebooks"),
    content: String::from("of course, as you probably already know, people"),
    reply: false,
    retweet: false,
};

println!("1 new tweet: {}", tweet.summary());
```

这会打印出 `1 new tweet: horse_ebooks: of course, as you probably already know, people`。

注意因为示例 10-13 中我们在相同的 `lib.rs` 里定义了 `Summarizable` trait 和 `NewsArticle` 与 `Tweet` 类型，所以他们是位于同一作用域的。如果这个 `lib.rs` 是对应 `aggregator` crate 的，而别人想要利用我们 crate 的功能外加为其 `WeatherForecast` 结构体实现 `Summarizable` trait，在实现 `Summarizable` trait 之前他们首先就需要将其导入其作用域中，如示例 10-14 所示：

<span class="filename">文件名: lib.rs</span>

```rust,ignore
extern crate aggregator;

use aggregator::Summarizable;

struct WeatherForecast {
    high_temp: f64,
    low_temp: f64,
    chance_of_precipitation: f64,
}

impl Summarizable for WeatherForecast {
    fn summary(&self) -> String {
        format!("The high will be {}, and the low will be {}. The chance of
        precipitation is {}%.", self.high_temp, self.low_temp,
        self.chance_of_precipitation)
    }
}
```

<span class="caption">示例 10-14：在另一个 crate 中将 `aggregator` crate 的 `Summarizable` trait 引入作用域</span>

另外这段代码假设 `Summarizable` 是一个公有 trait，这是因为示例 10-12 中 `trait` 之前使用了 `pub` 关键字。

trait 实现的一个需要注意的限制是：只能在 trait 或对应类型位于我们 crate 本地的时候为其实现 trait。换句话说，不允许对外部类型实现外部 trait。例如，不能在 `Vec` 上实现 `Display` trait，因为 `Display` 和 `Vec` 都定义于标准库中。允许在像 `Tweet` 这样作为我们 `aggregator`crate 部分功能的自定义类型上实现标准库中的 trait `Display`。也允许在 `aggregator`crate 中为 `Vec` 实现 `Summarizable`，因为 `Summarizable` 定义于此。这个限制是我们称为 **孤儿规则**（*orphan rule*）的一部分，如果你感兴趣的可以在类型理论中找到它。简单来说，它被称为 orphan rule 是因为其父类型不存在。没有这条规则的话，两个 crate 可以分别对相同类型实现相同的 trait，因而这两个实现会相互冲突：Rust 将无从得知应该使用哪一个。因为 Rust 强制执行 orphan rule，其他人编写的代码不会破坏你代码，反之亦是如此。

### 默认实现

有时为 trait 中的某些或全部方法提供默认的行为，而不是在每个类型的每个实现中都定义自己的行为是很有用的。这样当为某个特定类型实现 trait 时，可以选择保留或重载每个方法的默认行为。

示例 10-15 中展示了如何为 `Summarize` trait 的 `summary` 方法指定一个默认的字符串值，而不是像示例 10-12 中那样只是定义方法签名：

<span class="filename">文件名: lib.rs</span>

```rust
pub trait Summarizable {
    fn summary(&self) -> String {
        String::from("(Read more...)")
    }
}
```

<span class="caption">示例 10-15：`Summarizable` trait 的定义，带有一个 `summary` 方法的默认实现</span>

如果想要对 `NewsArticle` 实例使用这个默认实现，而不是像示例 10-13 中那样定义一个自己的实现，则可以指定一个空的 `impl` 块：

```rust,ignore
impl Summarizable for NewsArticle {}
```

即便选择不再直接为 `NewsArticle` 定义 `summary` 方法了，因为 `summary` 方法有一个默认实现而且 `NewsArticle` 被指定为实现了 `Summarizable` trait，我们仍然可以对 `NewsArticle` 的实例调用 `summary` 方法：

```rust,ignore
let article = NewsArticle {
    headline: String::from("Penguins win the Stanley Cup Championship!"),
    location: String::from("Pittsburgh, PA, USA"),
    author: String::from("Iceburgh"),
    content: String::from("The Pittsburgh Penguins once again are the best
    hockey team in the NHL."),
};

println!("New article available! {}", article.summary());
```

这段代码会打印 `New article available! (Read more...)`。

将 `Summarizable` trait 改变为拥有默认 `summary` 实现并不要求对示例 10-13 中 `Tweet` 和示例 10-14 中 `WeatherForecast` 的 `Summarizable` 实现做任何改变：重载一个默认实现的语法与实现没有默认实现的 trait 方法时完全一样的。

默认实现允许调用相同 trait 中的其他方法，哪怕这些方法没有默认实现。通过这种方法，trait 可以实现很多有用的功能而只需实现一小部分特定内容。我们可以选择让`Summarizable` trait 也拥有一个要求实现的`author_summary` 方法，接着 `summary` 方法则提供默认实现并调用 `author_summary` 方法：

```rust
pub trait Summarizable {
    fn author_summary(&self) -> String;

    fn summary(&self) -> String {
        format!("(Read more from {}...)", self.author_summary())
    }
}
```

为了使用这个版本的 `Summarizable`，只需在实现 trait 时定义 `author_summary` 即可：

```rust,ignore
impl Summarizable for Tweet {
    fn author_summary(&self) -> String {
        format!("@{}", self.username)
    }
}
```

一旦定义了 `author_summary`，我们就可以对 `Tweet` 结构体的实例调用 `summary` 了，而 `summary` 的默认实现会调用我们提供的 `author_summary` 定义。

```rust,ignore
let tweet = Tweet {
    username: String::from("horse_ebooks"),
    content: String::from("of course, as you probably already know, people"),
    reply: false,
    retweet: false,
};

println!("1 new tweet: {}", tweet.summary());
```

这会打印出 `1 new tweet: (Read more from @horse_ebooks...)`。

注意在重载过的实现中调用默认实现是不可能的。

### Trait Bounds

现在我们定义了 trait 并在类型上实现了这些 trait，也可以对泛型类型参数使用 trait。我们可以限制泛型不再适用于任何类型，编译器会确保其被限制为那些实现了特定 trait 的类型，由此泛型就会拥有我们希望其类型所拥有的功能。这被称为指定泛型的 *trait bounds*。

例如在示例 10-13 中为 `NewsArticle` 和 `Tweet` 类型实现了 `Summarizable` trait。我们可以定义一个函数 `notify` 来调用 `summary` 方法，它拥有一个泛型类型 `T` 的参数 `item`。为了能够在 `item` 上调用 `summary` 而不出现错误，我们可以在 `T` 上使用 trait bounds 来指定 `item` 必须是实现了 `Summarizable` trait 的类型：

```rust,ignore
pub fn notify<T: Summarizable>(item: T) {
    println!("Breaking news! {}", item.summary());
}
```

trait bounds 连同泛型类型参数声明一同出现，位于尖括号中的冒号后面。由于 `T` 上的 trait bounds，我们可以传递任何 `NewsArticle` 或 `Tweet` 的实例来调用 `notify` 函数。示例 10-14 中使用我们 `aggregator` crate 的外部代码也可以传递一个 `WeatherForecast` 的实例来调用 `notify` 函数，因为 `WeatherForecast` 同样也实现了 `Summarizable`。使用任何其他类型，比如 `String` 或 `i32`，来调用 `notify` 的代码将不能编译，因为这些类型没有实现 `Summarizable`。

可以通过 `+` 来为泛型指定多个 trait bounds。如果我们需要能够在函数中使用 `T` 类型的显示格式的同时也能使用 `summary` 方法，则可以使用 trait bounds `T: Summarizable + Display`。这意味着 `T` 可以是任何实现了 `Summarizable` 和 `Display` 的类型。

对于拥有多个泛型类型参数的函数，每一个泛型都可以有其自己的 trait bounds。在函数名和参数列表之间的尖括号中指定很多的 trait bound 信息将是难以阅读的，所以有另外一个指定 trait bounds 的语法，它将其移动到函数签名后的 `where` 从句中。所以相比这样写：


```rust,ignore
fn some_function<T: Display + Clone, U: Clone + Debug>(t: T, u: U) -> i32 {
```

我们也可以使用 `where` 从句：

```rust,ignore
fn some_function<T, U>(t: T, u: U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{
```

这就显得不那么杂乱，同时也使这个函数看起来更像没有很多 trait bounds 的函数。这时函数名、参数列表和返回值类型都离得很近。

### 使用 trait bounds 来修复 `largest` 函数

所以任何想要对泛型使用 trait 定义的行为的时候，都需要在泛型参数类型上指定 trait bounds。现在我们就可以修复示例 10-5 中那个使用泛型类型参数的 `largest` 函数定义了！当我们将其放置不管的时候，它会出现这个错误：

```text
error[E0369]: binary operation `>` cannot be applied to type `T`
  |
5 |         if item > largest {
  |            ^^^^
  |
note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

在 `largest` 函数体中我们想要使用大于运算符比较两个 `T` 类型的值。这个运算符被定义为标准库中 trait `std::cmp::PartialOrd` 的一个默认方法。所以为了能够使用大于运算符，需要在 `T` 的 trait bounds 中指定 `PartialOrd`，这样 `largest` 函数可以用于任何可以比较大小的类型的 slice。因为 `PartialOrd` 位于 prelude 中所以并不需要手动将其引入作用域。

```rust,ignore
fn largest<T: PartialOrd>(list: &[T]) -> T {
```

但是如果编译代码的话，会出现不同的错误：

```text
error[E0508]: cannot move out of type `[T]`, a non-copy array
 --> src/main.rs:4:23
  |
4 |     let mut largest = list[0];
  |         -----------   ^^^^^^^ cannot move out of here
  |         |
  |         hint: to prevent move, use `ref largest` or `ref mut largest`

error[E0507]: cannot move out of borrowed content
 --> src/main.rs:6:9
  |
6 |     for &item in list.iter() {
  |         ^----
  |         ||
  |         |hint: to prevent move, use `ref item` or `ref mut item`
  |         cannot move out of borrowed content
```

错误的核心是 `cannot move out of type [T], a non-copy array`，对于非泛型版本的 `largest` 函数，我们只尝试了寻找最大的 `i32` 和 `char`。正如第四章讨论过的，像 `i32` 和 `char` 这样的类型是已知大小的并可以储存在栈上，所以他们实现了 `Copy` trait。当我们将 `largest` 函数改成使用泛型后，现在 `list` 参数的类型就有可能是没有实现 `Copy` trait 的，这意味着我们可能不能将 `list[0]` 的值移动到 `largest` 变量中。

如果只想对实现了 `Copy` 的类型调用这些代码，可以在 `T` 的 trait bounds 中增加 `Copy`！示例 10-16 中展示了一个可以编译的泛型版本的 `largest` 函数的完整代码，只要传递给 `largest` 的 slice 值的类型实现了 `PartialOrd` 和 `Copy` 这两个 trait，例如 `i32` 和 `char`：

<span class="filename">文件名: src/main.rs</span>

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {}", result);
}
```

<span class="caption">示例 10-16：一个可以用于任何实现了 `PartialOrd` 和 `Copy` trait 的泛型的 `largest` 函数</span>

如果并不希望限制 `largest` 函数只能用于实现了 `Copy` trait 的类型，我们可以在 `T` 的 trait bounds 中指定 `Clone` 而不是 `Copy`，并克隆 slice 的每一个值使得 `largest` 函数拥有其所有权。但是使用 `clone` 函数潜在意味着更多的堆分配，而且堆分配在涉及大量数据时可能会相当缓慢。另一种 `largest` 的实现方式是返回 slice 中一个 `T` 值的引用。如果我们将函数返回值从 `T` 改为 `&T` 并改变函数体使其能够返回一个引用，我们将不需要任何 `Clone` 或 `Copy` 的 trait bounds 而且也不会有任何的堆分配。尝试自己实现这种替代解决方式吧！

### 使用 trait bound 有条件的实现方法

通过使用带有 trait bound 的泛型 `impl` 块，可以有条件的只为实现了特定 trait 的类型实现方法。例如，示例 10-17 中的类型 `Pair<T>` 总是实现了 `new` 方法，不过只有 `Pair<T>` 内部的 `T` 类型实现了 `PartialOrd` trait 来允许比较和 `Display` trait 来启用打印，才会实现 `cmp_display`：

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
```

<span class="caption">示例 10-17：根据 trait bound 在泛型上有条件的实现方法</span>

也可以对任何实现了特定 trait 的类型有条件的实现 trait。对任何满足特定 trait bound 的类型实现 trait 被称为 *blanket implementations*，他们被广泛的用于 Rust 标准库中。例如，标准库为任何实现了 `Display` trait 的类型实现了 `ToString` trait。这个 `impl` 块看起来像这样：

```rust,ignore
impl<T: Display> ToString for T {
    // --snip--
}
```

因为标准库有了这些 blanket implementation，我们可以对任何实现了 `Display` trait 的类型调用由 `ToString` 定义的 `to_string` 方法。例如，可以将整型转换为对应的 `String` 值，因为整型实现了 `Display`：

```rust
let s = 3.to_string();
```

blanket implementation 会出现在 trait 文档的 “Implementers” 部分。

trait 和 trait bound 让我们使用泛型类型参数来减少重复，并仍然能够向编译器明确指定泛型类型需要拥有哪些行为。因为我们向编译器提供了 trait bound 信息，它就可以检查代码中所用到的具体类型是否提供了正确的行为。在动态类型语言中，如果我们尝试调用一个类型并没有实现的方法，会在运行时出现错误。Rust 将这些错误移动到了编译时，甚至在代码能够运行之前就强迫我们修复错误。另外，我们也无需编写运行时检查行为的代码，因为在编译时就已经检查过了，这样相比其他那些不愿放弃泛型灵活性的语言有更好的性能。

这里还有一种泛型，我们一直在使用它甚至都没有察觉它的存在，这就是 **生命周期**（*lifetimes*）。不同于其他泛型帮助我们确保类型拥有期望的行为，生命周期则有助于确保引用在我们需要他们的时候一直有效。让我们学习生命周期是如何做到这些的。
