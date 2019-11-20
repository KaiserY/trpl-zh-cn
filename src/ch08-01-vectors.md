## vector 用来储存一系列的值

> [ch08-01-vectors.md](https://github.com/rust-lang/book/blob/master/src/ch08-01-vectors.md)
> <br>
> commit 76df60bccead5f3de96db23d97b69597cd8a2b82

我们要讲到的第一个类型是 `Vec<T>`，也被称为 *vector*。vector 允许我们在一个单独的数据结构中储存多于一个的值，它在内存中彼此相邻地排列所有的值。vector 只能储存相同类型的值。它们在拥有一系列项的场景下非常实用，例如文件中的文本行或是购物车中商品的价格。

### 新建 vector

为了创建一个新的空 vector，可以调用 `Vec::new` 函数，如示例 8-1 所示：

```rust
let v: Vec<i32> = Vec::new();
```

<span class="caption">示例 8-1：新建一个空的 vector 来储存 `i32` 类型的值</span>

注意这里我们增加了一个类型注解。因为没有向这个 vector 中插入任何值，Rust 并不知道我们想要储存什么类型的元素。这是一个非常重要的点。vector 是用泛型实现的，第十章会涉及到如何对你自己的类型使用它们。现在，所有你需要知道的就是 `Vec` 是一个由标准库提供的类型，它可以存放任何类型，而当 `Vec` 存放某个特定类型时，那个类型位于尖括号中。在示例 8-1 中，我们告诉 Rust `v` 这个 `Vec` 将存放 `i32` 类型的元素。

在更实际的代码中，一旦插入值 Rust 就可以推断出想要存放的类型，所以你很少会需要这些类型注解。更常见的做法是使用初始值来创建一个 `Vec`，而且为了方便 Rust 提供了 `vec!` 宏。这个宏会根据我们提供的值来创建一个新的 `Vec`。示例 8-2 新建一个拥有值 `1`、`2` 和 `3` 的 `Vec<i32>`：

```rust
let v = vec![1, 2, 3];
```

<span class="caption">示例 8-2：新建一个包含初值的 vector</span>

因为我们提供了 `i32` 类型的初始值，Rust 可以推断出 `v` 的类型是 `Vec<i32>`，因此类型注解就不是必须的。接下来让我们看看如何修改一个 vector。

### 更新 vector

对于新建一个 vector 并向其增加元素，可以使用 `push` 方法，如示例 8-3 所示：

```rust
let mut v = Vec::new();

v.push(5);
v.push(6);
v.push(7);
v.push(8);
```

<span class="caption">示例 8-3：使用 `push` 方法向 vector 增加值</span>

如第三章中讨论的任何变量一样，如果想要能够改变它的值，必须使用 `mut` 关键字使其可变。放入其中的所有值都是 `i32` 类型的，而且 Rust 也根据数据做出如此判断，所以不需要 `Vec<i32>` 注解。

### 丢弃 vector 时也会丢弃其所有元素

类似于任何其他的 `struct`，vector 在其离开作用域时会被释放，如示例 8-4 所标注的：

```rust
{
    let v = vec![1, 2, 3, 4];

    // 处理变量 v

} // <- 这里 v 离开作用域并被丢弃
```

<span class="caption">示例 8-4：展示 vector 和其元素于何处被丢弃</span>

当 vector 被丢弃时，所有其内容也会被丢弃，这意味着这里它包含的整数将被清理。这可能看起来非常直观，不过一旦开始使用 vector 元素的引用，情况就变得有些复杂了。下面让我们处理这种情况！

### 读取 vector 的元素

现在你知道如何创建、更新和销毁 vector 了，接下来的一步最好了解一下如何读取它们的内容。有两种方法引用 vector 中储存的值。为了更加清楚的说明这个例子，我们标注这些函数返回的值的类型。

示例 8-5 展示了访问 vector 中一个值的两种方式，索引语法或者 `get` 方法：

```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2];
println!("The third element is {}", third);

match v.get(2) {
    Some(third) => println!("The third element is {}", third),
    None => println!("There is no third element."),
}
```

<span class="caption">列表 8-5：使用索引语法或 `get` 方法来访问 vector 中的项</span>

这里有两个需要注意的地方。首先，我们使用索引值 `2` 来获取第三个元素，索引是从 0 开始的。其次，这两个不同的获取第三个元素的方式分别为：使用 `&` 和 `[]` 返回一个引用；或者使用 `get` 方法以索引作为参数来返回一个 `Option<&T>`。

Rust 有两个引用元素的方法的原因是程序可以选择如何处理当索引值在 vector 中没有对应值的情况。作为一个例子，让我们看看如果有一个有五个元素的 vector 接着尝试访问索引为 100 的元素时程序会如何处理，如示例 8-6 所示：

```rust,should_panic,panics
let v = vec![1, 2, 3, 4, 5];

let does_not_exist = &v[100];
let does_not_exist = v.get(100);
```

<span class="caption">示例 8-6：尝试访问一个包含 5 个元素的 vector 的索引 100 处的元素</span>

当运行这段代码，你会发现对于第一个 `[]` 方法，当引用一个不存在的元素时 Rust 会造成 panic。这个方法更适合当程序认为尝试访问超过 vector 结尾的元素是一个严重错误的情况，这时应该使程序崩溃。

当 `get` 方法被传递了一个数组外的索引时，它不会 panic 而是返回 `None`。当偶尔出现超过 vector 范围的访问属于正常情况的时候可以考虑使用它。接着你的代码可以有处理 `Some(&element)` 或 `None` 的逻辑，如第六章讨论的那样。例如，索引可能来源于用户输入的数字。如果它们不慎输入了一个过大的数字那么程序就会得到 `None` 值，你可以告诉用户当前 vector 元素的数量并再请求它们输入一个有效的值。这就比因为输入错误而使程序崩溃要友好的多！

一旦程序获取了一个有效的引用，借用检查器将会执行所有权和借用规则（第四章讲到）来确保 vector 内容的这个引用和任何其他引用保持有效。回忆一下不能在相同作用域中同时存在可变和不可变引用的规则。这个规则适用于示例 8-7，当我们获取了 vector 的第一个元素的不可变引用并尝试在 vector 末尾增加一个元素的时候，这是行不通的：

```rust,ignore,does_not_compile
let mut v = vec![1, 2, 3, 4, 5];

let first = &v[0];

v.push(6);

println!("The first element is: {}", first);
```

<span class="caption">示例 8-7：在拥有 vector 中项的引用的同时向其增加一个元素</span>

编译会给出这个错误：

```text
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable
 --> src/main.rs:6:5
  |
4 |     let first = &v[0];
  |                  - immutable borrow occurs here
5 |
6 |     v.push(6);
  |     ^^^^^^^^^ mutable borrow occurs here
7 |
8 |     println!("The first element is: {}", first);
  |                                          ----- immutable borrow later used here
```

示例 8-7 中的代码看起来应该能够运行：为什么第一个元素的引用会关心 vector 结尾的变化？不能这么做的原因是由于 vector 的工作方式：在 vector 的结尾增加新元素时，在没有足够空间将所有所有元素依次相邻存放的情况下，可能会要求分配新内存并将老的元素拷贝到新的空间中。这时，第一个元素的引用就指向了被释放的内存。借用规则阻止程序陷入这种状况。

> 注意：关于 `Vec<T>` 类型的更多实现细节，在 https://doc.rust-lang.org/stable/nomicon/vec.html 查看 “The Nomicon”

### 遍历 vector 中的元素

如果想要依次访问 vector 中的每一个元素，我们可以遍历其所有的元素而无需通过索引一次一个的访问。示例 8-8 展示了如何使用 `for` 循环来获取 `i32` 值的 vector 中的每一个元素的不可变引用并将其打印：

```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{}", i);
}
```

<span class="caption">示例 8-8：通过 `for` 循环遍历 vector 的元素并打印</span>

我们也可以遍历可变 vector 的每一个元素的可变引用以便能改变他们。示例 8-9 中的 `for` 循环会给每一个元素加 `50`：

```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50;
}
```

<span class="caption">示例8-9：遍历 vector 中元素的可变引用</span>

为了修改可变引用所指向的值，在使用 `+=` 运算符之前必须使用解引用运算符（`*`）获取 `i` 中的值。第十五章的 [“通过解引用运算符追踪指针的值”][deref] 部分会详细介绍解引用运算符。

### 使用枚举来储存多种类型

在本章的开始，我们提到 vector 只能储存相同类型的值。这是很不方便的；绝对会有需要储存一系列不同类型的值的用例。幸运的是，枚举的成员都被定义为相同的枚举类型，所以当需要在 vector 中储存不同类型值时，我们可以定义并使用一个枚举！

例如，假如我们想要从电子表格的一行中获取值，而这一行的有些列包含数字，有些包含浮点值，还有些是字符串。我们可以定义一个枚举，其成员会存放这些不同类型的值，同时所有这些枚举成员都会被当作相同类型，那个枚举的类型。接着可以创建一个储存枚举值的 vector，这样最终就能够储存不同类型的值了。示例 8-10 展示了其用例：

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

<span class="caption">示例 8-10：定义一个枚举，以便能在 vector 中存放不同类型的数据</span>

Rust 在编译时就必须准确的知道 vector 中类型的原因在于它需要知道储存每个元素到底需要多少内存。第二个好处是可以准确的知道这个 vector 中允许什么类型。如果 Rust 允许 vector 存放任意类型，那么当对 vector 元素执行操作时一个或多个类型的值就有可能会造成错误。使用枚举外加 `match` 意味着 Rust 能在编译时就保证总是会处理所有可能的情况，正如第六章讲到的那样。

如果在编写程序时不能确切无遗地知道运行时会储存进 vector 的所有类型，枚举技术就行不通了。相反，你可以使用 trait 对象，第十七章会讲到它。

现在我们了解了一些使用 vector 的最常见的方式，请一定去看看标准库中 `Vec` 定义的很多其他实用方法的 API 文档。例如，除了 `push` 之外还有一个 `pop` 方法，它会移除并返回 vector 的最后一个元素。让我们继续下一个集合类型：`String`！

[deref]: ch15-02-deref.html#following-the-pointer-to-the-value-with-the-dereference-operator