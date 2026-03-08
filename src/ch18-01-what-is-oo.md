## 面向对象语言的特征

[ch18-01-what-is-oo.md](https://github.com/rust-lang/book/blob/eb54c18184c0555acd9f636f5ef7875236b0ff53/src/ch18-01-what-is-oo.md)

关于一门语言必须具备哪些特征才能被视为面向对象，目前在编程社区中并没有共识。Rust 受到了许多编程范式的影响，包括面向对象编程（OOP）；例如，在第 13 章中，我们探讨了来自函数式编程的特性。可以说，面向对象的语言共有一些共同的特征，即对象、封装和继承。我们将会讨论这些特征分别是什么，以及 Rust 是否支持它们。

### 对象包含数据和行为

由 Erich Gamma、Richard Helm、Ralph Johnson 和 John Vlissides（Addison-Wesley Professional, 1994）编写的书 *Design Patterns: Elements of Reusable Object-Oriented Software* ，通称 *The Gang of Four*，是一本面向对象设计模式的目录。它这样定义面向对象编程：

> Object-oriented programs are made up of objects. An *object* packages both
> data and the procedures that operate on that data. The procedures are
> typically called *methods* or *operations*.
>
> 面向对象的程序由对象组成。一个**对象**同时封装了数据以及操作这些数据的过程。这些过程通常被称为**方法**或**操作**。

在这个定义下，Rust 是面向对象的：结构体和枚举包含数据而 `impl` 块提供了在结构体和枚举之上的方法。虽然带有方法的结构体和枚举并不被**称为**对象，但是参考 *The Gang of Four* 中对象的定义，它们提供了与对象相同的功能。

### 封装隐藏了实现细节

另一个通常与面向对象编程关联的概念是 **封装**（*encapsulation*）：一个对象的实现细节对使用该对象的代码不可见。因此，对象交互的唯一方式是通过其公有 API；使用对象的代码不应能直接触及对象的内部并改变数据或行为。这使得程序员能够更改和重构一个对象的内部实现，而无需改变使用该对象的代码。

我们在第七章讨论了如何控制封装：我们可以使用 `pub` 关键字来决定代码中的哪些模块、类型、函数和方法是公有的，而默认情况下其他所有内容都是私有的。例如，我们可以定义一个 `AveragedCollection` 结构体，其中有一个存有 `Vec<i32>` 的字段。该结构体还可以有一个字段存储向量中值的平均值，从而无需在每次需要时重新计算。换句话说，`AveragedCollection` 会为我们缓存已计算的平均值。示例 18-1 给出了 `AveragedCollection` 结构体的定义：

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch18-oop/listing-18-01/src/lib.rs}}
```

<span class="caption">示例 18-1: `AveragedCollection` 结构体维护了一个整型列表及其所有元素的平均值。</span>

该结构体被标记为 `pub`，这样其他代码就可以使用它，但结构体内的字段仍保持私有。这在这种情况下很重要，因为我们想确保每当列表中添加或删除值时，平均值也会更新。我们通过实现结构体上的 `add`、`remove` 和 `average` 方法来做到这一点，如示例 18-2 所示：

<span class="filename">文件名：src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch18-oop/listing-18-02/src/lib.rs:here}}
```

<span class="caption">示例 18-2: 在 `AveragedCollection` 结构体上实现了 `add`、`remove` 和 `average` 公有方法</span>

公有方法 `add`、`remove` 和 `average` 是访问或修改 `AveragedCollection` 实例中数据的唯一途径。当使用 `add` 方法把一个元素加入到 `list` 或者使用 `remove` 方法来删除时，这些方法的实现同时会调用私有的 `update_average` 方法来更新 `average` 字段。

`list` 和 `average` 是私有的，所以没有其他方式来使得外部的代码直接向 `list` 增加或者删除元素，否则 `list` 改变时可能会导致 `average` 字段不同步。`average` 方法返回 `average` 字段的值，这使得外部的代码只能读取 `average` 而不能修改它。

因为我们已经封装了 `AveragedCollection` 的实现细节，改动数据结构等内部实现非常简单。例如，可以使用 `HashSet<i32>` 代替 `Vec<i32>` 作为 `list` 字段的类型。只要 `add`、`remove` 和 `average` 这些公有方法的签名保持不变，使用 `AveragedCollection` 的代码就无需改变。如果我们将 `list` 设为公有，情况就未必如此：`HashSet<i32>` 和 `Vec<i32>` 使用不同的方法增加或移除项，所以如果外部代码直接修改 `list`，很可能需要进行更改。

如果封装被认为是面向对象语言所必要的特征，那么 Rust 满足这个要求。在代码中不同的部分控制 `pub` 的使用来封装实现细节。

### 作为类型系统与代码共享的继承

**继承**（*Inheritance*）是一种机制：一个对象可以从另一个对象的定义中继承元素，从而获得父对象的数据和行为，无需再次定义。

如果一种语言必须拥有继承才能算作面向对象，那么 Rust 就不是这样的语言。Rust 没有办法在不借助宏的情况下，定义一个结构体去继承父结构体的字段和方法实现。

不过，如果你已经习惯了把继承作为编程工具箱的一部分，那么 Rust 也会根据你最初想借助继承解决的问题，提供其他方案。

选择继承通常有两个主要原因。其一是复用代码：你可以先为某种类型实现特定行为，然后借助继承把这份实现复用到另一种类型上。在 Rust 中，可以通过 trait 方法的默认实现，在一定程度上做到这一点。你在示例 10-14 中已经见过：我们为 `Summary` trait 的 `summarize` 方法提供了默认实现。这样，任何实现 `Summary` trait 的类型，都会自动拥有 `summarize` 方法，而无需额外编写代码。这很像父类已经实现了某个方法，而继承它的子类也随之拥有这份实现。同样地，在实现 `Summary` trait 时，我们也可以覆盖 `summarize` 的默认实现，这又类似于子类去重写从父类继承而来的方法实现。

另一个使用继承的原因和类型系统有关：它可以让子类型出现在父类型能出现的地方。这也被称为**多态**（*polymorphism*），意思是如果多个对象共享某些共同特征，那么在运行时就可以把它们彼此替换使用。

> ### 多态（Polymorphism）
>
> 对很多人来说，多态性与继承同义。但它实际上是一个更广义的概念，指的是可以处理多种类型数据的代码。对继承而言，这些类型通常是子类。
>
> Rust 使用泛型来抽象不同可能的类型，并通过 trait bound 来约束这些类型所必须提供的内容。这有时被称为 *bounded parametric polymorphism*。

Rust 通过不提供继承，选择了另一组不同的权衡。继承常常有“共享了超出需要的代码”的风险。子类并不总是应该继承父类的全部特征，但使用继承时却往往会这样发生。这会让程序设计变得不够灵活。它还会引入这样一种可能：在子类上调用一些其实并不适用的方法，结果这些方法要么根本说不通，要么会导致错误。另外，一些语言只支持**单继承**（即一个子类只能继承一个父类），这也进一步限制了程序设计的灵活性。

基于这些原因，Rust 采取了不同的做法：它使用 trait object，而不是继承，来实现运行时多态。接下来我们就来看看 trait object 是如何工作的。
