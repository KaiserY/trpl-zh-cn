## 为使用不同类型的值而设计的 trait 对象

> [ch17-02-trait-objects.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-02-trait-objects.md)
> <br>
> commit 67876e3ef5323ce9d394f3ea6b08cb3d173d9ba9

 在第八章，我们谈到了 vector 的局限是 vector 只能存储同种类型的元素。在列表 8-1 中有一个例子，其中定义了一个有存放整型、浮点型和文本的成员的枚举类型`SpreadsheetCell`，这样就可以在每一个单元格储存不同类型的数据并使得 vector 仍让代表一行单元格。这在那类代码被编译时就知晓需要可交换处理的数据的类型是一个固定集合的情况下是可行的。

<!-- The code example I want to reference did not have a listing number; it's
the one with SpreadsheetCell. I will go back and add Listing 8-1 next time I
get Chapter 8 for editing. /Carol -->

有时，我们想我们使用的类型集合是可扩展的，可以被使用我们的库的程序员扩展。比如很多图形化接口工具有一个条目列表，从这个列表迭代和调用draw方法在每个条目上。我们将要创建一个库crate，包含称为`rust_gui`的CUI库的结构体。我们的GUI库可以包含一些给开发者使用的类型，比如`Button`或者`TextField`。使用`rust_gui`的程序员会创建更多可以在屏幕绘图的类型：一个程序员可能会增加`Image`，另外一个可能会增加`SelectBox`。我们不会在本章节实现一个完善的GUI库，但是我们会展示如何把各部分组合在一起。

当要写一个`rust_gui`库时，我们不知道其他程序员要创建什么类型，所以我们无法定义一个`enum`来包含所有的类型。我们知道的是`rust_gui`需要有能力跟踪所有这些不同类型的大量的值，需要有能力在每个值上调用`draw`方法。我们的GUI库不需要确切地知道当调用`draw`方法时会发生什么，只要值有可用的方法供我们调用就可以。

在有继承的语言里，我们可能会定义一个名为`Component`的类，该类上有一个`draw`方法。其他的类比如`Button`、`Image`和`SelectBox`会从`Component`继承并继承`draw`方法。它们会各自覆写`draw`方法来自定义行为，但是框架会把所有的类型当作是`Component`的实例，并在它们上调用`draw`。

### 定义一个带有自定义行为的Trait

不过，在Rust语言中，我们可以定义一个名为`Draw`的trait，其上有一个名为`draw`的方法。我们定义一个带有*trait对象*的vector，绑定了一种指针的trait，比如`&`引用或者一个`Box<T>`智能指针。

我们提到，我们不会称结构体和枚举为对象，这是为了区分于其他语言的结构体和枚举对象。结构体或者枚举成员中的数据和`impl`块中的行为是分开的，而其他语言则是数据和行为被组合到一个被称作对象的概念里。Trait对象更像其他语言的对象，之所以这样说是因为，他们把由其指针所指向的具体对象作为数据，把在trait中定义的方法作为行为，组合在了一起。但是，trait对象和其他语言是不同的，因为我们不能向一个trait对象增加数据。trait对象不像其他语言那样有用：它们的目的是允许从公有的行为上抽象。

trait定义了在给定情况下我们所需要的行为。在我们需要使用一个实体类型或者一个通用类型的地方，我们可以把trait当作trait对象使用。Rust的类型系统会保证我们为trait对象带入的任何值会实现trait的方法。我们不需要在编译阶段知道所有可能的类型，我们可以把所有的实例统一对待。Listing 17-03展示了如何定义一个名为`Draw`的带有`draw`方法的trait。

<span class="filename">Filename: src/lib.rs</span>

```rust
pub trait Draw {
    fn draw(&self);
}
```

<span class="caption">Listing 17-3:`Draw` trait的定义</span>

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

因为我们已经在第10章讨论过如何定义trait，你可能比较熟悉。下面是新的定义：Listing 17-4有一个名为`Screen`的结构体，里面有一个名为`components`的vector，`components`的类型是Box<Draw>。`Box<Draw>`是一个trait对象：它是`Box`内部任意一个实现了`Draw`trait的类型的替身。

<span class="filename">Filename: src/lib.rs</span>

```rust
# pub trait Draw {
#     fn draw(&self);
# }
#
pub struct Screen {
    pub components: Vec<Box<Draw>>,
}
```

<span class="caption">Listing 17-4: 定义一个`Screen`结构体，带有一个含有实现了`Draw`trait的`components` vector成员

</span>

在`Screen`结构体上，我们将要定义一个`run`方法，该方法会在它的`components`上调用`draw`方法，如Listing 17-5所示：

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 17-5:在`Screen`上实现一个`run`方法，该方法在每个组件上调用`draw`方法
</span>

这不同于定义一个使用带有trait限定的泛型参数的结构体。泛型参数一次只能被一个实体类型替代，而trait对象可以在运行时允许多种实体类型填充trait对象。比如，我们已经定义了`Screen`结构体使用泛型和一个trait限定，如Listing 17-6所示：

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 17-6: 一种`Screen`结构体的替代实现，它的`run`方法使用通用类型和trait绑定
</span>
 
这个例子只能使我们的`Screen`实例的所有组件类型全是`Button`，或者全是`TextField`。如果你的组件集合是单一类型的，那么可以优先使用泛型和trait限定，这是因为其使用的具体类型在编译阶段可以被定意为是单一的。

而如果使用内部有`Vec<Box<Draw>>` trait对象的列表的`Screen`结构体，`Screen`实例可以同时包含`Box<Button>`和`Box<TextField>`的`Vec`。我们看它是怎么工作的，然后讨论运行时性能的实现。

### 来自我们或者库使用者的实现

现在，我们增加一些实现了`Draw`trait的类型。我们会再次提供`Button`，实际上实现一个GUI库超出了本书的范围，所以`draw`方法的内部不会有任何有用的实现。为了想象一下实现可能的样子，`Button`结构体可能有 `width`、`height`和`label`字段，如Listing 17-7所示：

<span class="filename">Filename: src/lib.rs</span>

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

<span class="caption">Listing 17-7: 实现了`Draw` trait的`Button` 结构体</span>

在`Button`上的 `width`、`height`和`label`会和其他组件不同，比如`TextField`可能有`width`、`height`,
`label`和 `placeholder`字段。每个我们可以在屏幕上绘制的类型会实现`Draw`trait，在`draw`方法中使用不同的代码，定义了如何绘制`Button`（GUI代码的具体实现超出了本章节的范围）。除了`Draw` trait，`Button`可能也有另一个`impl`块，包含了当按钮被点击的时候的响应方法。这类方法不适用于`TextField`这样的类型。

假定使用了我们的库的程序员决定实现一个包含`width`、`height`和`options`的`SelectBox`结构体。同时也在`SelectBox`类型上实现了`Draw`trait，如 Listing 17-8所示：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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

<span class="caption">Listing 17-8: 另外一个crate中，在`SelectBox`结构体上使用`rust_gui`和实现了`Draw` trait
</span>

我们的库的使用者现在可以写他们的`main`函数来创建一个`Screen`实例，然后通过把自身放入`Box<T>`变成trait对象，向screen增加`SelectBox` 和`Button`。他们可以在这个`Screen`实例上调用`run`方法，这又会调用每个组件的`draw`方法。 Listing 17-9展示了实现：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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

<span class="caption">Listing 17-9: 使用trait对象来存储实现了相同trait的不同类型
</span>

虽然我们不知道有人会在哪一天增加这个`SelectBox`类型，但是我们的`Screen` 能够操作`SelectBox`并绘制它，因为`SelectBox`实现了`Draw`类型，这意味着它实现了`draw`方法。

只关心值响应的消息，而不关心值的具体类型，这类似于动态类型语言中的*duck typing*：如果它像鸭子一样走路，像鸭子一样叫，那么它肯定是只鸭子！在Listing 17-5 `Screen`的`run`方法实现中，`run`不需要知道每个组件的具体类型。它也不检查一个组件是`Button`或者`SelectBox`的实例，只是调用组件的`draw`方法即可。通过指定`Box<Draw>`作为`components`列表中的值类型，我们限定了 `Screen` 需要这些实现了`draw`方法的值。

使用trait对象和支持duck typing的Rust类型系统的好处是，我们永远不需要在运行时检查一个值是否实现了一个特殊方法，或者担心因为调用了一个值没有实现的方法而遇到错误。如果值没有实现trait对象需要的trait（方法），Rust不会编译我们的代码。

比如，Listing 17-10展示了当我们创建一个使用`String`做为其组件的`Screen`时发生的情况：

<span class="filename">Filename: src/main.rs</span>

```rust,ignore
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

<span class="caption">Listing 17-10: 尝试使用一种没有实现trait对象的trait的类型

</span>

我们会遇到这个错误，因为`String`没有实现 `Draw`trait：

```text
error[E0277]: the trait bound `std::string::String: Draw` is not satisfied
  -->
   |
 4 |             Box::new(String::from("Hi")),
   |             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `Draw` is not
   implemented for `std::string::String`
   |
   = note: required for the cast to the object type `Draw`
```

这个报错让我们知道，要么我们传入了本来不想传给`Screen`的东西，而实际我们应该传入一个不同的类型，或者是我们应该在`String`上实现`Draw`，这样，`Screen`才能调用它的`draw`方法。

### Trait对象执行动态分发

回忆一下第10章，我们讨论过当我们在泛型上使用trait限定时，编译器执行单类型的处理过程：在我们需要使用范型参数的地方，编译器为每个实体类型产生了非泛型的函数实现和方法。这个单类型的处理过程产生的代码实际做的就是 *static dispatch*：当方法被调用时，因为方法的代码在编译阶段就已经决定了，所以寻找那段代码是非常快速的。

当我们使用trait对象，编译器不能执行单类型的处理过程，因为我们不知道代码使用的所有可能类型。另一方面，当方法被调用的时候，Rust跟踪可能被使用的代码，然后在运行时找出该方法被调用时应该被使用那些代码。这也是我们熟知的*dynamic dispatch*，当查找发生时会产生运行时资源消耗。动态分发也会阻止编译器选择生成内联函数的代码，从而失去了一些优化。虽然我们写代码时得到了额外的灵活性，不过，这仍然是一个需要考虑的取舍问题。

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

Not all traits can be made into trait objects; only *object safe* traits can. A
trait is object safe as long as both of the following are true:

* The trait does not require `Self` to be `Sized`
* All of the trait's methods are object safe.

`Self` is a keyword that is an alias for the type that we're implementing
traits or methods on. `Sized` is a marker trait like the `Send` and `Sync`
traits that we talked about in Chapter 16. `Sized` is automatically implemented
on types that have a known size at compile time, such as `i32` and references.
Types that do not have a known size include slices (`[T]`) and trait objects.

`Sized` is an implicit trait bound on all generic type parameters by default.
Most useful operations in Rust require a type to be `Sized`, so making `Sized`
a default requirement on trait bounds means we don't have to write `T: Sized`
with most every use of generics. If we want to be able to use a trait on
slices, however, we need to opt out of the `Sized` trait bound, and we can do
that by specifying `T: ?Sized` as a trait bound.

Traits have a default bound of `Self: ?Sized`, which means that they can be
implemented on types that may or may not be `Sized`. If we create a trait `Foo`
that opts out of the `Self: ?Sized` bound, that would look like the following:

```rust
trait Foo: Sized {
    fn some_method(&self);
}
```

The trait `Sized` is now a *super trait* of trait `Foo`, which means trait
`Foo` requires types that implement `Foo` (that is, `Self`) to be `Sized`.
We're going to talk about super traits in more detail in Chapter 19.

The reason a trait like `Foo` that requires `Self` to be `Sized` is not allowed
to be a trait object is that it would be impossible to implement the trait
`Foo` for the trait object `Foo`: trait objects aren't sized, but `Foo`
requires `Self` to be `Sized`. A type can't be both sized and unsized at the
same time!

For the second object safety requirement that says all of a trait's methods
must be object safe, a method is object safe if either:

* It requires `Self` to be `Sized` or
* It meets all three of the following:
    * It must not have any generic type parameters
    * Its first argument must be of type `Self` or a type that dereferences to
      the Self type (that is, it must be a method rather than an associated
      function and have `self`, `&self`, or `&mut self` as the first argument)
    * It must not use `Self` anywhere else in the signature except for the
      first argument

Those rules are a bit formal, but think of it this way: if your method requires
the concrete `Self` type somewhere in its signature, but an object forgets the
exact type that it is, there's no way that the method can use the original
concrete type that it's forgotten. Same with generic type parameters that are
filled in with concrete type parameters when the trait is used: the concrete
types become part of the type that implements the trait. When the type is
erased by the use of a trait object, there's no way to know what types to fill
in the generic type parameters with.

An example of a trait whose methods are not object safe is the standard
library's `Clone` trait. The signature for the `clone` method in the `Clone`
trait looks like this:

```rust
pub trait Clone {
    fn clone(&self) -> Self;
}
```

`String` implements the `Clone` trait, and when we call the `clone` method on
an instance of `String` we get back an instance of `String`. Similarly, if we
call `clone` on an instance of `Vec`, we get back an instance of `Vec`. The
signature of `clone` needs to know what type will stand in for `Self`, since
that's the return type.

If we try to implement `Clone` on a trait like the `Draw` trait from Listing
17-3, we wouldn't know whether `Self` would end up being a `Button`, a
`SelectBox`, or some other type that will implement the `Draw` trait in the
future.

The compiler will tell you if you're trying to do something that violates the
rules of object safety in regards to trait objects. For example, if we had
tried to implement the `Screen` struct in Listing 17-4 to hold types that
implement the `Clone` trait instead of the `Draw` trait, like this:

```rust,ignore
pub struct Screen {
    pub components: Vec<Box<Clone>>,
}
```

We'll get this error:

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
