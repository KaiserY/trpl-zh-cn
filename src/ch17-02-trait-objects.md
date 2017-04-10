## 为使用不同类型的值而设计的Trait对象

> [ch17-02-trait-objects.md](https://github.com/rust-lang/book/blob/master/second-edition/src/ch17-02-trait-objects.md)
> <br>
> commit 872dc793f7017f815fb1e5389200fd208e12792d

 在第8章，我们谈到了vector的局限是vectors只能存储同种类型的元素。我们在Listing 8-1有一个例子，其中定义了一个`SpreadsheetCell` 枚举类型，可以存储整形、浮点型和text，这样我们就可以在每个cell存储不同的数据类型了，同时还有一个代表一行cell的vector。当我们的代码编译的时候，如果交换地处理的各种东西是固定的类型是已知的，那么这是可行的。 

```
<!-- The code example I want to reference did not have a listing number; it's
the one with SpreadsheetCell. I will go back and add Listing 8-1 next time I
get Chapter 8 for editing. /Carol -->
```

有时，我们想我们使用的类型集合是可扩展的，可以被使用我们的库的程序员扩展。比如很多图形化接口工具有一个条目列表，从这个列表迭代和调用draw方法在每个条目上。我们将要创建一个库crate，包含称为`rust_gui`的CUI库的结构体。我们的GUI库可以包含一些给开发者使用的类型，比如`Button`或者`TextField`。使用`rust_gui`的程序员会创建更多可以在屏幕绘图的类型：一个程序员可能会增加`Image`，另外一个可能会增加`SelectBox`。我们不会在本章节实现一个完善的GUI库，但是我们会展示如何把各部分组合在一起。

当要写一个`rust_gui`库时，我们不知道其他程序员要创建什么类型，所以我们无法定义一个`enum`来包含所有的类型。我们知道的是`rust_gui`需要有能力跟踪所有这些不同类型的大量的值，需要有能力在每个值上调用`draw`方法。我们的GUI库不需要确切地知道当调用`draw`方法时会发生什么，只要值有可用的方法供我们调用就可以。

在有继承的语言里，我们可能会定义一个名为`Component`的类，该类上有一个`draw`方法。其他的类比如`Button`、`Image`和`SelectBox`会从`Component`继承并继承`draw`方法。它们会各自覆写`draw`方法来自定义行为，但是框架会把所有的类型当作是`Component`的实例，并在它们上调用`draw`。

## 定义一个带有自定义行为的Trait

不过，在Rust语言中，我们可以定义一个名为`Draw`的trait，其上有一个名为`draw`的方法。我们定义一个带有*trait对象*的vector，绑定了一种指针的trait，比如`&`引用或者一个`Box<T>`智能指针。

我们提到，我们不会调用结构体和枚举的对象，从而区分于其他语言的对象。在结构体的数据或者枚举的字段和`impl`块中的行为是分开的，而其他语言则是数据和行为被组合到一个概念里。Trait对象更像其他语言的对象，在这种场景下，他们组合了由指针组成的数据到实体对象，该对象带有在trait中定义的方法行为。但是，trait对象是和其他语言是不同的，因为我们不能向一个trait对象增加数据。trait对象不像其他语言那样有用：它们的目的是允许从公有的行为上抽象。

trait定义了在给定场景下我们所需要的行为。在我们会使用一个实体类型或者一个通用类型的地方，我们可以把trait当作trait对象使用。Rust的类型系统会保证我们为trait对象带入的任何值会实现trait的方法。我们不需要在编译阶段知道所有可能的类型，我们可以把所有的实例统一对待。Listing 17-03展示了如何定义一个名为`Draw`的带有`draw`方法的trait。

<span class="filename">Filename: src/lib.rs</span>

```rust
pub trait Draw {
    fn draw(&self);
}
```

<span class="caption">Listing 17-3:`Draw` trait的定义</span>

<!-- NEXT PARAGRAPH WRAPPED WEIRD INTENTIONALLY SEE #199 -->

因为我们已经在第10章讨论过如何定义trait，你可能比较熟悉。下面是新的定义：Listing 17-4有一个名为`Screen`的结构体，里面有一个名为`components`的vector，`components`的类型是Box<Draw>。`Box<Draw>`是一个trait对象：它是一个任何`Box`内部的实现了`Draw`trait的类型的替身。

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

这是区别于定义一个使用带有trait绑定的通用类型参数的结构体。通用类型参数一次只能被一个实体类型替代，而trait对象可以在运行时允许多种实体类型填充trait对象。比如，我们已经定义了`Screen`结构体使用通用类型和一个trait绑定，如Listing 17-6所示：

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
 
这个例子只能使我们有一个`Screen`实例，这个实例有一个组件列表，所有的组件类型是`Button`或者`TextField`。如果你有同种的集合，那么可以优先使用通用和trait绑定，这是因为为了使用具体的类型，定义是在编译阶段是单一的。

而如果使用内部有`Vec<Box<Draw>>` trait对象的列表的`Screen`结构体，`Screen`实例可以同时包含`Box<Button>`和`Box<TextField>`的`Vec`。我们看它是怎么工作的，然后讨论运行时性能的实现。

###　来自我们或者库使用者的实现

现在，我们增加一些实现了`Draw`trait的类型。我们会再次提供`Button`，实际上实现一个GUI库超出了本书的范围，所以`draw`方法的内部不会有任何有用的实现。为了想象一下实现可能的样子，`Button`结构体可能有 width`、`height`和`label`字段，如Listing 17-7所示：

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

<span class="caption">Listing 17-7: A `Button` struct that implements the
`Draw` trait</span>

在`Button`上的 `width`、`height`和`label`会和其他组件不同，比如`TextField`可能有`width`、`height`,
`label`和 `placeholder`字段。每个我们可以在屏幕上绘制的类型会实现`Draw`trait，在`draw`方法中使用不同的代码，定义了如何绘制`Button`（GUI代码的具体实现超出了本章节的范围）。除了`Draw` trait，`Button`可能也有另一个`impl`块，包含了当按钮被点击的时候的响应方法。这类方法不适用于`TextField`这样的类型。

有时，使用我们的库决定了实现一个包含`width`、`height`和`options``SelectBox`结构体。它们在`SelectBox`类型上实现了`Draw`trait，如 Listing 17-8所示：

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

The user of our library can now write their `main` function to create a
`Screen` instance and add a `SelectBox` and a `Button` to the screen by putting
each in a `Box<T>` to become a trait object. They can then call the `run`
method on the `Screen` instance, which will call `draw` on each of the
components. Listing 17-9 shows this implementation:

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

<span class="caption">Listing 17-9: Using trait objects to store values of
different types that implement the same trait</span>

Even though we didn't know that someone would add the `SelectBox` type someday,
our `Screen` implementation was able to operate on the `SelectBox` and draw it
because `SelectBox` implements the `Draw` type, which means it implements the
`draw` method.

Only being concerned with the messages a value responds to, rather than the
value's concrete type, is similar to a concept called *duck typing* in
dynamically typed languages: if it walks like a duck, and quacks like a duck,
then it must be a duck! In the implementation of `run` on `Screen` in Listing
17-5, `run` doesn't need to know what the concrete type of each component is.
It doesn't check to see if a component is an instance of a `Button` or a
`SelectBox`, it just calls the `draw` method on the component. By specifying
`Box<Draw>` as the type of the values in the `components` vector, we've defined
that `Screen` needs values that we can call the `draw` method on.

The advantage with using trait objects and Rust's type system to do duck typing
is that we never have to check that a value implements a particular method at
runtime or worry about getting errors if a value doesn't implement a method but
we call it. Rust won't compile our code if the values don't implement the
traits that the trait objects need.

For example, Listing 17-10 shows what happens if we try to create a `Screen`
with a `String` as a component:

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

<span class="caption">Listing 17-10: Attempting to use a type that doesn't
implement the trait object's trait</span>

We'll get this error because `String` doesn't implement the `Draw` trait:

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

This lets us know that either we're passing something we didn't mean to pass to
`Screen` and we should pass a different type, or we should implement `Draw` on
`String` so that `Screen` is able to call `draw` on it.

### Trait Objects Perform Dynamic Dispatch

Recall in Chapter 10 when we discussed the process of monomorphization that the
compiler performs when we use trait bounds on generics: the compiler generates
non-generic implementations of functions and methods for each concrete type
that we use in place of a generic type parameter. The code that results from
monomorphization is doing *static dispatch*: when the method is called, the
code that goes with that method call has been determined at compile time, and
looking up that code is very fast.

When we use trait objects, the compiler can't perform monomorphization because
we don't know all the types that might be used with the code. Instead, Rust
keeps track of the code that might be used when a method is called and figures
out at runtime which code needs to be used for a particular method call. This
is known as *dynamic dispatch*, and there's a runtime cost when this lookup
happens. Dynamic dispatch also prevents the compiler from choosing to inline a
method's code, which prevents some optimizations. We did get extra flexibility
in the code that we wrote and were able to support, though, so it's a tradeoff
to consider.

### Object Safety is Required for Trait Objects

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
