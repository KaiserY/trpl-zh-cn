## 为使用不同类型的值而设计的 trait 对象

> [ch17-02-trait-objects.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-02-trait-objects.md)
> <br>
> commit 67876e3ef5323ce9d394f3ea6b08cb3d173d9ba9

 在第八章，我们谈到了 vector 只能存储同种类型元素的局限。在列表 8-1 中有一个例子，其中定义了存放包含整型、浮点型和文本型成员的枚举类型`SpreadsheetCell`，这样就可以在每一个单元格储存不同类型的数据，并使得 vector 仍然代表一行单元格。当编译时就知道类型集合全部元素的情况下，这种方案是可行的。

<!-- The code example I want to reference did not have a listing number; it's
the one with SpreadsheetCell. I will go back and add Listing 8-1 next time I
get Chapter 8 for editing. /Carol -->

有时，我们希望使用的类型的集合对于使用库的程序员来说是可扩展的。例如，很多图形用户接口（GUI）工具有一个条目列表的概念，它通过遍历列表并对每一个条目调用 `draw` 方法来绘制在屏幕上。我们将要创建一个叫做 `rust_gui` 的包含一个 GUI 库结构的库 crate。GUI 库可以包含一些供开发者使用的类型，比如 `Button` 或 `TextField`。使用 `rust_gui` 的程序员会想要创建更多可以绘制在屏幕上的类型：一个程序员可能会增加一个 `Image`，而另一个可能会增加一个 `SelectBox`。我们不会在本章节实现一个功能完善的 GUI 库，不过会展示各个部分是如何结合在一起的。

当写 `rust_gui` 库时，我们不知道其他程序员需要什么类型，所以无法定义一个 `enum` 来包含所有的类型。然而 `rust_gui` 需要跟踪所有这些不同类型的值，需要有在每个值上调用 `draw` 方法能力。我们的 GUI 库不需要确切地知道调用 `draw` 方法会发生什么，只需要有可用的方法供我们调用。

在可以继承的语言里，我们会定义一个名为 `Component` 的类，该类上有一个`draw`方法。其他的类比如`Button`、`Image`和`SelectBox`会从`Component`继承并拥有`draw`方法。它们各自覆写`draw`方法以自定义行为，但是框架会把所有的类型当作是`Component`的实例，并在其上调用`draw`。

### 定义一个带有自定义行为的Trait

不过，在Rust语言中，我们可以定义一个 `Draw` trait，包含名为 `draw` 的方法。我们定义一个由*trait对象*组成的vector，绑定了某种指针的trait，比如`&`引用或者一个`Box<T>`智能指针。

之前提到，我们不会称结构体和枚举为对象，以区分其他语言的结构体和枚举对象。结构体或者枚举成员中的数据和`impl`块中的行为是分开的，而其他语言则是数据和行为被组合到一个对象里。Trait 对象更像其他语言的对象，因为他们将其指针指向的具体对象作为数据，将在 trait 中定义的方法作为行为，组合在了一起。但是，trait 对象和其他语言是不同的，我们不能向一个 trait 对象增加数据。trait 对象不像其他语言那样有用：它们的目的是允许从公有行为上抽象。

trait 对象定义了给定情况下应有的行为。当需要具有某种特性的不确定具体类型时，我们可以把 trait 对象当作 trait 使用。Rust 的类型系统会保证我们为 trait 对象带入的任何值会实现 trait 的方法。我们不需要在编译阶段知道所有可能的类型，却可以把所有的实例统一对待。列表 17-03 展示了如何定义一个名为`Draw`的带有`draw`方法的 trait。

<span class="filename">文件名: src/lib.rs</span>

```rust
pub trait Draw {
    fn draw(&self);
}
```

<span class="caption">列表 17-3:`Draw` trait 的定义</span>

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

因为我们已经在第十章讨论过如何定义 trait，你可能比较熟悉。下面是新的定义：列表 17-4 有一个名为 `Screen` 的结构体，里面有一个名为 `components` 的 vector，`components` 的类型是 `Box<Draw>`。`Box<Draw>` 是一个 trait 对象：它是 `Box` 内部任意一个实现了 `Draw` trait 的类型的替身。

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub trait Draw {
#     fn draw(&self);
# }
#
pub struct Screen {
    pub components: Vec<Box<Draw>>,
}
```

<span class="caption">列表 17-4: 一个 `Screen` 结构体的定义，它带有一个字段`components`，其包含实现了 `Draw` trait 的 trait 对象的 vector</span>

在 `Screen` 结构体上，我们将要定义一个 `run` 方法，该方法会在它的 `components` 上的每一个元素调用 `draw` 方法，如列表 17-5 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub trait Draw {
#     fn draw(&self);
# }
#
# pub struct Screen {
#     pub components: Vec<Box<Draw>>,
# }
#
impl Screen {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

<span class="caption">列表 17-5:在 `Screen` 上实现一个 `run` 方法，该方法在每个 component 上调用 `draw` 方法
</span>

这与带 trait 约束的泛型结构体不同(trait 约束泛型参数)。泛型参数一次只能被一个具体类型替代，而 trait 对象可以在运行时允许多种具体类型填充 trait 对象。比如，我们已经定义了 `Screen` 结构体使用泛型和一个 trait 约束，如列表 17-6 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub trait Draw {
#     fn draw(&self);
# }
#
pub struct Screen<T: Draw> {
    pub components: Vec<T>,
}

impl<T> Screen<T>
    where T: Draw {
    pub fn run(&self) {
        for component in self.components.iter() {
            component.draw();
        }
    }
}
```

<span class="caption">列表 17-6: 一种 `Screen` 结构体的替代实现，它的 `run` 方法使用通用类型和 trait 绑定
</span>

这个例子中，`Screen` 实例所有组件类型必需全是 `Button`，或者全是 `TextField`。如果你的组件集合是单一类型的，那么可以优先使用泛型和 trait 约束，因为其使用的具体类型在编译阶段即可确定。

而 `Screen` 结构体内部的 `Vec<Box<Draw>>` trait 对象列表，则可以同时包含 `Box<Button>` 和 `Box<TextField>`。我们看它是怎么工作的，然后讨论运行时性能。

### 来自我们或者库使用者的实现

现在，我们增加一些实现了 `Draw` trait 的类型，再次提供 `Button`。实现一个 GUI 库实际上超出了本书的范围，因此 `draw` 方法留空。为了想象实现可能的样子，`Button` 结构体有 `width`、`height` 和 `label`字段，如列表 17-7 所示：

<span class="filename">文件名: src/lib.rs</span>

```rust
# pub trait Draw {
#     fn draw(&self);
# }
#
pub struct Button {
    pub width: u32,
    pub height: u32,
    pub label: String,
}

impl Draw for Button {
    fn draw(&self) {
        // Code to actually draw a button
    }
}
```

<span class="caption">列表 17-7: 实一个现了`Draw` trait 的 `Button` 结构体</span>

在 `Button` 上的 `width`、`height` 和 `label` 会和其他组件不同，比如 `TextField` 可能有 `width`、`height`,
`label` 以及 `placeholder` 字段。每个我们可以在屏幕上绘制的类型都会实现 `Draw` trait，在 `draw` 方法中使用不同的代码，定义了如何绘制 `Button`。除了 `Draw` trait，`Button` 也可能有一个 `impl` 块，包含按钮被点击时的响应方法。这类方法不适用于 `TextField` 这样的类型。

假定我们的库的用户相要实现一个包含 `width`、`height` 和 `options` 的 `SelectBox` 结构体。同时也在 `SelectBox` 类型上实现了 `Draw` trait，如 列表  17-8 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
extern crate rust_gui;
use rust_gui::Draw;

struct SelectBox {
    width: u32,
    height: u32,
    options: Vec<String>,
}

impl Draw for SelectBox {
    fn draw(&self) {
        // Code to actually draw a select box
    }
}
```

<span class="caption">列表 17-8: 另外一个 crate 中，在 `SelectBox` 结构体上使用 `rust_gui` 和实现了`Draw` trait
</span>

库的用户现在可以在他们的 `main` 函数中创建一个 `Screen` 实例，然后把自身放入 `Box<T>` 变成 trait 对象，向 screen 增加 `SelectBox` 和 `Button`。他们可以在这个 `Screen` 实例上调用 `run` 方法，这又会调用每个组件的 `draw` 方法。 列表 17-9 展示了实现：

<span class="filename">文件名: src/main.rs</span>

```rust
use rust_gui::{Screen, Button};

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(SelectBox {
                width: 75,
                height: 10,
                options: vec![
                    String::from("Yes"),
                    String::from("Maybe"),
                    String::from("No")
                ],
            }),
            Box::new(Button {
                width: 50,
                height: 10,
                label: String::from("OK"),
            }),
        ],
    };

    screen.run();
}
```

<span class="caption">列表 17-9: 使用 trait 对象来存储实现了相同 trait 的不同类型
</span>

虽然我们不知道哪一天会有人增加 `SelectBox` 类型，但是我们的 `Screen` 能够操作 `SelectBox` 并绘制它，因为 `SelectBox` 实现了 `Draw` 类型，这意味着它实现了 `draw` 方法。

只关心值的响应，而不关心其具体类型，这类似于动态类型语言中的 *duck typing*：如果它像鸭子一样走路，像鸭子一样叫，那么它就是只鸭子！在 Listing 17-5 `Screen` 的 `run` 方法实现中，`run` 不需要知道每个组件的具体类型。它也不检查组件是 `Button` 还是 `SelectBox` 的实例，只管调用组件的 `draw` 方法。通过指定 `Box<Draw>` 作为 `components` 列表中元素的类型，我们约束了 `Screen` 需要这些实现了 `draw` 方法的值。

Rust 类型系统使用 trait 对象来支持 duck typing 的好处是，我们无需在运行时检查一个值是否实现了特定方法，或是担心调用了一个值没有实现的方法。如果值没有实现 trait 对象需要的 trait（方法），Rust 不会编译。

比如，列表 17-10 展示了当我们创建一个使用 `String` 做为其组件的 `Screen` 时发生的情况：

<span class="filename">文件名: src/main.rs</span>

```rust
extern crate rust_gui;
use rust_gui::Draw;

fn main() {
    let screen = Screen {
        components: vec![
            Box::new(String::from("Hi")),
        ],
    };

    screen.run();
}
```

<span class="caption">列表 17-10: 尝试使用一种没有实现 trait 对象的类型

</span>

我们会遇到这个错误，因为 `String` 没有实现 `Draw` trait：

```
error[E0277]: the trait bound `std::string::String: Draw` is not satisfied
  -->
   |
 4 |             Box::new(String::from("Hi")),
   |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `Draw` is not
   implemented for `std::string::String`
   |
   = note: required for the cast to the object type `Draw`
```

这个错误告诉我们，要么传入 `Screen` 需要的类型，要么在 `String` 上实现 `Draw`，以便　`Screen` 调用它的 `draw` 方法。

### Trait 对象执行动态分发

回忆一下第十章我们讨论过的，当我们在泛型上使用 trait 约束时，编译器按单态类型处理：在需要使用范型参数的地方，编译器为每个具体类型生成非泛型的函数和方法实现。单态类型处理产生的代码实际就是做 *static dispatch*：方法的代码在编译阶段就已经决定了，当调用时，寻找那段代码非常快速。

当我们使用 trait 对象，编译器不能按单态类型处理，因为无法知道使用代码的所有可能类型。而是调用方法的时候，Rust 跟踪可能被使用的代码，在运行时找出调用该方法时应使用的代码。这也是我们熟知的 *dynamic dispatch*，查找过程会产生运行时开销。动态分发也会阻止编译器内联函数，失去一些优化途径。尽管获得了额外的灵活性，但仍然需要权衡取舍。

### Trait 对象需要对象安全

<!-- Liz: we're conflicted on including this section. Not being able to use a
trait as a trait object because of object safety is something that
beginner/intermediate Rust developers run into sometimes, but explaining it
fully is long and complicated. Should we just cut this whole section? Leave it
(and finish the explanation of how to fix the error at the end)? Shorten it to
a quick caveat, that just says something like "Some traits can't be trait
objects. Clone is an example of one. You'll get errors that will let you know
if a trait can't be a trait object, look up object safety if you're interested
in the details"? Thanks! /Carol -->

不是所有的 trait 都可以被放进 trait 对象中; 只有*对象安全的*（*object safe*）trait 才可以这样做. 一个 trait 只有同时满足如下两点时才被认为是对象安全的:

* 该 trait 要求 `Self` 不是 `Sized`;
* 该 trait 的所有方法都是对象安全的;

`Self` 是一个类型的别名关键字，它表示当前正被实现的 trait 类型或者是方法所属的类型. `Sized`是一个像在第十六章中介绍的`Send`和`Sync`那样的标记 trait, 在编译时它会自动被放进大小确定的类型里，比如`i32`和引用. 大小不确定的类型有 slice（`[T]`）和 trait 对象.

`Sized` 是一个默认会被绑定到所有常规类型参数的内隐 trait. Rust 中要求一个类型是`Sized`的最具可用性的用法是让`Sized`成为一个默认的 trait 绑定，这样我们就可以在大多数的常规的用法中不去写 `T: Sized` 了. 如果我们想在切片（slice）中使用一个 trait, 我们需要取消对`Sized`的 trait 绑定, 我们只需制定`T: ?Sized`作为 trait 绑定.

默认绑定到 `Self: ?Sized` 的 trait 可以被实现到是 `Sized` 或非 `Sized` 的类型上. 如果我们创建一个不绑定 `Self: ?Sized` 的 trait `Foo`，它看上去应该像这样: 

```rust
trait Foo: Sized {
    fn some_method(&self);
}
```

Trait `Sized`现在就是 trait `Foo`的一个*超级 trait*（*supertrait*）, 也就是说 trait `Foo` 需要实现了 `Foo` 的类型(即`Self`)是`Sized`. 我们将在第十九章中更详细的介绍超 trait（supertrait）.

像`Foo`那样要求`Self`是`Sized`的 trait 不允许成为 trait 对象的原因是不可能为 trait 对象`Foo`实现 trait `Foo`: trait 对象是无确定大小的，但是 `Foo` 要求 `Self` 是 `Sized`. 一个类型不可能同时既是有大小的又是无确定大小的.

第二点说对象安全要求一个 trait 的所有方法必须是对象安全的. 一个对象安全的方法满足下列条件:

* 它要求 `Self` 是 `Sized` 或者
* 它符合下面全部三点:
    * 它不包含任意类型的常规参数
    * 它的第一个参数必须是类型 `Self` 或一个引用到 `Self` 的类型(也就是说它必须是一个方法而非关联函数并且以 `self`、`&self` 或 `&mut self` 作为第一个参数)
    * 除了第一个参数外它不能在其它地方用 `Self` 作为方法的参数签名

虽然这些规则有一点形式化, 但是换个角度想一下: 如果你的方法在它的参数签名的其它地方也需要具体的 `Self` 类型参数, 但是一个对象又忘记了它的具体类型是什么, 这时该方法就无法使用被它忘记的原先的具体类型. 当该 trait 被使用时, 被具体类型参数填充的常规类型参数也是如此: 这个具体的类型就成了实现该 trait 的类型的某一部分, 如果使用一个 trait 对象时这个类型被抹掉了, 就没有办法知道该用什么类型来填充这个常规类型参数.

一个 trait 的方法不是对象安全的一个例子是标准库中的 `Clone` trait. `Clone` trait 的 `clone` 方法的参数签名是这样的:

```rust
pub trait Clone {
    fn clone(&self) -> Self;
}
```

`String` 实现了 `Clone` trait, 当我们在一个 `String` 实例上调用 `clone` 方法时, 我们会得到一个 `String` 实例. 同样地, 如果我们在一个 `Vec` 实例上调用 `clone` 方法, 我们会得到一个 `Vec` 实例. `clone` 的参数签名需要知道 `Self` 是什么类型, 因为它需要返回这个类型.

如果我们像列表 17-3 中列出的 `Draw` trait 那样的 trait 上实现 `Clone`, 我们就不知道 `Self` 将会是一个 `Button`, 一个 `SelectBox`, 或者是其它的在将来要实现 `Draw` trait 的类型.

如果你做了违反 trait 对象的对象安全性规则的事情, 编译器将会告诉你. 比如, 如果你实现在列表 17-4 中列出的 `Screen` 结构, 你想让该结构像这样持有实现了 `Clone` trait 的类型而不是 `Draw` trait:

```rust
pub struct Screen {
    pub components: Vec<Box<Clone>>,
}
```

我们将会得到下面的错误:

```text
error[E0038]: the trait `std::clone::Clone` cannot be made into an object
 -->
  |
2 |     pub components: Vec<Box<Clone>>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `std::clone::Clone` cannot be
  made into an object
  |
  = note: the trait cannot require that `Self : Sized`
```

<!-- If we are including this section, we would explain how to fix this
problem. It involves adding another trait and implementing Clone manually for
that trait. Because this section is getting long, I stopped because it feels
like we're off in the weeds with an esoteric detail that not everyone will need
to know about. /Carol -->
