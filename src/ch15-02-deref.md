## 通过 `Deref` trait 将智能指针当作常规引用处理

> [ch15-02-deref.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch15-02-deref.md)
> <br>
> commit d06a6a181fd61704cbf7feb55bc61d518c6469f9

实现 `Deref` trait 允许我们重载 **解引用运算符**（*dereference operator*）`*`（与乘法运算符或 glob 运算符相区别）。通过这种方式实现 `Deref` trait 可以被当作常规引用来对待，可以编写操作引用的代码并用于智能指针。

<!-- Why would we want to override the dereference operator? Can you lay that
out? -->
<!-- Attempted above. /Carol -->

<!-- I'd suggest introducing what you mean by "convenient" here, if we are
using it as the reason we want to use Deref -->
<!-- I've removed convenient from the first paragraph and foreshadowed in a
different way in the below paragraph /Carol -->

让我们首先看看 `*` 如何处理引用，接着尝试定义我们自己的类 `Box<T>` 类型并看看为何 `*` 不能像引用一样工作。我们会探索如何实现 `Deref` trait 使得智能指针以类似引用的方式工作变为可能。最后，我们会讨论 Rust 的 **解引用强制多态**（*deref coercions*）功能和它是如何一同处理引用或智能指针的。

### 通过 `*` 追踪指针的值

<!-- I want to avoid too much cross referencing, I think it can be distracting,
make the reader feel they need to flip back but they don't really, here -->
<!-- Ok, guess we went too far then! I've been adding *more* cross referencing
so that the reader can go back if they've forgotten something we've already
covered. /Carol -->

<!--Oh! I see, de-reference, meaning we cut the tie between the data and the
reference? I've assumed so above, please correct if not! -->
<!-- I wouldn't describe it as "cutting the tie"; the tie is still there. It's
more like we're following an arrow (the pointer) to find the value. Let us know
if this explanation is still unclear. /Carol -->

常规引用是一个指针类型，一种理解指针的方式是将其看成指向储存在其他某处值的箭头。在示例 15-8 中，创建了一个 `i32` 值的引用接着使用解引用运算符来跟踪所引用的数据：

<!-- We'll start with an example of dereferencing and re-allocating references
to `i32` values: -->
<!-- Is this what this is an example of? -->
<!-- No, there isn't any re-allocation happening here; allocation is a term
that means asking for more space in order to hold data (as we covered in
chapter 4). What were you trying to convey with "re-allocating", exactly? Have
we addressed whatever was confusing here before? /Carol -->

<!-- We've reworked the following sections in this chapter heavily because the
`Mp3` example seemed to be confusing with the metadata that was involved.
Interested to see if this breakdown works better or not. /Carol -->

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 5;
    let y = &x;

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

<span class="caption">示例 15-8：使用解引用运算符来跟踪 `i32` 值的引用</span>

变量 `x` 存放了一个 `i32` 值 `5`。`y` 等于 `x` 的一个引用。可以断言 `x` 等于 `5`。然而，如果希望对 `y` 的值做出断言，必须使用 `*y` 来追踪引用所指向的值（也就是 **解引用**）。一旦解引用了 `y`，就可以访问 `y` 所指向的整型值并可以与 `5` 做比较。

相反如果尝试编写 `assert_eq!(5, y);`，则会得到如下编译错误：

```text
error[E0277]: the trait bound `{integer}: std::cmp::PartialEq<&{integer}>` is
not satisfied
 --> src/main.rs:6:5
  |
6 |     assert_eq!(5, y);
  |     ^^^^^^^^^^^^^^^^^ can't compare `{integer}` with `&{integer}`
  |
  = help: the trait `std::cmp::PartialEq<&{integer}>` is not implemented for
  `{integer}`
```

不允许比较数字的引用与数字，因为它们是不同的类型。必须使用 `*` 追踪引用所指向的值。

### 像引用一样使用 `Box<T>`

可以重写示例 15-8 中的代码来使用 `Box<T>` 而不是引用，同时借引用运算符也一样能工作，如示例 15-9 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

<span class="caption">示例 15-9：在 `Box<i32>` 上使用解引用运算符</span>

相比示例 15-8 唯一修改的地方就是将 `y` 设置为一个指向 `x` 值的 box 实例，而不是指向 `x` 值的引用。在最后的断言中，可以使用解引用运算符以 `y` 为引用时相同的方式追踪 box 的指针。让我们通过实现自己的 box 类型来探索 `Box<T>` 能这么做有何特殊之处。

### 自定义智能指针

为了体会默认智能指针的行为不同于引用，让我们创建一个类似于标准库提供的 `Box<T>` 类型的智能指针。接着会学习如何增加使用解引用运算符的功能。

从根本上说，`Box<T>` 被定义为包含一个元素的元组结构体，所以示例 15-10 以相同的方式定义了 `MyBox<T>` 类型。我们还定义了 `new` 函数来对应定义于 `Box<T>` 的 `new` 函数：

<span class="filename">文件名: src/main.rs</span>

```rust
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}
```

<span class="caption">示例 15-10：定义 `MyBox<T>` 类型</span>

这里定义了一个结构体 `MyBox` 并声明了一个泛型 `T`，因为我们希望其可以存放任何类型的值。`MyBox` 是一个包含 `T` 类型元素的元组结构体。`MyBox::new` 函数获取一个 `T` 类型的参数并返回一个存放传入值的 `MyBox` 实例。

尝试将示例 15-9 中的代码加入示例 15-10 中并修改 `main` 使用我们定义的 `MyBox<T>` 类型代替 `Box<T>`。示例 15-11 中的代码不能编译，因为 Rust 不知道如何解引用 `MyBox`：

<span class="filename">文件名: src/main.rs</span>

```rust,ignore
fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

<span class="caption">示例 15-11：尝试以使用引用和 `Box<T>` 相同的方式使用 `MyBox<T>`</span>

得到的编译错误是：

```text
error: type `MyBox<{integer}>` cannot be dereferenced
  --> src/main.rs:14:19
   |
14 |     assert_eq!(5, *y);
   |                   ^^
```

`MyBox<T>` 类型不能解引用我们并没有为其实现这个功能。为了启用 `*` 运算符的解引用功能，可以实现 `Deref` trait。

### 实现 `Deref` trait 定义如何像引用一样对待某类型

如第十章所讨论的，为了实现 trait，需要提供 trait 所需的方法实现。`Deref` trait，由标准库提供，要求实现名为 `deref` 的方法，其借用 `self` 并返回一个内部数据的引用。示例 15-12 包含定义于 `MyBox` 之上的 `Deref` 实现：

<span class="filename">文件名: src/main.rs</span>

```rust
use std::ops::Deref;

# struct MyBox<T>(T);
impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}
```

<span class="caption">示例 15-12：`MyBox<T>` 上的 `Deref` 实现</span>

`type Target = T;` 语法定义了用于此 trait 的关联类型。关联类型是一个稍有不同的定义泛型参数的方式，现在还无需过多的担心它；第十九章会详细介绍。

<!-- Is it possible to just use a method for declaring a generic parameter we
have seen before, so we can focus on the deref trait here? -->
<!-- No, this is how the `Deref` trait is defined in the standard library, so
this is what you have to specify in order to implement it. /Carol -->

`deref` 方法体中写入了 `&self.0`，这样 `deref` 返回了我希望通过 `*` 运算符访问的值的引用。示例 15-11 中的 `main` 函数中对 `MyBox<T>` 值的 `*` 调用现在可以编译并能通过断言了！

没有 `Deref` trait 的话，编译器只能解引用 `&` 引用。`Deref` trait 的 `deref` 方法为编译器提供了获取任何实现了 `Deref` 的类型值的能力，为了获取其知道如何解引用的 `&` 引用编译器可以调用 `deref` 方法。

当我们在示例 15-11 中输入 `*y` 时，Rust 事实上在底层运行了如下代码：

```rust,ignore
*(y.deref())
```

<!-- why is that happening behind the scenes, rather than us just calling this
up front? -->
<!-- we've tried to clarify below /Carol -->

Rust 将 `*` 运算符替换为 `deref` 方法调用和一个普通解引用，如此我们便无需担心是否需要调用 `deref` 方法。Rust 的这个功能让我们可以编写同时处理常规引用或实现了 `Deref` 的类型的代码。

`deref` 方法返回值的引用，以及 `*(y.deref())` 括号外边的普通解引用仍为必须的原因在于所有权。如果 `deref` 方法直接返回值而不是值的引用，其值（的所有权）将被移出 `self`。在这里以及大部分使用解引用运算符的情况下我们并不希望获取 `MyBox<T>` 内部值的所有权。

注意将 `*` 替换为 `deref` 调用和 `*` 调用的过程在每次使用 `*` 的时候都会发生一次。`*` 的替换并不会无限递归进行。最终的数据类型是 `i32`，它与示例 15-11 中 `assert_eq!` 的 `5` 相匹配。


### 函数和方法的隐式解引用强制多态

<!--Below -- "A deref coercion happens when..." So this isn't something the
reader is making happen, but something that just happens behind the scene? If
not, can you change this to an active tone? -->
<!-- Yes, it is something that happens behind the scenes, which is why we
describe it as implicit. /Carol -->

**解引用强制多态**（*deref coercions*）是 Rust 出于方便的考虑作用于函数或方法的参数的。其将实现了 `Deref` 的类型的引用转换为 `Deref` 所能够将原始类型转换的类型的引用。解引用强制多态发生于当作为参数传递给函数或方法的特定类型的引用不同于函数或方法签名中定义参数类型的时候，这时会有一系列的 `deref` 方法调用会将提供的类型转换为参数所需的类型。

解引用强制多态的加入使得 Rust 程序员编写函数和方法调用时无需增加过多显式使用 `&` 和 `*` 的引用和解引用。这个功能也使得我们可以编写更多同时作用于引用或智能指针的代码。

作为展示解引用强制多态的实例，让我们使用示例 15-10 中定义的 `MyBox<T>`，以及示例 15-12 中增加的 `Deref` 实现。示例 15-13 展示了一个有着字符串 slice 参数的函数定义：

<span class="filename">文件名: src/main.rs</span>

```rust
fn hello(name: &str) {
    println!("Hello, {}!", name);
}
```

<span class="caption">示例 15-13：`hello` 函数有着 `&str` 类型的参数 `name`</span>

可以使用字符串 slice 作为参数调用 `hello` 函数，比如 `hello("Rust");`。解引用强制多态使得用 `MyBox<String>` 类型值的引用调用 `hello` 称为可能，如示例 15-14 所示：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::ops::Deref;
#
# struct MyBox<T>(T);
#
# impl<T> MyBox<T> {
#     fn new(x: T) -> MyBox<T> {
#         MyBox(x)
#     }
# }
#
# impl<T> Deref for MyBox<T> {
#     type Target = T;
#
#     fn deref(&self) -> &T {
#         &self.0
#     }
# }
#
# fn hello(name: &str) {
#     println!("Hello, {}!", name);
# }
#
fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&m);
}
```

<span class="caption">示例 15-14：因为解引用强制多态，使用 `MyBox<String>` 的引用调用 `hello` 是可行的</span>

这里使用 `&m` 调用 `hello` 函数，其为 `MyBox<String>` 值的引用。因为示例 15-12 中在 `MyBox<T>` 上实现了 `Deref` trait，Rust 可以通过 `deref` 调用将 `&MyBox<String>` 变为 `&String`。标准库中提供了 `String` 上的 `Deref` 实现，其会返回字符串 slice，这可以在 `Deref` 的 API 文档中看到。Rust 再次调用 `deref` 将 `&String` 变为 `&str`，这就符合 `hello` 函数的定义了。

如果 Rust 没有实现解引用强制多态，为了使用 `&MyBox<String>` 类型的值调用 `hello`，则不得不编写示例 15-15 中的代码来代替示例 15-14：

<span class="filename">文件名: src/main.rs</span>

```rust
# use std::ops::Deref;
#
# struct MyBox<T>(T);
#
# impl<T> MyBox<T> {
#     fn new(x: T) -> MyBox<T> {
#         MyBox(x)
#     }
# }
#
# impl<T> Deref for MyBox<T> {
#     type Target = T;
#
#     fn deref(&self) -> &T {
#         &self.0
#     }
# }
#
# fn hello(name: &str) {
#     println!("Hello, {}!", name);
# }
#
fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello(&(*m)[..]);
}
```

<span class="caption">示例 15-15：如果 Rust 没有解引用强制多态则必须编写的代码</span>

`(*m)` 将 `MyBox<String>` 解引用为 `String`。接着 `&` 和 `[..]` 获取了整个 `String` 的字符串 slice 来匹配 `hello` 的签名。没有解引用强制多态所有这些符号混在一起将更难以读写和理解。解引用强制多态使得 Rust 自动的帮我们处理这些转换。

当所涉及到的类型定义了 `Deref` trait，Rust 会分析这些类型并使用任意多次 `Deref::deref` 调用以获得匹配参数的类型。这些解析都发生在编译时，所以利用解引用强制多态并没有运行时惩罚！

### 解引用强制多态如何与可变性交互

<!-- below: are we talking about any mutable references, or are we talking
about mutable generic types, below? Can you make sure it's clear throughout, I
wasn't 100% -->
<!-- I'm not sure what you're asking, *types* don't have the property of
mutability or immutability, it's the variables or references to *instances* of
those types that are mutable or immutable. Also the way to say "any mutable
reference" is with `&mut` and a generic type parameter. Is that what's
confusing? /Carol -->

类似于如何使用 `Deref` trait 重载不可变引用的 `*` 运算符，Rust 提供了 `DerefMut` trait 用于重载可变引用的 `*` 运算符。

Rust 在发现类型和 trait 实现满足三种情况时会进行解引用强制多态：

<!-- Would it make sense to move this list to the start of the deref section?
-->
<!-- I don't think this list makes very much sense until you understand what
deref coercion *is*. Can you elaborate on why you think it should be moved to
the beginning? /Carol -->

* 当 `T: Deref<Target=U>` 时从 `&T` 到 `&U`。
* 当 `T: DerefMut<Target=U>` 时从 `&mut T` 到 `&mut U`。
* 当 `T: Deref<Target=U>` 时从 `&mut T` 到 `&U`。

头两个情况除了可变性之外是相同的：第一种情况表明如果有一个 `&T`，而 `T` 实现了返回 `U` 类型的 `Deref`，则可以直接得到 `&U`。第二种情况表明对于可变引用也有着相同的行为。

最后一个情况有些微妙：Rust 也会将可变引用强转为不可变引用。但是反之是 **不可能** 的：不可变引用永远也不能强转为可变引用。因为根据借用规则，如果有一个可变引用，其必须是这些数据的唯一引用（否则程序将无法编译）。将一个可变引用转换为不可变引用永远也不会打破借用规则。将不可变引用转换为可变引用则需要数据只能有一个不可变引用，而借用规则无法保证这一点。因此，Rust 无法假设将不可变引用转换为可变引用是可能的。

<!-- Why does it coerce to an immutable reference, and why cant it go the other
way?-->
<!-- Elaborated above /Carol-->
