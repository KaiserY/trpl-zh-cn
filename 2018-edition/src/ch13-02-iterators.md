## 使用迭代器处理元素序列

> [ch13-02-iterators.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch13-02-iterators.md)
> <br>
> commit ceb31210263d49994bbf09456a35a135da690f24

迭代器模式允许你对一个项的序列进行某些处理。**迭代器**（*iterator*）负责遍历序列中的每一项和决定序列何时结束的逻辑。当使用迭代器时，我们无需重新实现这些逻辑。

在 Rust 中，迭代器是 **惰性的**（*lazy*），这意味着直到调用方法消费迭代器之前它都不会有效果。例如，示例 13-13 中的代码通过调用定义于 `Vec` 上的 `iter` 方法在一个 vector `v1` 上创建了一个迭代器。这段代码本身没有任何用处：

```rust
let v1 = vec![1, 2, 3];

let v1_iter = v1.iter();
```

<span class="caption">示例 13-13：创建一个迭代器</span>

创建迭代器之后，可以选择用多种方式利用它。在示例 3-4 中，我们使用迭代器和 `for` 循环在每一个项上执行了一些代码，不过直到现在我们掩盖了 `iter` 调用做了什么。

示例 13-14 中的例子将迭代器的创建和 `for` 循环中的使用分开。迭代器被储存在 `v1_iter` 变量中，而这时没有进行迭代。一旦 `for` 循环开始使用 `v1_iter`，接着迭代器中的每一个元素被用于循环的一次迭代，这会打印出其每一个值：

```rust
let v1 = vec![1, 2, 3];

let v1_iter = v1.iter();

for val in v1_iter {
    println!("Got: {}", val);
}
```

<span class="caption">示例 13-14：在一个 `for` 循环中使用迭代器</span>

在标准库中没有提供迭代器的语言中，我们可能会使用一个从 0 开始的索引变量，使用这个变量索引 vector 中的值，并循环增加其值直到达到 vector 的元素数量。

迭代器为我们处理了所有这些逻辑，这减少了重复代码并潜在的消除了混乱。另外，迭代器的实现方式提供了对多种不同的序列使用相同逻辑的灵活性，而不仅仅是像 vector 这样可索引的数据结构.让我们看看迭代器是如何做到这些的。

### `Iterator` trait 和 `next` 方法

迭代器都实现了一个叫做 `Iterator` 的定义于标准库的 trait。这个 trait 的定义看起来像这样：

```rust
trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;

    // methods with default implementations elided
}
```

注意这里有一下我们还未讲到的新语法：`type Item` 和 `Self::Item`，他们定义了 trait 的 **关联类型**（*associated type*）。第十九章会深入讲解关联类型，不过现在只需知道这段代码表明实现 `Iterator` trait 要求同时定义一个 `Item` 类型，这个 `Item` 类型被用作 `next` 方法的返回值类型。换句话说，`Item` 类型将是迭代器返回元素的类型。

`next` 是 `Iterator` 实现者被要求定义的唯一方法。`next` 一次返回迭代器中的一个项，封装在 `Some` 中，当迭代器结束时，它返回 `None`。如果你希望的话可以直接调用迭代器的 `next` 方法；示例 13-15 有一个测试展示了重复调用由 vector 创建的迭代器的 `next` 方法所得到的值：

<span class="filename">文件名: src/lib.rs</span>

```rust,test_harness
#[test]
fn iterator_demonstration() {
    let v1 = vec![1, 2, 3];

    let mut v1_iter = v1.iter();

    assert_eq!(v1_iter.next(), Some(&1));
    assert_eq!(v1_iter.next(), Some(&2));
    assert_eq!(v1_iter.next(), Some(&3));
    assert_eq!(v1_iter.next(), None);
}
```

<span class="caption">示例 13-15：在迭代器上（直接）调用 `next` 方法</span>

注意 `v1_iter` 需要是可变的：在迭代器上调用 `next` 方法改变了迭代器中用来记录序列位置的状态。换句话说，代码 **消费**（consume）了，或使用了迭代器。每一个 `next` 调用都会从迭代器中消费一个项。使用 `for` 循环时无需使 `v1_iter` 可变因为 `for` 循环会获取 `v1_iter` 的所有权并在后台使 `v1_iter` 可变。

另外需要注意到从 `next` 调用中得到的值是 vector 的不可变引用。`iter` 方法生成一个不可变引用的迭代器。如果我们需要一个获取 `v1` 所有权并返回拥有所有权的迭代器，则可以调用 `into_iter` 而不是 `iter`。类似的，如果我们希望迭代可变引用，则可以调用 `iter_mut` 而不是 `iter`。

### 消费迭代器的方法

`Iterator` trait 有一系列不同的由标准库提供默认实现的方法；你可以在 `Iterator` trait 的标准库 API 文档中找到所有这些方法。一些方法在其定义中调用了 `next` 方法，这也就是为什么在实现 `Iterator` trait 时要求实现 `next` 方法的原因。

这些调用 `next` 方法的方法被称为 **消费适配器**（*consuming adaptors*），因为调用他们会消耗迭代器。一个消费适配器的例子是 `sum` 方法。这个方法获取迭代器的所有权并反复调用 `next` 来遍历迭代器，因而会消费迭代器。当其遍历每一个项时，它将每一个项加总到一个总和并在迭代完成时返回总和。示例 13-16 有一个展示 `sum` 方法使用的测试：

<span class="filename">文件名: src/lib.rs</span>

```rust
#[test]
fn iterator_sum() {
    let v1 = vec![1, 2, 3];

    let v1_iter = v1.iter();

    let total: i32 = v1_iter.sum();

    assert_eq!(total, 6);
}
```

<span class="caption">示例 13-16：调用 `sum` 方法获取迭代器所有项的总和</span>

调用 `sum` 之后不再允许使用 `v1_iter` 因为调用 `sum` 时它会获取迭代器的所有权。

### 产生其他迭代器的方法

`Iterator` trait 中定义了另一类方法，被称为 **迭代器适配器**（*iterator adaptors*），他们允许我们将当前迭代器变为不同类型的迭代器。可以链式调用多个迭代器适配器。不过因为所有的迭代器都是惰性的，必须调用一个消费适配器方法以便获取迭代器适配器调用的结果。

示例 13-17 展示了一个调用迭代器适配器方法 `map` 的例子，该 `map` 方法使用闭包来调用每个元素以生成新的迭代器。 这里的闭包创建了一个新的迭代器，对其中 vector 中的每个元素都被加 1。不过这些代码会产生一个警告：

<span class="filename">文件名: src/main.rs</span>

```rust
let v1: Vec<i32> = vec![1, 2, 3];

v1.iter().map(|x| x + 1);
```

<span class="caption">示例 13-17：调用迭代器适配器 `map` 来创建一个新迭代器</span>

得到的警告是：

```text
warning: unused `std::iter::Map` which must be used: iterator adaptors are lazy
and do nothing unless consumed
 --> src/main.rs:4:5
  |
4 |     v1.iter().map(|x| x + 1);
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^
  |
  = note: #[warn(unused_must_use)] on by default
```

示例 13-17 中的代码实际上并没有做任何事；所指定的闭包从未被调用过。警告提醒了我们为什么：迭代器适配器是惰性的，而这里我们需要消费迭代器。

为了修复这个警告并消费迭代器获取有用的结果，我们将使用第十二章简要讲到的 `collect` 方法。这个方法消费迭代器并将结果收集到一个数据结构中。

在示例 13-18 中，我们将遍历由 `map` 调用生成的迭代器的结果收集到一个 vector 中，它将会含有原始 vector 中每个元素加一的结果：

<span class="filename">文件名: src/main.rs</span>

```rust
let v1: Vec<i32> = vec![1, 2, 3];

let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();

assert_eq!(v2, vec![2, 3, 4]);
```

<span class="caption">示例 13-18：调用 `map` 方法创建一个新迭代器，接着调用 `collect` 方法消费新迭代器并创建一个 vector</span>

因为 `map` 获取一个闭包，可以指定任何希望在遍历的每个元素上执行的操作。这是一个展示如何使用闭包来自定义行为同时又复用 `Iterator` trait 提供的迭代行为的绝佳例子。

### 使用闭包获取环境

现在我们介绍了迭代器，让我们展示一个通过使用 `filter` 迭代器适配器和捕获环境的闭包的常规用例。迭代器的 `filter` 方法获取一个使用迭代器的每一个项并返回布尔值的闭包。如果闭包返回 `true`，其值将会包含在 `filter` 提供的新迭代器中。如果闭包返回 `false`，其值不会包含在结果迭代器中。

示例 13-19 展示了使用 `filter` 和一个捕获环境中变量 `shoe_size` 的闭包，这样闭包就可以遍历一个 `Shoe` 结构体集合以便只返回指定大小的鞋子：

<span class="filename">文件名: src/lib.rs</span>

```rust,test_harness
#[derive(PartialEq, Debug)]
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_my_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes.into_iter()
        .filter(|s| s.size == shoe_size)
        .collect()
}

#[test]
fn filters_by_size() {
    let shoes = vec![
        Shoe { size: 10, style: String::from("sneaker") },
        Shoe { size: 13, style: String::from("sandal") },
        Shoe { size: 10, style: String::from("boot") },
    ];

    let in_my_size = shoes_in_my_size(shoes, 10);

    assert_eq!(
        in_my_size,
        vec![
            Shoe { size: 10, style: String::from("sneaker") },
            Shoe { size: 10, style: String::from("boot") },
        ]
    );
}
```

<span class="caption">示例 13-19：使用 `filter` 方法和一个捕获 `shoe_size` 的闭包</span>

`shoes_in_my_size` 函数获取一个鞋子 vector 的所有权和一个鞋子大小作为参数。它返回一个只包含指定大小鞋子的 vector。

在 `shoes_in_my_size` 函数体中调用了 `into_iter` 来创建一个获取 vector 所有权的迭代器。接着调用 `filter` 将这个迭代器适配成只含有闭包返回 `true` 元素的新迭代器。

闭包从环境中捕获了 `shoe_size` 变量并使用其值与每一只鞋的大小作比较，只保留指定大小的鞋子。最终，调用 `collect` 将迭代器适配器返回的值收集进一个 vector 并返回。

这个测试展示当调用 `shoes_in_my_size` 时，我们只会得到与指定值相同大小的鞋子。

### 实现 `Iterator` trait 来创建自定义迭代器

我们已经展示了可以通过在 vector 上调用 `iter`、`into_iter` 或 `iter_mut` 来创建一个迭代器。也可以用标准库中其他的集合类型创建迭代器，比如哈希 map。另外，可以实现 `Iterator` trait 来创建任何我们希望的迭代器。正如之前提到的，定义中唯一要求提供的方法就是 `next` 方法。一旦定义了它，就可以使用所有其他由 `Iterator` trait 提供的拥有默认实现的方法来创建自定义迭代器了！

作为展示，让我们创建一个只会从 1 数到 5 的迭代器。首先，创建一个结构体来存放一些值，接着实现 `Iterator` trait 将这个结构体放入迭代器中并在此实现中使用其值。

示例 13-20 有一个 `Counter` 结构体定义和一个创建 `Counter` 实例的关联函数 `new`：


<span class="filename">文件名: src/lib.rs</span>

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

<span class="caption">示例 13-20：定义 `Counter` 结构体和一个创建 `count` 初值为 0 的 `Counter` 实例的 `new` 函数</span>

`Counter` 结构体有一个字段 `count`。这个字段存放一个 `u32` 值，它会记录处理 1 到 5 的迭代过程中的位置。`count` 是私有的因为我们希望 `Counter` 的实现来管理这个值。`new` 函数通过总是从为 0 的 `count` 字段开始新实例来确保我们需要的行为。

接下来将为 `Counter` 类型实现 `Iterator` trait，通过定义 `next` 方法来指定使用迭代器时的行为，如示例 13-21 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# struct Counter {
#     count: u32,
# }
#
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1;

        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}
```

<span class="caption">示例 13-21：在 `Counter` 结构体上实现 `Iterator` trait</span>

这里将迭代器的关联类型 `Item` 设置为 `u32`，意味着迭代器会返回 `u32` 值集合。再一次，这里仍无需担心关联类型，第十九章会讲到。

我们希望迭代器对其内部状态加一，这也就是为何将 `count` 初始化为 0：我们希望迭代器首先返回 1。如果 `count` 值小于 6，`next` 会返回封装在 `Some` 中的当前值，不过如果 `count` 大于或等于 6，迭代器会返回 `None`。

#### 使用 `Counter` 迭代器的 `next` 方法

一旦实现了 `Iterator` trait，我们就有了一个迭代器！示例 13-22 展示了一个测试用来演示使用 `Counter` 结构体的迭代器功能，通过直接调用 `next` 方法，正如示例 13-15 中从 vector 创建的迭代器那样：

<span class="filename">文件名: src/lib.rs</span>

```rust
# struct Counter {
#     count: u32,
# }
#
# impl Iterator for Counter {
#     type Item = u32;
#
#     fn next(&mut self) -> Option<Self::Item> {
#         self.count += 1;
#
#         if self.count < 6 {
#             Some(self.count)
#         } else {
#             None
#         }
#     }
# }
#
#[test]
fn calling_next_directly() {
    let mut counter = Counter::new();

    assert_eq!(counter.next(), Some(1));
    assert_eq!(counter.next(), Some(2));
    assert_eq!(counter.next(), Some(3));
    assert_eq!(counter.next(), Some(4));
    assert_eq!(counter.next(), Some(5));
    assert_eq!(counter.next(), None);
}
```

<span class="caption">示例 13-22：测试 `next` 方法实现的功能</span>

这个测试在 `counter` 变量中新建了一个 `Counter` 实例并接着反复调用 `next` 方法，来验证我们实现的行为符合这个迭代器返回从 1 到 5 的值的预期。

#### 使用自定义迭代器中其他 `Iterator` trait 方法

通过定义 `next` 方法实现 `Iterator` trait，我们现在就可以使用任何标准库定义的拥有默认实现的 `Iterator` trait 方法了，因为他们都使用了 `next` 方法的功能。

例如，出于某种原因我们希望获取 `Counter` 实例产生的值，将这些值与另一个 `Counter` 实例在省略了第一个值之后产生的值配对，将每一对值相乘，只保留那些可以被三整除的结果，然后将所有保留的结果相加，这可以如示例 13-23 中的测试这样做：

<span class="filename">文件名: src/lib.rs</span>

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
#
#[test]
fn using_other_iterator_trait_methods() {
    let sum: u32 = Counter::new().zip(Counter::new().skip(1))
                                 .map(|(a, b)| a * b)
                                 .filter(|x| x % 3 == 0)
                                 .sum();
    assert_eq!(18, sum);
}
```

<span class="caption">示例 13-23：使用自定义的 `Counter` 迭代器的多种方法</span>

注意 `zip` 只产生四对值；理论上第五对值 `(5, None)` 从未被产生，因为 `zip` 在任一输入迭代器返回 `None` 时也返回 `None`。

所有这些方法调用都是可能的，因为我们通过指定 `next` 如何工作来实现 `Iterator` trait 而标准库则提供其他调用 `next` 的默认方法实现。
