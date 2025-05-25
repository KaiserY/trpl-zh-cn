## 高级 trait

<!-- https://github.com/rust-lang/book/blob/main/src/ch20-02-advanced-traits.md -->
<!-- commit 56ec353290429e6547109e88afea4de027b0f1a9 -->

在第十章[“trait：定义共同行为”][traits-defining-shared-behavior]部分，我们第一次涉及到了 trait，不过我们并没有覆盖一些较为高级的细节。现在你对 Rust 已经有了更多了解，我们可以深入探究了。

### 关联类型

**关联类型**（*associated types*）将一个类型占位符与 trait 相关联，使得该 trait 的方法定义可以在签名中使用这些占位符类型。该 trait 的实现者会为每个具体实现指定要使用的具体类型来替代占位符类型。这样，我们就能在定义 trait 时使用占位符类型，而无需预先知道这些类型的具体内容，直到实现该 trait 时再进行指定。

我们之前提到，本章所讨论的大多数高级特性都很少需要。关联类型则比较适中：它们的使用频率低于本书其他部分讲解的特性，但又高于本章中许多其他特性。

一个带有关联类型的 trait 的例子是标准库提供的 `Iterator` trait。它有一个叫做 `Item` 的关联类型来替代遍历的值的类型。`Iterator` trait 的定义如示例 20-13 所示：

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-13/src/lib.rs}}
```

<span class="caption">示例 20-13: `Iterator` trait 的定义中带有关联类型 `Item`</span>

`Item` 是一个占位符类型，同时 `next` 方法的定义表明它返回 `Option<Self::Item>` 类型的值。`Iterator` trait 的实现者会指定 `Item` 的具体类型，于是 `next` 方法就会返回一个包含该具体类型值的 `Option`。

关联类型可能看起来与泛型类似，后者允许我们在定义函数时不必指定它可以处理的类型。为了体现这两者的区别，我们来看一个名为 `Counter` 的类型上的 `Iterator` trait 实现，其中指定 `Item` 的类型为 `u32`：

<span class="filename">文件名：src/lib.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-22-iterator-on-counter/src/lib.rs:ch19}}
```

这种语法看起来与泛型类似。那么为什么不直接像示例 20-14 那样，用泛型来定义 `Iterator` trait 呢？

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-14/src/lib.rs}}
```

<span class="caption">示例 20-14: 一个使用泛型的 `Iterator` trait 假想定义</span>

区别在于当如示例 20-14 那样使用泛型时，则不得不在每一个实现中标注类型；这是因为我们也可以实现为 `Iterator<String> for Counter`，或任何其他类型，这样就可以有多个针对 `Counter` 的 `Iterator` 的实现。换句话说，当 trait 有泛型参数时，可以多次实现这个 trait，每次都使用不同的具体泛型参数类型。当我们在 `Counter` 上调用 `next` 方法时，就必须通过类型注解来指明要使用哪一个 `Iterator` 的实现。

使用关联类型后，则无需标注类型，因为不能对同一个类型多次实现该 trait。在示例 20-13 中使用关联类型的定义里，我们只能为 `Item` 选择一次具体类型，因为只能有一个 `impl Iterator for Counter`。当调用 `Counter` 的 `next` 时不必每次指定我们需要 `u32` 值的迭代器。

关联类型也会成为 trait 契约的一部分：trait 的实现必须提供一个类型来替代关联类型占位符。关联类型通常以它的用途来命名，在 API 文档中对关联类型进行说明也是一种良好实践。

### 默认泛型类型参数和运算符重载

当使用泛型类型参数时，可以为泛型指定一个默认的具体类型。如果默认类型就足够的话，这消除了为具体类型实现 trait 的需要。为泛型类型指定默认类型的语法是在声明泛型类型时使用 `<PlaceholderType=ConcreteType>`。

这种技术的一个很好的示例是 **运算符重载** (*operator overloading*)，即在特定情况下自定义运算符（比如 `+`）行为的操作。

Rust 并不允许创建自定义运算符或重载任意运算符，但可以通过实现 `std::ops` 中列出的运算符相关 trait 来重载它们。例如，在示例 20-15 中我们重载 `+` 运算符来将两个 `Point` 实例相加。我们通过在 `Point` 结构体上实现 `Add` trait 来实现这一点。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-15/src/main.rs}}
```

<span class="caption">示例 20-15: 实现 `Add` trait 重载 `Point` 实例的 `+` 运算符</span>

`add` 方法将两个 `Point` 实例的 `x` 值和 `y` 值分别相加来创建一个新的 `Point`。`Add` trait 有一个叫做 `Output` 的关联类型，它用来决定 `add` 方法的返回值类型。

这里默认泛型类型位于 `Add` trait 中。这里是其定义：

```rust
trait Add<Rhs=Self> {
    type Output;

    fn add(self, rhs: Rhs) -> Self::Output;
}
```

这些代码看来应该很熟悉：一个带有一个方法和一个关联类型的 trait。新增的部分是 `Rhs=Self`：这个语法叫做 **默认类型参数**（*default type parameters*）。`Rhs` 是一个泛型类型参数（“right-hand side” 的缩写），它用于定义 `add` 方法中的 `rhs` 参数。如果实现 `Add` trait 时不指定 `Rhs` 的具体类型，`Rhs` 的类型将默认为 `Self`，即正在实现 `Add` 的类型。

当为 `Point` 实现 `Add` 时，使用了默认的 `Rhs`，因为我们希望将两个 `Point` 实例相加。让我们看看一个实现 `Add` trait 时希望自定义 `Rhs` 类型而不是使用默认类型的例子。

这里有两个存放不同单元值的结构体，`Millimeters` 和 `Meters`。这种将现有类型简单封装进另一个结构体的方式被称为 **newtype 模式**（*newtype pattern*），之后的[“使用 newtype 模式在外部类型上实现外部 trait”][newtype]部分会做详细介绍。我们希望能够将毫米值与米值相加，并让 `Add` 的实现正确处理单位转换。可以为 `Millimeters` 实现 `Add` 并以 `Meters` 作为 `Rhs`，如示例 20-16 所示。

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-16/src/lib.rs}}
```

<span class="caption">示例 20-16: 在 `Millimeters` 上实现 `Add`，以便能够将 `Millimeters` 与 `Meters` 相加</span>

为了使 `Millimeters` 和 `Meters` 能够相加，我们指定 `impl Add<Meters>` 来设定 `Rhs` 类型参数的值而不是使用默认的 `Self`。

默认参数类型主要用于如下两个方面：

* 扩展类型而不破坏现有代码。
* 在大部分用户都不需要的特定情况进行自定义。

标准库的 `Add` trait 就是第二个目的的一个例子：大部分时候你会将两个相似的类型相加，但 `Add` trait 也提供了自定义额外行为的能力。在 `Add` trait 定义中使用默认类型参数意味着大部分时候无需指定额外的参数。换句话说，一小部分实现的样板代码是不必要的，这样使用 trait 就更容易了。

第一个目的与第二个相似但方向相反：如果需要为现有 trait 增加类型参数，为其提供一个默认类型将允许我们在不破坏现有实现代码的基础上扩展 trait 的功能。

### 在同名方法之间消歧义

Rust 既不能避免一个 trait 与另一个 trait 拥有相同名称的方法，也不能阻止为同一类型同时实现这两个 trait。同时也可以直接在类型上实现一个与 trait 方法同名的方法。

当调用这些同名方法时，需要告诉 Rust 我们想要使用哪一个。考虑一下示例 20-17 中的代码，这里我们定义了两个 trait，`Pilot` 和 `Wizard`，它们都拥有名为 `fly` 的方法。接着在一个本身已经实现了名为 `fly` 方法的类型 `Human` 上实现这两个 trait。每一个 `fly` 方法都进行了不同的操作：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-17/src/main.rs:here}}
```

<span class="caption">示例 20-17: 两个 trait 定义为拥有 `fly` 方法，并在直接定义有 `fly` 方法的 `Human` 类型上实现这两个 trait</span>

当调用 `Human` 实例的 `fly` 时，编译器默认调用直接实现在该类型上的方法，如示例 20-18 所示。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-18/src/main.rs:here}}
```

<span class="caption">示例 20-18: 调用一个 `Human` 实例的 `fly`</span>

运行这段代码会打印出 `*waving arms furiously*`，这表明 Rust 调用了直接实现在 `Human` 上的 `fly` 方法。

为了能够调用 `Pilot` trait 或 `Wizard` trait 的 `fly` 方法，需要使用更明确的语法来指定具体要调用的 `fly` 方法。示例 20-19 演示了这种语法。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-19/src/main.rs:here}}
```

<span class="caption">示例 20-19: 指定我们希望调用哪一个 trait 的 `fly` 方法</span>

在方法名前指定 trait 名称可让 Rust 明确我们想调用哪个 `fly` 实现。也可以选择写成 `Human::fly(&person)`，这等同于示例 20-19 中的 `person.fly()`，不过如果无需消歧义的话这么写就有点冗长了。

运行这段代码会打印出如下内容：

```console
{{#include ../listings/ch20-advanced-features/listing-20-19/output.txt}}
```

因为 `fly` 方法获取一个 `self` 参数，如果有两个**类型**都实现了同一 **trait**，Rust 可以根据 `self` 的类型计算出应该使用哪一个 trait 实现。

然而，关联函数中非方法的函数不带有 `self` 参数。当存在多个类型或者 trait 定义了相同函数名的非方法函数时，Rust 就不总是能计算出我们期望的是哪一个类型，除非使用 **完全限定语法**（*fully qualified syntax*）。例如示例 20-20 中的创建了一个希望将所有小狗叫做 *Spot* 的动物收容所的 trait。`Animal` trait 有一个关联非方法函数 `baby_name`。结构体 `Dog` 实现了 `Animal`，同时又直接提供了关联非方法函数 `baby_name`。

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-20/src/main.rs}}
```

<span class="caption">示例 20-20: 一个带有关联函数的 trait 和一个带有同名关联函数并实现了此 trait 的类型</span>

在 `Dog` 类型上定义的关联函数 `baby_name` 中，我们实现了将所有小狗命名为 Spot 的功能。`Dog` 类型还实现了 `Animal` trait，它描述了所有动物所共有的特征。小狗被称为 puppy，这表现为 `Dog` 的 `Animal` trait 实现中与 `Animal` trait 相关联的函数 `baby_name`。

在 `main` 调用了 `Dog::baby_name` 函数，它直接调用了定义于 `Dog` 之上的关联函数。这段代码会打印出：

```console
{{#include ../listings/ch20-advanced-features/listing-20-20/output.txt}}
```

这不是我们想要的输出。我们希望调用的是 `Dog` 上 `Animal` trait 实现那部分的 `baby_name` 函数，这样能够打印出 `A baby dog is called a puppy`。我们在示例 20-19 中使用的指定 trait 名称的技巧在这里不起作用；如果将 `main` 改为示例 20-21 中的代码，就会得到编译错误：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-21/src/main.rs:here}}
```

<span class="caption">示例 20-21: 尝试调用 `Animal` trait 的 `baby_name` 函数，不过 Rust 并不知道该使用哪一个实现</span>

因为 `Animal::baby_name` 没有 `self` 参数，而且可能有其他类型实现了 `Animal` trait，Rust 无法确定我们想调用哪一个 `Animal::baby_name` 的实现。此时会得到如下编译错误：

```console
{{#include ../listings/ch20-advanced-features/listing-20-21/output.txt}}
```

为了消歧义并告诉 Rust 我们希望使用的是 `Dog` 的 `Animal` 实现而不是其它类型的 `Animal` 实现，需要使用**完全限定语法**。示例 20-22 演示了如何使用完全限定语法：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-22/src/main.rs:here}}
```

<span class="caption">示例 20-22: 使用完全限定语法来指定我们希望调用的是 `Dog` 上 `Animal` trait 实现中的 `baby_name` 函数</span>

我们在尖括号中向 Rust 提供了类型注解，这表明我们希望在此次函数调用中将 `Dog` 类型视为 `Animal`，从而调用在 `Dog` 上实现的 `Animal` trait 中的 `baby_name` 方法。现在这段代码将打印出我们期望的结果：

```console
{{#include ../listings/ch20-advanced-features/listing-20-22/output.txt}}
```

通常，完全限定语法定义为如下：

```rust,ignore
<Type as Trait>::function(receiver_if_method, next_arg, ...);
```

对于不是方法的关联函数，并没有一个 `receiver`：故只会有其他参数的列表。可以选择在任何函数或方法调用处使用完全限定语法。然而，允许省略任何 Rust 能够从程序中的其他信息中计算出的部分。只有当存在多个同名实现而 Rust 需要帮助以便知道我们希望调用哪个实现时，才需要使用这个较为冗长的语法。

### 使用超 trait

有时我们可能会需要编写一个依赖另一个 trait 的 trait 定义：对于一个实现了第一个 trait 的类型，你希望要求这个类型也实现了第二个 trait。如此就可使 trait 定义使用第二个 trait 的关联项。这个所需的 trait 是我们实现的 trait 的 **超（父）trait**（*supertrait*）。

例如我们希望创建一个带有 `outline_print` 方法的 trait `OutlinePrint`，它会将给定的值格式化为带有星号框。也就是说，给定一个实现了标准库 `Display` trait 的并返回 `(x, y)` 的 `Point`，当我们对一个 `x` 为 `1`、`y` 为 `3` 的 `Point` 实例调用 `outline_print` 时，它应该打印出如下内容：

```text
**********
*        *
* (1, 3) *
*        *
**********
```

在 `outline_print` 的实现中，我们希望使用 `Display` trait 的功能。因此，需要说明 `OutlinePrint` trait 仅适用于那些同时实现了 `Display` 并提供 `OutlinePrint` 所需功能的类型。可以通过在 trait 定义中指定 `OutlinePrint: Display` 来做到这一点。这种技术类似于为 trait 增加 trait bound。示例 20-23 展示了一个 `OutlinePrint` trait 的实现：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-23/src/main.rs:here}}
```

<span class="caption">示例 20-23: 实现 `OutlinePrint` trait，它要求来自 `Display` 的功能</span>

因为我们已经指定 `OutlinePrint` 需要 `Display` trait，因而可以使用自动为任何实现了 `Display` 的类型提供的 `to_string` 方法。如果我们在没有在 trait 名称后添加冒号并指定 `Display` trait 的情况下尝试使用 `to_string`，就会出现错误，提示在当前作用域中未为类型 `&Self` 找到名为 `to_string` 的方法。

让我们看看如果尝试在一个没有实现 `Display` 的类型上实现 `OutlinePrint` 会发生什么，比如 `Point` 结构体：

<span class="filename">文件名：src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-02-impl-outlineprint-for-point/src/main.rs:here}}
```

这样会得到一个错误说 `Display` 是必须的而未被实现：

```console
{{#include ../listings/ch20-advanced-features/no-listing-02-impl-outlineprint-for-point/output.txt}}
```

为了修复这个问题，我们在 `Point` 上实现 `Display` 并满足 `OutlinePrint` 要求的限制，比如这样：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/no-listing-03-impl-display-for-point/src/main.rs:here}}
```

那么在 `Point` 上实现 `OutlinePrint` trait 就能成功编译，并可以在 `Point` 实例上调用 `outline_print` 将其显示在由星号组成的边框内。

### 使用 newtype 模式在外部类型上实现外部 trait

在第十章的 [“为类型实现 trait”][implementing-a-trait-on-a-type] 部分，我们提到了孤儿规则（orphan rule），它规定只有当 trait 或类型至少有一方或两者都对于当前 crate 是本地时，才能在该类型上实现该 trait。一个绕开这个限制的方法是使用 **newtype 模式**（*newtype pattern*），它涉及到在一个元组结构体（第五章 [“用没有命名字段的元组结构体来创建不同的类型”][tuple-structs] 部分介绍了元组结构体）中创建一个新类型。这个元组结构体带有一个字段作为希望实现 trait 的类型的简单封装。由于这个封装类型对于 crate 是本地的，这样就可以在这个封装上实现 trait。*Newtype* 是一个源自 Haskell 编程语言的概念。使用这个模式没有运行时性能惩罚，这个封装类型在编译时就被省略了。

例如，如果想要在 `Vec<T>` 上实现 `Display`，而孤儿规则阻止我们直接这么做，因为 `Display` trait 和 `Vec<T>` 都定义于我们的 crate 之外。可以创建一个包含 `Vec<T>` 实例的 `Wrapper` 结构体，接着可以如列表 20-24 那样在 `Wrapper` 上实现 `Display` 并使用 `Vec<T>` 的值：

<span class="filename">文件名：src/main.rs</span>

```rust
{{#rustdoc_include ../listings/ch20-advanced-features/listing-20-24/src/main.rs}}
```

<span class="caption">示例 20-24: 创建 `Wrapper` 类型封装 `Vec<String>` 以便能够实现 `Display`</span>

`Display` 的实现使用 `self.0` 来访问其内部的 `Vec<T>`，因为 `Wrapper` 是元组结构体而 `Vec<T>` 是结构体总位于索引 0 的项。接着就可以使用 `Wrapper` 中 `Display` 的功能了。

这种做法的缺点在于因为 `Wrapper` 是一个新类型，它并不具备其所封装值的方法。必须直接在 `Wrapper` 上实现 `Vec<T>` 的所有方法，这样就可以代理到`self.0` 上，这就允许我们完全像 `Vec<T>` 那样对待 `Wrapper`。如果希望新类型拥有其内部类型的每一个方法，为封装类型实现 `Deref` trait（第十五章 [“使用 `Deref` Trait 将智能指针当作常规引用处理”][smart-pointer-deref] 部分讨论过）并返回其内部类型是一种解决方案。如果不希望封装类型拥有所有内部类型的方法 —— 比如为了限制封装类型的行为 —— 则只需自行实现所需的方法即可。

甚至当不涉及 trait 时 newtype 模式也很有用。现在让我们将关注点转移到一些与 Rust 类型系统交互的高级方式上来吧。

[newtype]: ch20-02-advanced-traits.html#使用-newtype-模式在外部类型上实现外部-trait
[implementing-a-trait-on-a-type]: ch10-02-traits.html#为类型实现-trait
[traits-defining-shared-behavior]: ch10-02-traits.html#trait定义共同行为
[smart-pointer-deref]: ch15-02-deref.html#使用-deref-trait-将智能指针当作常规引用处理
[tuple-structs]: ch05-01-defining-structs.html#使用没有命名字段的元组结构体来创建不同的类型
