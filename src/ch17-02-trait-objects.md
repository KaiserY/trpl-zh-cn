## 顾及不同类型值的 trait 对象

> [ch17-02-trait-objects.md](https://github.com/rust-lang/book/blob/main/src/ch17-02-trait-objects.md)
> <br>
> commit 727ef100a569d9aa0b9da3a498a346917fadc979

 在第八章中，我们谈到了 vector 只能存储同种类型元素的局限。示例 8-10 中提供了一个定义 `SpreadsheetCell` 枚举来储存整型，浮点型和文本成员的替代方案。这意味着可以在每个单元中储存不同类型的数据，并仍能拥有一个代表一排单元的 vector。这在当编译代码时就知道希望可以交替使用的类型为固定集合的情况下是完全可行的。

然而有时我们希望库用户在特定情况下能够扩展有效的类型集合。为了展示如何实现这一点，这里将创建一个图形用户接口（Graphical User Interface， GUI）工具的例子，它通过遍历列表并调用每一个项目的 `draw` 方法来将其绘制到屏幕上 —— 此乃一个 GUI 工具的常见技术。我们将要创建一个叫做 `gui` 的库 crate，它含一个 GUI 库的结构。这个 GUI 库包含一些可供开发者使用的类型，比如 `Button` 或 `TextField`。在此之上，`gui` 的用户希望创建自定义的可以绘制于屏幕上的类型：比如，一个程序员可能会增加 `Image`，另一个可能会增加 `SelectBox`。

这个例子中并不会实现一个功能完善的 GUI 库，不过会展示其中各个部分是如何结合在一起的。编写库的时候，我们不可能知晓并定义所有其他程序员希望创建的类型。我们所知晓的是 `gui` 需要记录一系列不同类型的值，并需要能够对其中每一个值调用 `draw` 方法。这里无需知道调用 `draw` 方法时具体会发生什么，只要该值会有那个方法可供我们调用。

在拥有继承的语言中，可以定义一个名为 `Component` 的类，该类上有一个 `draw` 方法。其他的类比如 `Button`、`Image` 和 `SelectBox` 会从 `Component` 派生并因此继承 `draw` 方法。它们各自都可以覆盖 `draw` 方法来定义自己的行为，但是框架会把所有这些类型当作是 `Component` 的实例，并在其上调用 `draw`。不过 Rust 并没有继承，我们得另寻出路。

### 定义通用行为的 trait

为了实现 `gui` 所期望的行为，让我们定义一个 `Draw` trait，其中包含名为 `draw` 的方法。接着可以定义一个存放 **trait 对象**（*trait object*） 的 vector。trait 对象指向一个实现了我们指定 trait 的类型的实例，以及一个用于在运行时查找该类型的trait方法的表。我们通过指定某种指针来创建 trait 对象，例如 `&` 引用或  `Box<T>` 智能指针，还有 `dyn`  keyword， 以及指定相关的 trait（第十九章  [““动态大小类型和 `Sized` trait”][dynamically-sized] 部分会介绍 trait 对象必须使用指针的原因）。我们可以使用 trait 对象代替泛型或具体类型。任何使用 trait 对象的位置，Rust 的类型系统会在编译时确保任何在此上下文中使用的值会实现其 trait 对象的 trait。如此便无需在编译时就知晓所有可能的类型。

之前提到过，Rust 刻意不将结构体与枚举称为 “对象”，以便与其他语言中的对象相区别。在结构体或枚举中，结构体字段中的数据和 `impl` 块中的行为是分开的，不同于其他语言中将数据和行为组合进一个称为对象的概念中。trait 对象将数据和行为两者相结合，从这种意义上说 **则** 其更类似其他语言中的对象。不过 trait 对象不同于传统的对象，因为不能向 trait 对象增加数据。trait 对象并不像其他语言中的对象那么通用：其（trait 对象）具体的作用是允许对通用行为进行抽象。

示例 17-3 展示了如何定义一个带有 `draw` 方法的 trait `Draw`：

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch17-oop/listing-17-03/src/lib.rs}}
```

<span class="caption">示例 17-3：`Draw` trait 的定义</span>

因为第十章已经讨论过如何定义 trait，其语法看起来应该比较眼熟。接下来就是新内容了：示例 17-4 定义了一个存放了名叫 `components` 的 vector 的结构体 `Screen`。这个 vector 的类型是 `Box<dyn Draw>`，此为一个 trait 对象：它是 `Box` 中任何实现了 `Draw` trait 的类型的替身。

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch17-oop/listing-17-04/src/lib.rs:here}}
```

<span class="caption">示例 17-4: 一个 `Screen` 结构体的定义，它带有一个字段 `components`，其包含实现了 `Draw` trait 的 trait 对象的 vector</span>

在 `Screen` 结构体上，我们将定义一个 `run` 方法，该方法会对其 `components` 上的每一个组件调用 `draw` 方法，如示例 17-5 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch17-oop/listing-17-05/src/lib.rs:here}}
```

<span class="caption">示例 17-5：在 `Screen` 上实现一个 `run` 方法，该方法在每个 component 上调用 `draw` 方法</span>

这与定义使用了带有 trait bound 的泛型类型参数的结构体不同。泛型类型参数一次只能替代一个具体类型，而 trait 对象则允许在运行时替代多种具体类型。例如，可以定义 `Screen` 结构体来使用泛型和 trait bound，如示例 17-6 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch17-oop/listing-17-06/src/lib.rs:here}}
```

<span class="caption">示例 17-6: 一种 `Screen` 结构体的替代实现，其 `run` 方法使用泛型和 trait bound</span>

这限制了 `Screen` 实例必须拥有一个全是 `Button` 类型或者全是 `TextField` 类型的组件列表。如果只需要同质（相同类型）集合，则倾向于使用泛型和 trait bound，因为其定义会在编译时采用具体类型进行单态化。

另一方面，通过使用 trait 对象的方法，一个 `Screen` 实例可以存放一个既能包含 `Box<Button>`，也能包含 `Box<TextField>` 的 `Vec<T>`。让我们看看它是如何工作的，接着会讲到其运行时性能影响。

### 实现 trait

现在来增加一些实现了 `Draw` trait 的类型。我们将提供 `Button` 类型。再一次重申，真正实现 GUI 库超出了本书的范畴，所以 `draw` 方法体中不会有任何有意义的实现。为了想象一下这个实现看起来像什么，一个 `Button` 结构体可能会拥有 `width`、`height` 和 `label` 字段，如示例 17-7 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust,noplayground
{{#rustdoc_include ../listings/ch17-oop/listing-17-07/src/lib.rs:here}}
```

<span class="caption">示例 17-7: 一个实现了 `Draw` trait 的 `Button` 结构体</span>

在 `Button` 上的 `width`、`height` 和 `label` 字段会和其他组件不同，比如 `TextField` 可能有 `width`、`height`、`label` 以及 `placeholder` 字段。每一个我们希望能在屏幕上绘制的类型都会使用不同的代码来实现 `Draw` trait 的 `draw` 方法来定义如何绘制特定的类型，像这里的 `Button` 类型（并不包含任何实际的 GUI 代码，这超出了本章的范畴）。除了实现 `Draw` trait 之外，比如 `Button` 还可能有另一个包含按钮点击如何响应的方法的 `impl` 块。这类方法并不适用于像 `TextField` 这样的类型。

如果一些库的使用者决定实现一个包含 `width`、`height` 和 `options` 字段的结构体 `SelectBox`，并且也为其实现了 `Draw` trait，如示例 17-8 所示：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch17-oop/listing-17-08/src/main.rs:here}}
```

<span class="caption">示例 17-8: 另一个使用 `gui` 的 crate 中，在 `SelectBox` 结构体上实现 `Draw` trait</span>

库使用者现在可以在他们的 `main` 函数中创建一个 `Screen` 实例。至此可以通过将 `SelectBox` 和 `Button` 放入 `Box<T>` 转变为 trait 对象来增加组件。接着可以调用 `Screen` 的 `run` 方法，它会调用每个组件的 `draw` 方法。示例 17-9 展示了这个实现：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
{{#rustdoc_include ../listings/ch17-oop/listing-17-09/src/main.rs:here}}
```

<span class="caption">示例 17-9: 使用 trait 对象来存储实现了相同 trait 的不同类型的值</span>

当编写库的时候，我们不知道何人会在何时增加 `SelectBox` 类型，不过 `Screen` 的实现能够操作并绘制这个新类型，因为 `SelectBox` 实现了 `Draw` trait，这意味着它实现了 `draw` 方法。

这个概念 —— 只关心值所反映的信息而不是其具体类型 —— 类似于动态类型语言中称为 **鸭子类型**（*duck typing*）的概念：如果它走起来像一只鸭子，叫起来像一只鸭子，那么它就是一只鸭子！在示例 17-5 中 `Screen` 上的 `run` 实现中，`run` 并不需要知道各个组件的具体类型是什么。它并不检查组件是 `Button` 或者 `SelectBox` 的实例。通过指定 `Box<dyn Draw>` 作为 `components` vector 中值的类型，我们就定义了 `Screen` 为需要可以在其上调用 `draw` 方法的值。

使用 trait 对象和 Rust 类型系统来进行类似鸭子类型操作的优势是无需在运行时检查一个值是否实现了特定方法或者担心在调用时因为值没有实现方法而产生错误。如果值没有实现 trait 对象所需的 trait 则 Rust 不会编译这些代码。

例如，示例 17-10 展示了当创建一个使用 `String` 做为其组件的 `Screen` 时发生的情况：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore,does_not_compile
{{#rustdoc_include ../listings/ch17-oop/listing-17-10/src/main.rs}}
```

<span class="caption">示例 17-10: 尝试使用一种没有实现 trait 对象的 trait 的类型</span>

我们会遇到这个错误，因为 `String` 没有实现 `rust_gui::Draw` trait：

```console
{{#include ../listings/ch17-oop/listing-17-10/output.txt}}
```

这告诉了我们，要么是我们传递了并不希望传递给 `Screen` 的类型并应该提供其他类型，要么应该在 `String` 上实现 `Draw` 以便 `Screen` 可以调用其上的 `draw`。

### trait 对象执行动态分发

回忆一下第十章 [“泛型代码的性能”][performance-of-code-using-generics] 部分讨论过的，当对泛型使用 trait bound 时编译器所执行的单态化处理：编译器为每一个被泛型类型参数代替的具体类型生成了函数和方法的非泛型实现。单态化产生的代码在执行 **静态分发**（*static dispatch*）。静态分发发生于编译器在编译时就知晓调用了什么方法的时候。这与 **动态分发** （*dynamic dispatch*）相对，这时编译器在编译时无法知晓调用了什么方法。在动态分发的场景下，编译器生成的代码到运行时才能确定调用了什么方法。

当使用 trait 对象时，Rust 必须使用动态分发。编译器无法知晓所有可能用于 trait 对象代码的类型，所以它也不知道应该调用哪个类型的哪个方法实现。为此，Rust 在运行时使用 trait 对象中的指针来知晓需要调用哪个方法。动态分发也阻止编译器有选择的内联方法代码，这会相应的禁用一些优化。尽管在编写示例 17-5 和可以支持示例 17-9 中的代码的过程中确实获得了额外的灵活性，但仍然需要权衡取舍。

### trait对象需要类型安全  

只有对象安全（object-safe）的trait可以实现为特征对象。这里有一些复杂的规则来实现trait的对象安全，但在实践中，只有两个相关的规则。如果一个 trait 中定义的所有方法都符合以下规则，则该 trait 是对象安全的：  

- 返回值不是 `Self`  
- 没有泛型类型的参数

`Self` 关键字是我们在 trait 与方法上的实现的别称，trait 对象必须是对象安全的，因为一旦使用 trait 对象，Rust 将不再知晓该实现的返回类型。如果一个 trait 的方法返回了一个 `Self` 类型，但是该 trait 对象忘记了 `Self` 的确切类型，那么该方法将不能使用原本的类型。当 trait 使用具体类型填充的泛型类型时也一样：具体类型成为实现 trait 的对象的一部分，当使用 trait 对象却忘了类型是什么时，无法知道应该用什么类型来填充泛型类型。

一个非对象安全的 trait 例子是标准库中的 `Clone` trait。`Clone` trait 中的 `clone` 方法的声明如下：

```rust,ignore
pub trait Clone {
    fn clone(&self) -> Self;
}
```

`String` 类型实现了 `Clone` trait，当我们在 `String` 的实例对象上调用 `clone` 方法时，我们会得到一个 `String` 类型实例对象。相似地，如果我们调用 `Vec<T>` 实例对象上的 `clone` 方法，我们会得到一个 `Vec<T>` 类型的实例对象。`clone` 方法的标签需要知道哪个类型是 `Self` 类型，因为 `Self` 是它的返回类型。

当我们尝试编译一些违反 trait 对象的对象安全规则的代码时，我们会收到编译器的提示。例如，我们想实现17-4的 `Screen` 结构体来保存一个实现了 `Clone` trait 而不是 `Draw` trait 的类型，如下所示

```rust,ignore,does_not_compile
pub struct Screen {
    pub components: Vec<Box<dyn Clone>>,
}
```

我们将会收到如下错误：

```console
$ cargo build
   Compiling gui v0.1.0 (file:///projects/gui)
error[E0038]: the trait `Clone` cannot be made into an object
 --> src/lib.rs:2:29
  |
2 |     pub components: Vec<Box<dyn Clone>>,
  |                             ^^^^^^^^^ `Clone` cannot be made into an object
  |
  = note: the trait cannot be made into an object because it requires `Self: Sized`
  = note: for a trait to be "object safe" it needs to allow building a vtable to allow the call to be resolvable dynamically; for more information visit <https://doc.rust-lang.org/reference/items/traits.html#object-safety>

For more information about this error, try `rustc --explain E0038`.
error: could not compile `gui` due to previous error
```

这个错误意味着我们不能将此 trait 用于 trait 对象。如果你想了解更多有关对象安全的细节，请移步至 [Rust RFC 255][Rust RFC 255 ref] 或查看 [Rust Reference][Rust Reference ref]


[performance-of-code-using-generics]:
ch10-01-syntax.html#泛型代码的性能
[dynamically-sized]: ch19-04-advanced-types.html#动态大小类型和-sized-trait
[Rust RFC 255 ref]: https://github.com/rust-lang/rfcs/blob/master/text/0255-object-safety.md
[Rust Reference ref]: https://doc.rust-lang.org/reference/items/traits.html#object-safety
